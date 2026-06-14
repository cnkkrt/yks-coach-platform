import { useState } from "react";
import { getGuidePackageSuggestions } from "../data/guidePackageData.js";
import { getSourceVideoMatches } from "../data/programAutomation.js";

const lessonOptionsByExam = {
  TYT: ["Matematik", "Türkçe", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "Din"],
  AYT: ["Matematik", "Edebiyat", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "Felsefe", "Din"],
  YDT: ["Yabancı Dil"],
};

const levelOptions = ["Başlangıç", "Orta", "İleri"];

const officialSources = [
  {
    title: "MEBİ",
    type: "Resmi platform",
    url: "https://mebi.eba.gov.tr/",
    detail: "YKS konu anlatımı, konu özeti, soru bankası, deneme/tarama ve rapor modülleri.",
  },
  {
    title: "EBA",
    type: "Resmi içerik ağı",
    url: "https://www.eba.gov.tr/",
    detail: "MEB içerikleri, etkileşimli materyaller ve ders videoları.",
  },
];

function LearningLibrary({ resources = [], audience = "student", area = "TYT" }) {
  const [exam, setExam] = useState("TYT");
  const [lesson, setLesson] = useState("Matematik");
  const [level, setLevel] = useState("Başlangıç");
  const [sourceFocus, setSourceFocus] = useState("official");
  const lessonOptions = lessonOptionsByExam[exam] || lessonOptionsByExam.TYT;
  const sourceOptions = buildSourceOptions(resources);
  const sourceValue = sourceOptions.some((option) => option.id === sourceFocus)
    ? sourceFocus
    : sourceOptions[0].id;
  const selectedSource = sourceOptions.find((option) => option.id === sourceValue) || sourceOptions[0];
  const totalUnits = resources.reduce((sum, resource) => sum + toNumber(resource.totalUnits), 0);
  const completedUnits = resources.reduce((sum, resource) => sum + toNumber(resource.completedUnits), 0);
  const resourceProgress = totalUnits > 0
    ? Math.min(100, Math.round((completedUnits / totalUnits) * 100))
    : 0;
  const youtubeLinks = getYoutubeLinks(exam, lesson, level, selectedSource);
  const guideSuggestions = getGuidePackageSuggestions({
    area,
    exam,
    lesson,
    level,
    resource: selectedSource?.query || "",
  });

  const handleExamChange = (event) => {
    const nextExam = event.target.value;
    const nextLessons = lessonOptionsByExam[nextExam] || lessonOptionsByExam.TYT;
    setExam(nextExam);
    setLesson(nextLessons[0] || "Matematik");
  };

  return (
    <div className="learning-library">
      <div className="library-control-strip">
        <label>
          Sınav
          <select value={exam} onChange={handleExamChange}>
            <option value="TYT">TYT</option>
            <option value="AYT">AYT</option>
            <option value="YDT">YDT</option>
          </select>
        </label>

        <label>
          Ders
          <select value={lesson} onChange={(event) => setLesson(event.target.value)}>
            {lessonOptions.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label>
          Seviye
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            {levelOptions.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </label>

        <label>
          Yayın / Kaynak odağı
          <select value={sourceValue} onChange={(event) => setSourceFocus(event.target.value)}>
            {sourceOptions.map((item) => (
              <option value={item.id} key={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="library-filter-note">
        <strong>{level} öneri paketi</strong>
        <span>{getLevelPurpose(level)}</span>
        <small>
          Yayın uyumu arama filtresidir; kanalın resmi yayın ilişkisi doğrulanmadıkça kesin kaynak
          etiketi olarak gösterilmez.
        </small>
      </div>

      <div className="library-progress-card">
        <div>
          <span>Kaynak ilerlemesi</span>
          <strong>%{resourceProgress}</strong>
          <small>{completedUnits}/{totalUnits || 0} birim tamamlandı</small>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${resourceProgress}%` }} />
        </div>
        <p>
          İlerleme, kaynak kartındaki tamamlanan birimin toplam birime bölünmesiyle ölçülür.
          Birim; soru, test, sayfa veya video olabilir.
        </p>
      </div>

      <div className="library-grid">
        {officialSources.map((source) => (
          <a className="library-card official" href={source.url} target="_blank" rel="noreferrer" key={source.title}>
            <span>{source.type}</span>
            <strong>{source.title}</strong>
            <p>{source.detail}</p>
          </a>
        ))}

        {youtubeLinks.map((source) => (
          <a className="library-card" href={source.url} target="_blank" rel="noreferrer" key={source.title}>
            <span>{source.type}</span>
            <strong>{source.title}</strong>
            <p>{source.detail}</p>
            <small className="library-card-meta">{source.sourceLabel}</small>
            <small className="library-card-meta">{source.intent}</small>
          </a>
        ))}
      </div>

      <div className="guide-package-panel">
        <div className="section-head slim-head">
          <div>
            <h3>Dijital Paket Rehberi</h3>
            <p>PDF paketlerinden alınan süre, kaynak puanı ve kanal önerisi uygulama içi karara çevrilir.</p>
          </div>
        </div>

        <div className="guide-package-grid">
          {guideSuggestions.packageCards.map((pack) => (
            <div className="guide-package-card" key={pack.id}>
              <span>{pack.label}</span>
              <strong>{pack.area}</strong>
              <p>{pack.usage}</p>
              <small>{pack.sourceFile}</small>
            </div>
          ))}
        </div>

        {(guideSuggestions.durations.length > 0 || guideSuggestions.reviews.length > 0 || guideSuggestions.channels.length > 0) && (
          <div className="guide-suggestion-grid">
            {guideSuggestions.durations.slice(0, 4).map((item) => (
              <div className="guide-suggestion-card" key={`${item.exam}-${item.lesson}-${item.topic}`}>
                <span>Süre</span>
                <strong>{item.topic}</strong>
                <p>Başlangıç: {item.beginner} · Orta: {item.medium} · İleri: {item.advanced}</p>
              </div>
            ))}

            {guideSuggestions.reviews.slice(0, 4).map((item) => (
              <div className="guide-suggestion-card" key={`${item.exam}-${item.lesson}-${item.resource}`}>
                <span>Kaynak</span>
                <strong>{item.resource}</strong>
                <p>
                  Zorluk {item.difficulty}/10 · ÖSYM uyumu {item.osymFit}/10 · Video {item.videoClarity}/10
                </p>
              </div>
            ))}

            {guideSuggestions.channels.slice(0, 3).map((item) => (
              <div className="guide-suggestion-card" key={`${item.exam}-${item.lesson}-${item.title}`}>
                <span>Kanal</span>
                <strong>{item.title}</strong>
                <p>{item.focus}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="resource-library-list">
        <div className="section-head slim-head">
          <div>
            <h3>{audience === "coach" ? "Öğrenci Kaynak Listesi" : "Kaynak Listem"}</h3>
            <p>Koçun eklediği kaynaklarda birim bazlı ilerleme görünür.</p>
          </div>
        </div>

        {resources.length > 0 ? resources.map((resource) => {
          const progress = getResourceProgress(resource);
          const videoMatches = getSourceVideoMatches(resource);

          return (
            <div className="library-resource-row" key={resource.id}>
              <div>
                <strong>{resource.title}</strong>
                <small>
                  {resource.publisher || "Yayın yok"} · {resource.lesson}
                  {resource.topic && ` · ${resource.topic}${resource.subtopic ? ` / ${resource.subtopic}` : ""}`}
                </small>
                {videoMatches.length > 0 && (
                  <span className="library-row-links">
                    {videoMatches.slice(0, 2).map((match) => (
                      <a href={match.url} target="_blank" rel="noreferrer" key={match.url}>
                        {match.title}
                      </a>
                    ))}
                  </span>
                )}
              </div>
              <div className="library-resource-progress">
                <span>{resource.completedUnits}/{resource.totalUnits || 0} {resource.unitLabel}</span>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <strong>%{progress}</strong>
              </div>
            </div>
          );
        }) : (
          <div className="empty-state">Kaynak listesi henüz oluşturulmadı.</div>
        )}
      </div>
    </div>
  );
}

function getYoutubeLinks(exam, lesson, level, source) {
  const sourceQuery = source.query ? `${source.query} ` : "";
  const sourceLabel = `Yayın odağı: ${source.label}`;
  const levelMap = {
    Başlangıç: [
      {
        title: `${exam} ${lesson} temel konu anlatımı`,
        type: "YouTube başlangıç",
        query: `${sourceQuery}${exam} ${lesson} sıfırdan temel konu anlatımı kolay soru çözümü`,
        detail: "Temel kavram, kısa örnek ve kolay soru çözümü arar.",
        intent: "Amaç: konuya giriş ve kavram oturtma.",
      },
      {
        title: `${exam} ${lesson} MEBİ / EBA destekli tekrar`,
        type: "Resmi destek araması",
        query: `MEBİ EBA ${exam} ${lesson} temel konu anlatımı etkinlik soru`,
        detail: "Resmi içeriklerle paralel başlangıç tekrarını öne çıkarır.",
        intent: "Amaç: müfredat çizgisinden kopmadan başlamak.",
      },
      {
        title: `${exam} ${lesson} kolay test çözümü`,
        type: "YouTube test çözümü",
        query: `${sourceQuery}${exam} ${lesson} başlangıç seviyesi kolay test çözümü`,
        detail: "Konu sonrası ilk uygulama ve düşük riskli alıştırma araması.",
        intent: "Amaç: öğrenciye ilk doğru ritmi kazandırmak.",
      },
    ],
    Orta: [
      {
        title: `${exam} ${lesson} konu tarama testi`,
        type: "YouTube orta seviye",
        query: `${sourceQuery}${exam} ${lesson} orta seviye konu tarama testi çözümü`,
        detail: "Konu bitince tarama testi ve uygulama soru çözümü arar.",
        intent: "Amaç: eksik konuyu görünür yapmak.",
      },
      {
        title: `${exam} ${lesson} soru bankası video çözümü`,
        type: "Kaynak uyumlu arama",
        query: `${sourceQuery}${exam} ${lesson} soru bankası video çözümü orta seviye`,
        detail: "Seçilen yayın veya kaynak adına göre video çözüm aramasını daraltır.",
        intent: "Amaç: eldeki kaynağın ilerlemesini hızlandırmak.",
      },
      {
        title: `${exam} ${lesson} karma test pratiği`,
        type: "YouTube pratik",
        query: `${sourceQuery}${exam} ${lesson} orta seviye karma test çözümü yeni nesil`,
        detail: "Birden fazla kazanımı karıştıran orta seviye soru pratiği arar.",
        intent: "Amaç: konuyu sınav tarzına taşımak.",
      },
    ],
    İleri: [
      {
        title: `${exam} ${lesson} zor yeni nesil sorular`,
        type: "YouTube ileri seviye",
        query: `${sourceQuery}${exam} ${lesson} ileri seviye zor yeni nesil soru çözümü`,
        detail: "Derece hedefi ve seçici soru pratiği için zor soru araması yapar.",
        intent: "Amaç: işlem gücü ve yorum dayanıklılığı artırmak.",
      },
      {
        title: `${exam} ${lesson} branş denemesi analizi`,
        type: "Deneme analizi araması",
        query: `${sourceQuery}${exam} ${lesson} branş denemesi çözümü analiz ileri seviye`,
        detail: "Branş denemesi çözümü, net artırma ve hata analizi içeriklerini öne çıkarır.",
        intent: "Amaç: deneme verisini aksiyon planına çevirmek.",
      },
      {
        title: `${exam} ${lesson} son tekrar ve strateji`,
        type: "YouTube strateji",
        query: `${sourceQuery}${exam} ${lesson} ileri seviye son tekrar strateji çıkmış soru`,
        detail: "Sınava yakın tekrar, çıkmış soru ve strateji içeriklerini arar.",
        intent: "Amaç: yüksek neti koruyup süre yönetimini keskinleştirmek.",
      },
    ],
  };

  return (levelMap[level] || levelMap.Başlangıç).map((item) => ({
    ...item,
    sourceLabel,
    url: buildYoutubeSearchUrl(item.query),
  }));
}

function buildYoutubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function buildSourceOptions(resources) {
  const options = [
    {
      id: "official",
      label: "MEBİ / EBA",
      query: "MEBİ EBA",
    },
    {
      id: "general",
      label: "Yayın fark etmez",
      query: "",
    },
  ];

  const publishers = new Map();
  resources.forEach((resource, index) => {
    const publisher = (resource.publisher || "").trim();
    if (!publisher) return;
    const key = `publisher-${publisher.toLocaleLowerCase("tr-TR")}`;
    if (!publishers.has(key)) {
      publishers.set(key, {
        id: `publisher-${index}-${slugify(publisher)}`,
        label: publisher,
        query: publisher,
      });
    }
  });

  options.push(...publishers.values());

  resources.forEach((resource) => {
    if (!resource.title) return;
    const title = resource.title.trim();
    const publisher = (resource.publisher || "").trim();
    const query = [publisher, title].filter(Boolean).join(" ");
    options.push({
      id: `resource-${resource.id || slugify(title)}`,
      label: title,
      query: query || title,
    });
  });

  return options;
}

function getLevelPurpose(level) {
  const purposeMap = {
    Başlangıç: "Temel konu anlatımı, kolay soru ve resmi içerik desteği öne çıkar.",
    Orta: "Konu tarama, soru bankası çözümü ve karma test pratiği öne çıkar.",
    İleri: "Zor soru, branş denemesi analizi ve son tekrar stratejisi öne çıkar.",
  };

  return purposeMap[level] || purposeMap.Başlangıç;
}

function slugify(value) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function getResourceProgress(resource) {
  const totalUnits = toNumber(resource.totalUnits);
  if (totalUnits <= 0) return 0;
  return Math.min(100, Math.round((toNumber(resource.completedUnits) / totalUnits) * 100));
}

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export default LearningLibrary;
