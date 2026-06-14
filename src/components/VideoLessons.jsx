import { useEffect, useMemo, useRef, useState } from "react";

const allOption = "Tümü";
const baseExamOptions = ["TYT", "AYT"];
const baseLevelOptions = ["Başlangıç", "Orta", "İleri"];

const lessonOptionsByExam = {
  TYT: ["Türkçe", "Paragraf", "Matematik", "Geometri", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "Din"],
  AYT: ["Matematik", "Geometri", "Edebiyat", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "Din"],
};

const VIDEO_TRACKING_STORAGE_KEY = "yks-video-tracking-v51";

const emptyImportForm = {
  exam: "TYT",
  level: "Başlangıç",
  lesson: "Türkçe",
  topic: "Paragraf",
  channel: "",
  title: "",
  htmlText: "",
};

function VideoLessons({
  playlists = [],
  progress = {},
  audience = "student",
  onAddPlaylist,
  onDeletePlaylist,
  onUpdateProgress,
}) {
  const [exam, setExam] = useState(allOption);
  const [level, setLevel] = useState(allOption);
  const [lesson, setLesson] = useState(allOption);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [importForm, setImportForm] = useState(emptyImportForm);
  const [importMessage, setImportMessage] = useState("");
  const [localProgress, setLocalProgress] = useState(() => loadVideoTrackingStorage());
  const activeSessionsRef = useRef({});

  const examOptions = useMemo(() => [allOption, ...mergeUnique(baseExamOptions, playlists.map((playlist) => playlist.exam))], [playlists]);
  const levelOptions = useMemo(() => [allOption, ...mergeUnique(baseLevelOptions, playlists.map((playlist) => playlist.level))], [playlists]);

  const lessons = useMemo(() => {
    const baseLessons = exam === allOption ? Object.values(lessonOptionsByExam).flat() : lessonOptionsByExam[exam] || [];
    const importedLessons = playlists
      .filter((playlist) => exam === allOption || playlist.exam === exam)
      .map((playlist) => playlist.lesson);
    return [allOption, ...mergeUnique(baseLessons, importedLessons)];
  }, [exam, playlists]);

  const visiblePlaylists = useMemo(() => {
    return playlists.filter((playlist) => {
      const examMatches = exam === allOption || playlist.exam === exam;
      const levelMatches = level === allOption || playlist.level === level;
      const lessonMatches = lesson === allOption || normalizeText(playlist.lesson) === normalizeText(lesson);
      return examMatches && levelMatches && lessonMatches;
    });
  }, [exam, level, lesson, playlists]);

  const selectedPlaylist = visiblePlaylists.find((playlist) => playlist.id === selectedPlaylistId) || visiblePlaylists[0] || null;
  const selectedVideo = selectedPlaylist?.videos?.find((video) => video.id === selectedVideoId) || selectedPlaylist?.videos?.[0] || null;
  const effectiveProgress = useMemo(() => ({ ...loadVideoTrackingStorage(), ...progress, ...localProgress }), [progress, localProgress]);
  const selectedProgress = selectedVideo ? effectiveProgress[selectedVideo.id] || {} : {};
  const selectedPlaylistProgress = selectedPlaylist ? calculatePlaylistProgress(selectedPlaylist, effectiveProgress) : null;
  const aggregate = calculateAggregateProgress(visiblePlaylists, effectiveProgress);
  const importPreviewVideos = useMemo(() => parseVideosFromText(importForm.htmlText), [importForm.htmlText]);

  useEffect(() => {
    if (!lessons.includes(lesson)) setLesson(allOption);
  }, [lesson, lessons]);

  useEffect(() => {
    if (!selectedPlaylist || selectedPlaylist.id === selectedPlaylistId) return;
    setSelectedPlaylistId(selectedPlaylist.id);
  }, [selectedPlaylist, selectedPlaylistId]);

  useEffect(() => {
    if (!selectedVideo || selectedVideo.id === selectedVideoId) return;
    setSelectedVideoId(selectedVideo.id);
  }, [selectedVideo, selectedVideoId]);


  const stopActiveSession = (videoId, nextStatus = "idle") => {
    const session = activeSessionsRef.current[videoId];
    if (!session) return;

    if (session.intervalId) clearInterval(session.intervalId);

    const sessionSeconds = Math.max(0, Math.floor((Date.now() - session.openedAtMs) / 1000));
    const nextWatchSeconds = session.baseWatchSeconds + sessionSeconds;

    session.saveProgress({
      openCount: session.openCount,
      watchSeconds: nextWatchSeconds,
      lastSessionSeconds: sessionSeconds,
      lastOpenedAt: session.openedAt,
      lastClosedAt: formatLocalTimestamp(new Date()),
      isWatching: false,
      status: nextStatus,
    });

    delete activeSessionsRef.current[videoId];
  };

  const stopAllActiveSessions = (nextStatus = "idle") => {
    Object.keys(activeSessionsRef.current).forEach((videoId) => stopActiveSession(videoId, nextStatus));
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        stopAllActiveSessions("idle");
      }
    };

    const handleBeforeUnload = () => stopAllActiveSessions("idle");
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      stopAllActiveSessions("idle");
    };
  }, []);

  const handleExamSelect = (nextExam) => {
    setExam(nextExam);
    setLesson(allOption);
    setSelectedPlaylistId("");
    setSelectedVideoId("");
  };

  const handleLevelSelect = (nextLevel) => {
    setLevel(nextLevel);
    setSelectedPlaylistId("");
    setSelectedVideoId("");
  };

  const handleLessonSelect = (nextLesson) => {
    setLesson(nextLesson);
    setSelectedPlaylistId("");
    setSelectedVideoId("");
  };

  const handleImportChange = (event) => {
    const { name, value } = event.target;
    setImportForm((current) => ({ ...current, [name]: value }));
  };

  const handleFileImport = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    Promise.all(files.map(readFileAsText))
      .then((fileContents) => {
        const combinedText = fileContents.map((item) => item.text).join("\n");
        const previewCount = parseVideosFromText(combinedText).length;
        const firstFileName = files[0]?.name || "";

        setImportForm((current) => ({
          ...current,
          title: current.title || firstFileName.replace(/\.(html?|txt)$/i, ""),
          htmlText: [current.htmlText, combinedText].filter(Boolean).join("\n"),
        }));
        setImportMessage(`${files.length} dosya okundu; ${previewCount} video yakalandı.`);
        event.target.value = "";
      })
      .catch(() => setImportMessage("Dosya okunamadı. HTML içeriğini metin alanına yapıştırabilirsin."));
  };

  const handleImportSubmit = (event) => {
    event.preventDefault();
    const videos = importPreviewVideos;

    if (!importForm.title.trim() || videos.length === 0) {
      setImportMessage("Başlık ve en az 1 YouTube linki gerekli.");
      return;
    }

    const firstPlaylistUrl = videos.find((video) => video.url)?.url || "";
    onAddPlaylist?.({
      exam: importForm.exam,
      level: importForm.level,
      lesson: importForm.lesson,
      topic: importForm.topic.trim(),
      channel: importForm.channel.trim(),
      title: importForm.title.trim(),
      playlistUrl: firstPlaylistUrl,
      sourceType: "Koç yükledi",
      videos,
    });

    setExam(importForm.exam);
    setLevel(importForm.level);
    setLesson(importForm.lesson);
    setImportForm(emptyImportForm);
    setImportMessage(`${videos.length} video öğrenci listesine eklendi.`);
  };

  const handleOpenVideo = (video) => {
    if (!video) return;

    const youtubeUrl = getSingleVideoUrl(video);
    if (!youtubeUrl) return;

    const youtubeWindow = window.open(youtubeUrl, `youtube_${video.id}`);
    if (!youtubeWindow) {
      alert("YouTube penceresi açılamadı. Tarayıcı açılır pencere engelini kapatmalısın.");
      return;
    }

    youtubeWindow.focus?.();
    setSelectedVideoId(video.id);

    if (activeSessionsRef.current[video.id]?.intervalId) {
      clearInterval(activeSessionsRef.current[video.id].intervalId);
    }

    const openedAt = formatLocalTimestamp(new Date());
    const current = effectiveProgress[video.id] || {};
    const baseWatchSeconds = Number(current.watchSeconds || 0);

    const saveProgress = (patch) => {
      const storageSnapshot = loadVideoTrackingStorage();
      const baseRecord = storageSnapshot[video.id] || current;
      const nextRecord = {
        ...baseRecord,
        ...patch,
        videoId: video.id,
      };

      const nextStorage = {
        ...storageSnapshot,
        [video.id]: nextRecord,
      };
      saveVideoTrackingStorage(nextStorage);

      setLocalProgress((currentLocal) => ({
        ...currentLocal,
        [video.id]: {
          ...(currentLocal[video.id] || current),
          ...nextRecord,
        },
      }));

      onUpdateProgress?.(video.id, nextRecord);
    };

    saveProgress({
      openCount: Number(current.openCount || 0) + 1,
      watchSeconds: baseWatchSeconds,
      lastSessionSeconds: 0,
      lastOpenedAt: openedAt,
      lastClosedAt: "",
      isWatching: true,
      status: "watching",
    });

    const session = {
      openedAtMs: Date.now(),
      baseWatchSeconds,
      openedAt,
      openCount: Number(current.openCount || 0) + 1,
      saveProgress,
      intervalId: null,
    };

    session.intervalId = window.setInterval(() => {
      const sessionSeconds = Math.max(0, Math.floor((Date.now() - session.openedAtMs) / 1000));
      const nextWatchSeconds = session.baseWatchSeconds + sessionSeconds;

      saveProgress({
        openCount: session.openCount,
        watchSeconds: nextWatchSeconds,
        lastSessionSeconds: sessionSeconds,
        lastOpenedAt: openedAt,
        isWatching: true,
        status: "watching",
      });
    }, 1000);

    activeSessionsRef.current[video.id] = session;
  };

  const handleOpenPlaylist = (playlist) => {
    const primaryVideo = getPlaylistPrimaryVideo(playlist);
    if (primaryVideo) handleOpenVideo(primaryVideo);
  };

  return (
    <div className="video-lessons video-lessons-v24-final">
      <div className="video-filter-row video-filter-row-final">
        <div className="video-tab-group">
          {examOptions.map((item) => (
            <button type="button" className={exam === item ? "active" : ""} onClick={() => handleExamSelect(item)} key={item}>{item}</button>
          ))}
        </div>
        <div className="video-tab-group level-filter-right">
          {levelOptions.map((item) => (
            <button type="button" className={level === item ? "active" : ""} onClick={() => handleLevelSelect(item)} key={item}>{item}</button>
          ))}
        </div>
      </div>

      <div className="video-lesson-tabs video-lesson-tabs-final">
        {lessons.map((item) => (
          <button type="button" className={lesson === item ? "active" : ""} onClick={() => handleLessonSelect(item)} key={item}>{item}</button>
        ))}
      </div>

      <div className="video-progress-summary video-summary-final">
        <div><span>Video Kütüphanesi</span><strong>{visiblePlaylists.length}/{playlists.length} liste</strong><small>Liste eksiksiz: filtreye göre görünür.</small></div>
        <div><span>Açılma</span><strong>{aggregate.openCount}</strong></div>
        <div><span>İzleme Süresi</span><strong>{formatWatchDuration(aggregate.watchSeconds)}</strong></div>
      </div>

      {audience === "coach" && (
        <form className="video-import-panel" onSubmit={handleImportSubmit}>
          <div className="section-head slim-head"><div><h3>Koç Video Listesi Yükle</h3><p>HTML dosyası, YouTube linkli metin veya manuel başlıkla liste eklenir.</p></div></div>
          <div className="video-import-grid">
            <label>Sınav<select name="exam" value={importForm.exam} onChange={handleImportChange}>{baseExamOptions.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
            <label>Seviye<select name="level" value={importForm.level} onChange={handleImportChange}>{baseLevelOptions.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
            <label>Ders<select name="lesson" value={importForm.lesson} onChange={handleImportChange}>{(lessonOptionsByExam[importForm.exam] || lessonOptionsByExam.TYT).map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
            <label>Konu<input name="topic" value={importForm.topic} onChange={handleImportChange} placeholder="Paragraf" /></label>
            <label>Kanal<input name="channel" value={importForm.channel} onChange={handleImportChange} placeholder="Rüştü Hoca" /></label>
            <label>Liste Başlığı<input name="title" value={importForm.title} onChange={handleImportChange} placeholder="0'dan Paragraf Kampı" /></label>
          </div>
          <label className="video-file-loader">HTML dosyası / dosyaları<input type="file" accept=".html,.htm,.txt" multiple onChange={handleFileImport} /></label>
          <textarea name="htmlText" value={importForm.htmlText} onChange={handleImportChange} placeholder="HTML içeriğini veya YouTube linklerini buraya yapıştır" />
          <div className="video-import-preview">
            <div><span>Yakalanan video</span><strong>{importPreviewVideos.length}</strong><small>Dosya seçilince veya HTML yapıştırılınca otomatik sayılır.</small></div>
            <div>{importPreviewVideos.slice(0, 3).map((video) => <small key={video.id}>{video.order}. {cleanTitle(video.title)}</small>)}{importPreviewVideos.length > 3 && <small>+{importPreviewVideos.length - 3} video daha</small>}</div>
          </div>
          <div className="form-actions"><button type="submit" className="yellow-btn">Listeyi Öğrenciye Ekle</button>{importMessage && <span className="form-hint">{importMessage}</span>}</div>
        </form>
      )}

      <div className="video-workspace video-workspace-final">
        <aside className="video-playlist-panel video-playlist-panel-final">
          <div className="panel-mini-title"><strong>Playlistler</strong><span>{visiblePlaylists.length} liste</span></div>
          {visiblePlaylists.length > 0 ? visiblePlaylists.map((playlist, index) => {
            const itemProgress = calculatePlaylistProgress(playlist, effectiveProgress);
            const playlistUrl = getPlaylistUrl(playlist);
            return (
              <article className={selectedPlaylist?.id === playlist.id ? "video-playlist-card final-card active" : "video-playlist-card final-card"} key={playlist.id}>
                <button type="button" className="video-playlist-select" onClick={() => setSelectedPlaylistId(playlist.id)}>
                  <span>{String(index + 1).padStart(2, "0")} · {playlist.exam} · {playlist.level} · {playlist.lesson}</span>
                  <strong>{cleanTitle(playlist.displayTitle || playlist.title)}</strong>
                  <small>{playlist.videos.length} video/link · {itemProgress.openCount} açılma · {formatWatchDuration(itemProgress.watchSeconds)} · %{itemProgress.completionRate} tamam</small>
                </button>
                {playlistUrl && (
                  <a className="small-btn neutral video-playlist-open-link" href={playlistUrl} target="_blank" rel="noreferrer" onClick={() => handleOpenPlaylist(playlist)}>
                    YouTube'da Aç
                  </a>
                )}
              </article>
            );
          }) : <div className="empty-state">Bu seçim için video listesi yok.</div>}
          {audience === "coach" && selectedPlaylist && onDeletePlaylist && <button type="button" className="small-btn danger-action full-width-action" onClick={() => onDeletePlaylist(selectedPlaylist.id)}>Seçili Listeyi Sil</button>}
        </aside>

        <section className="video-player-panel video-player-panel-final">
          {selectedPlaylist ? (
            <>
              <div className="playlist-detail-hero">
                <img className="playlist-detail-cover" src={getPlaylistCoverUrl(selectedPlaylist)} alt={`${cleanTitle(selectedPlaylist.title)} kapak`} loading="lazy" />
                <div className="playlist-detail-main">
                  <div className="playlist-detail-tags">
                    <span>{selectedPlaylist.exam || "YKS"}</span>
                    <span>{selectedPlaylist.lesson || "Ders"}</span>
                    <span>{selectedPlaylist.level || "Seviye"}</span>
                    <span>{selectedPlaylist.videos?.length || 0} video/link</span>
                  </div>
                  <h3>{cleanTitle(selectedPlaylist.displayTitle || selectedPlaylist.title)}</h3>
                  <p>{buildPlaylistDescription(selectedPlaylist)}</p>
                  <div className="playlist-level-analysis">
                    {getLevelMix(selectedPlaylist).map((item) => <LevelBar key={item.label} label={item.label} value={item.value} />)}
                  </div>
                  <div className="playlist-detail-actions">
                    <button type="button" className="yellow-btn" onClick={() => handleOpenPlaylist(selectedPlaylist)}>İlk Videoyu YouTube’da Aç</button>
                  </div>
                </div>
              </div>

              {selectedVideo ? (
                <div className="selected-video-box selected-video-box-compact">
                  <div className="selected-video-info">
                    <span>Seçili video</span>
                    <strong>{selectedVideo.order}. {cleanTitle(selectedVideo.title)}</strong>
                    <small>Açılma: {Number(selectedProgress.openCount || 0)} · Süre: {formatWatchDuration(selectedProgress.watchSeconds)} · Durum: {getProgressStatusLabel(selectedProgress)} · Son açılış: {formatDateTime(selectedProgress.lastOpenedAt)}</small>
                  </div>
                  {selectedProgress.isWatching ? (
                    <button type="button" className="small-btn danger" onClick={() => stopActiveSession(selectedVideo.id, "closed")}>Sayacı Durdur</button>
                  ) : null}
                </div>
              ) : <div className="empty-state">Video seçilmedi.</div>}
            </>
          ) : <div className="empty-state">Playlist seçilmedi.</div>}
        </section>

        <aside className="video-list-panel video-list-panel-final">
          <div className="panel-mini-title"><strong>Playlist İçindeki Videolar</strong><span>{selectedPlaylist?.videos?.length || 0} kayıt</span></div>
          {selectedPlaylist?.videos?.map((video) => {
            const itemProgress = effectiveProgress[video.id] || {};
            return (
              <article className={selectedVideo?.id === video.id ? "video-row active" : "video-row"} key={video.id}>
                <button type="button" className="video-row-main video-row-button" onClick={() => handleOpenVideo(video)}>
                  <img className="video-row-thumbnail" src={getThumbnailUrl(video, selectedPlaylist)} alt={`${cleanTitle(video.title)} küçük görseli`} loading="lazy" />
                  <div><span>{video.order}. video</span><strong>{cleanTitle(video.title)}</strong></div>
                </button>
                <small>{Number(itemProgress.openCount || 0)} açılma · {formatWatchDuration(itemProgress.watchSeconds)} · {getProgressStatusLabel(itemProgress)}</small>
                <div className="video-row-actions">
                  <button type="button" className="small-btn neutral" onClick={() => handleOpenVideo(video)}>YouTube’da Aç</button>
                  {itemProgress.isWatching ? (
                    <button type="button" className="small-btn danger" onClick={() => stopActiveSession(video.id, "closed")}>Durdur</button>
                  ) : null}
                </div>
              </article>
            );
          }) || <div className="empty-state">Video yok.</div>}
        </aside>
      </div>
    </div>
  );
}


function LevelBar({ label, value }) {
  return (
    <div className="playlist-level-bar final-level-bar">
      <span>{label}</span>
      <div><i style={{ width: `${Math.min(100, Math.max(0, Number(value || 0)))}%` }} /></div>
      <strong>%{value}</strong>
    </div>
  );
}

function loadVideoTrackingStorage() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VIDEO_TRACKING_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveVideoTrackingStorage(nextProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIDEO_TRACKING_STORAGE_KEY, JSON.stringify(nextProgress || {}));
  } catch { /* localStorage kapalıysa ana state çalışmaya devam eder */ }
}

function calculateAggregateProgress(playlists, progress) {
  const videos = playlists.flatMap((playlist) => playlist.videos || []);
  const openCount = videos.reduce((sum, video) => sum + Number(progress[video.id]?.openCount || 0), 0);
  const watchSeconds = videos.reduce((sum, video) => sum + Number(progress[video.id]?.watchSeconds || 0), 0);
  const totalEstimatedSeconds = videos.reduce((sum, video) => sum + getVideoEstimatedSeconds(video), 0);
  const completionRate = calculateCompletionRate(watchSeconds, totalEstimatedSeconds);
  return { openCount, watchSeconds, totalEstimatedSeconds, completionRate };
}

function calculatePlaylistProgress(playlist, progress) {
  const videos = playlist?.videos || [];
  const openCount = videos.reduce((sum, video) => sum + Number(progress[video.id]?.openCount || 0), 0);
  const watchSeconds = videos.reduce((sum, video) => sum + Number(progress[video.id]?.watchSeconds || 0), 0);
  const totalEstimatedSeconds = videos.reduce((sum, video) => sum + getVideoEstimatedSeconds(video), 0);
  const completionRate = calculateCompletionRate(watchSeconds, totalEstimatedSeconds);
  return { openCount, watchSeconds, totalEstimatedSeconds, completionRate };
}

function getVideoEstimatedSeconds(video = {}) {
  const explicitSeconds = Number(video.durationSeconds || 0);
  if (explicitSeconds > 0) return explicitSeconds;
  return Math.max(1, Number(video.estimatedMinutes || 25)) * 60;
}

function calculateCompletionRate(watchSeconds, totalEstimatedSeconds) {
  if (!totalEstimatedSeconds) return 0;
  return Math.min(100, Math.max(0, Math.round((Number(watchSeconds || 0) / totalEstimatedSeconds) * 100)));
}

function getProgressStatusLabel(progress = {}) {
  if (progress.isWatching || progress.status === "watching") return "İzleniyor";
  if (progress.status === "idle" || progress.lastClosedAt) return "Beklemede";
  return "Kapalı";
}

function formatWatchDuration(seconds) {
  const totalSeconds = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) return `${hours}s ${String(minutes).padStart(2, "0")}dk`;
  if (minutes > 0) return `${minutes}dk ${String(remainingSeconds).padStart(2, "0")}sn`;
  return `${remainingSeconds}sn`;
}

function parseVideosFromText(text) {
  const source = String(text || "");
  const items = [];
  const seen = new Set();

  const pushVideo = (url, rawTitle) => {
    const cleanUrl = String(url || "").replace(/&amp;/g, "&").trim();
    if (!cleanUrl || seen.has(cleanUrl)) return;
    seen.add(cleanUrl);
    const title = cleanTitle(rawTitle || "").replace(/^[-–—•\d.\s]+/, "");
    const youtubeId = extractYoutubeId(cleanUrl);
    const playlistId = extractPlaylistId(cleanUrl);
    items.push({
      id: `import-video-${items.length + 1}-${Math.random().toString(16).slice(2)}`,
      title: title || (playlistId ? "Playlisti Seç" : `Video ${items.length + 1}`),
      youtubeId,
      playlistId,
      url: cleanUrl,
      thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "",
      order: items.length + 1,
      estimatedMinutes: 25,
      videoType: playlistId && !youtubeId ? "Playlist" : "Video",
    });
  };

  if (typeof DOMParser !== "undefined" && /<a\s/i.test(source)) {
    try {
      const documentObject = new DOMParser().parseFromString(source, "text/html");
      documentObject.querySelectorAll("a[href]").forEach((anchor) => {
        if (/youtu\.be|youtube\.com/i.test(anchor.href)) pushVideo(anchor.href, anchor.textContent);
      });
    } catch { /* düz metne düş */ }
  }

  source.split(/\n+/).forEach((line) => {
    const urlMatch = line.match(/https?:\/\/[^\s"'<>]+(?:youtube\.com|youtu\.be)[^\s"'<>]*/i);
    if (urlMatch) pushVideo(urlMatch[0], line.replace(urlMatch[0], ""));
  });

  return items;
}

function getSingleVideoUrl(video = {}) {
  const youtubeId = video.youtubeId || extractYoutubeId(video.url);
  if (youtubeId) return `https://www.youtube.com/watch?v=${youtubeId}`;
  return video.url || "";
}

function getPlaylistPrimaryVideo(playlist = {}) {
  return (playlist.videos || []).find((video) => video.url) || (playlist.videos || [])[0] || null;
}

function getPlaylistUrl(playlist = {}) {
  if (playlist.playlistUrl) return playlist.playlistUrl;
  const firstVideo = getPlaylistPrimaryVideo(playlist);
  if (firstVideo?.playlistId) return `https://www.youtube.com/playlist?list=${firstVideo.playlistId}`;
  return firstVideo?.url || "";
}

function getPlaylistCoverUrl(playlist = {}) {
  const primary = getPlaylistPrimaryVideo(playlist);
  if (primary?.thumbnailUrl) return primary.thumbnailUrl;
  if (primary?.youtubeId) return `https://img.youtube.com/vi/${primary.youtubeId}/hqdefault.jpg`;
  return createSvgCover(playlist);
}

function getThumbnailUrl(video = {}, playlist = {}) {
  if (video.thumbnailUrl) return video.thumbnailUrl;
  if (video.youtubeId) return `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
  return getPlaylistCoverUrl(playlist);
}

function createSvgCover(playlist = {}) {
  const title = encodeXml(cleanTitle(playlist.displayTitle || playlist.title || "YKS Playlist"));
  const lesson = encodeXml(playlist.lesson || "Ders");
  const level = encodeXml(playlist.level || "Seviye");
  const exam = encodeXml(playlist.exam || "YKS");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="506" viewBox="0 0 900 506"><rect width="900" height="506" fill="#0f172a"/><rect x="0" y="0" width="900" height="170" fill="#ef4444"/><text x="48" y="92" font-family="Arial" font-size="54" font-weight="900" fill="#fff">${exam} ${lesson}</text><text x="48" y="145" font-family="Arial" font-size="30" font-weight="800" fill="#ffedd5">${level} Seviye</text><text x="48" y="300" font-family="Arial" font-size="42" font-weight="900" fill="#fff">${title}</text><rect x="48" y="375" width="280" height="58" rx="16" fill="#facc15"/><text x="78" y="414" font-family="Arial" font-size="27" font-weight="900" fill="#111827">YouTube Playlist</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getLevelMix(playlist = {}) {
  const value = normalizeText(`${playlist.level} ${playlist.lesson} ${playlist.title}`);
  if (value.includes("başlangıç") || value.includes("0'dan") || value.includes("temel")) return [{ label: "Başlangıç", value: 60 }, { label: "Orta", value: 30 }, { label: "İleri", value: 10 }];
  if (value.includes("ileri") || value.includes("ayt") || value.includes("deneme")) return [{ label: "Başlangıç", value: 15 }, { label: "Orta", value: 40 }, { label: "İleri", value: 45 }];
  return [{ label: "Başlangıç", value: 25 }, { label: "Orta", value: 55 }, { label: "İleri", value: 20 }];
}

function buildPlaylistDescription(playlist = {}) {
  const lesson = playlist.lesson || "ders";
  const level = playlist.level || "Orta";
  if (normalizeText(playlist.title).includes("soru bankası")) return `${lesson} için konu sonrası soru pratiği ve tekrar takibi amaçlı ${level.toLowerCase()} seviye playlist.`;
  if (normalizeText(playlist.title).includes("kamp")) return `${lesson} kamp formatında ilerleyen, haftalık plana atanabilecek ${level.toLowerCase()} seviye video listesi.`;
  return `${lesson} dersi için YouTube üzerinde açılan ${level.toLowerCase()} seviye playlist.`;
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, text: String(reader.result || "") });
    reader.onerror = reject;
    reader.readAsText(file, "utf-8");
  });
}

function cleanTitle(value = "") {
  return String(value).replace(/\s+/g, " ").replace(/&amp;/g, "&").trim();
}

function normalizeText(value = "") {
  return cleanTitle(value).toLocaleLowerCase("tr-TR");
}

function mergeUnique(items = []) {
  const seen = new Set();
  return items.filter(Boolean).filter((item) => {
    const key = normalizeText(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractYoutubeId(url = "") {
  const decoded = String(url).replace(/&amp;/g, "&");
  const direct = decoded.match(/[?&]v=([^&]+)/);
  if (direct) return direct[1];
  const short = decoded.match(/youtu\.be\/([^?&]+)/);
  if (short) return short[1];
  const embed = decoded.match(/embed\/([^?&/]+)/);
  return embed ? embed[1] : "";
}

function extractPlaylistId(url = "") {
  const decoded = String(url).replace(/&amp;/g, "&");
  const match = decoded.match(/[?&]list=([^&]+)/);
  return match ? match[1] : "";
}

function encodeXml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function formatDuration(value) {
  const totalSeconds = Math.max(0, Number(value || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  if (/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/.test(String(value))) return value;
  try { return formatLocalTimestamp(new Date(value)); }
  catch { return "-"; }
}

function formatLocalTimestamp(date) {
  const pad = (number) => String(number).padStart(2, "0");
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default VideoLessons;
