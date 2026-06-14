import { buildStudentReportCard } from "../utils/studentAnalytics.js";

function ParentDashboard({ student, activeAccount, onLogout, theme, onToggleTheme }) {
  const report = buildStudentReportCard(student);
  const activeHomeworks = (student.homeworks || []).filter((homework) => homework.status !== "Kontrol Edildi").slice(0, 4);
  const activeResources = (student.resources || []).filter((resource) => resource.status !== "Tamamlandı").slice(0, 4);
  const latestMessages = (student.messages || []).slice(-3).reverse();
  const weeklyTasks = student.weeklyTasks || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-shell parent-shell">
      <aside className="sidebar">
        <div className="logo-box">
          <div className="logo-mark">V</div>
          <div>
            <strong>Veli Paneli</strong>
            <small>Salt okunur takip</small>
          </div>
        </div>

        <nav className="side-nav">
          <a href="#parent-summary">Özet</a>
          <a href="#parent-progress">İlerleme</a>
          <a href="#parent-focus">Öncelikler</a>
          <a href="#parent-notes">Notlar</a>
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          Çıkış Yap
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{student.name} Veli Raporu</h1>
            <p>{report.target}</p>
          </div>
          <div className="top-actions">
            <div className="session-pill">
              <span>Oturum</span>
              <strong>{activeAccount?.name || "Veli"}</strong>
            </div>
            <button className="theme-toggle" onClick={onToggleTheme}>
              <span className="theme-toggle-dot" />
              {theme === "dark" ? "Gündüz modu" : "Gece modu"}
            </button>
          </div>
        </header>

        <section className="stats-grid menu-target" id="parent-summary">
          <div className="stat-card">
            <span>TYT Net</span>
            <strong>{report.tytNet.toFixed(2)}</strong>
            <small>Son kayıtlı deneme</small>
          </div>
          <div className="stat-card">
            <span>AYT Net</span>
            <strong>{report.aytNet.toFixed(2)}</strong>
            <small>Son kayıtlı deneme</small>
          </div>
          <div className="stat-card success">
            <span>Haftalık Plan</span>
            <strong>%{report.weeklyCompletion}</strong>
            <small>{weeklyTasks.filter((task) => task.status !== "Tamamlandı").length} bekleyen çalışma</small>
          </div>
          <div className="stat-card">
            <span>Kaynak</span>
            <strong>%{student.resourceProgress || 0}</strong>
            <small>{activeResources.length} aktif kaynak</small>
          </div>
          <div className="stat-card">
            <span>Ödev</span>
            <strong>%{student.homeworkCompletion || 0}</strong>
            <small>{activeHomeworks.length} açık ödev</small>
          </div>
        </section>

        <section className="panel-card parent-report-panel" id="parent-progress">
          <div className="section-head">
            <div>
              <h2>Veli Görüşme Özeti</h2>
              <p>Öğrencinin son durumunu sade ve eyleme dönük şekilde gösterir.</p>
            </div>
            <div className="section-actions">
              <span className={`risk-badge risk-${report.risk.level.toLowerCase()}`}>
                Risk: {report.risk.level} · %{report.risk.score}
              </span>
              <button className="yellow-btn" onClick={handlePrint}>PDF / Yazdır</button>
            </div>
          </div>

          <div className="report-card-grid">
            <Metric label="Çözülen Soru" value={report.solvedQuestions} detail="Günlük çalışma kayıtları" />
            <Metric label="Çalışma Süresi" value={`${report.studyDuration} dk`} detail="Toplam kayıtlı süre" />
            <Metric label="Çalışma Başarısı" value={`%${report.studySuccessRate}`} detail="Doğru / soru oranı" />
            <Metric label="Eksik Konu" value={report.missingTopicCount} detail="Öncelikli takip başlığı" />
          </div>

          <div className="risk-reason-list">
            {report.risk.reasons.map((reason) => (
              <span key={reason}>{reason}</span>
            ))}
          </div>
        </section>

        <section className="analytics-board" id="parent-focus">
          <div className="panel-card">
            <div className="section-head">
              <div>
                <h2>Öncelikli Eksik Konular</h2>
                <p>Evde destek ve tekrar planı için odak başlıkları.</p>
              </div>
            </div>
            <div className="priority-topic-list">
              {report.missingTopics.length > 0 ? (
                report.missingTopics.map((topic) => (
                  <div className="priority-topic-card" key={`${topic.lesson}-${topic.topic}-${topic.subtopic}`}>
                    <strong>{topic.lesson} · {topic.topic}</strong>
                    <span>{topic.subtopic || "Alt konu belirtilmedi"} · {topic.priority} öncelik</span>
                    <small>{topic.recommendation}</small>
                  </div>
                ))
              ) : (
                <div className="empty-state">Kritik eksik konu görünmüyor.</div>
              )}
            </div>
          </div>

          <div className="panel-card">
            <div className="section-head">
              <div>
                <h2>Açık Ödev ve Kaynaklar</h2>
                <p>Takip edilmesi gereken güncel işler.</p>
              </div>
            </div>
            <div className="parent-list">
              {activeHomeworks.map((homework) => (
                <InfoRow label="Ödev" title={homework.title} detail={`${homework.lesson} · ${homework.status}`} key={homework.id} />
              ))}
              {activeResources.map((resource) => (
                <InfoRow label="Kaynak" title={resource.title} detail={`${resource.lesson} · %${getResourceProgress(resource)}`} key={resource.id} />
              ))}
              {activeHomeworks.length === 0 && activeResources.length === 0 && (
                <div className="empty-state">Açık ödev veya kaynak görünmüyor.</div>
              )}
            </div>
          </div>
        </section>

        <section className="panel-card" id="parent-notes">
          <div className="section-head">
            <div>
              <h2>Koç Notu ve Son Mesajlar</h2>
              <p>Veli görüşmesinde takip edilecek kısa notlar.</p>
            </div>
          </div>

          <div className="parent-note-grid">
            <div className="notification-item neutral">
              <span>Koç Notu</span>
              <strong>{student.coachNote || "Koç notu henüz girilmedi."}</strong>
              <small>Detaylı plan değişiklikleri koç panelinden yönetilir.</small>
            </div>
            <div className="parent-list">
              {latestMessages.map((message) => (
                <InfoRow
                  label={message.senderName || message.sender || "Mesaj"}
                  title={message.category || "Not"}
                  detail={message.text}
                  key={message.id}
                />
              ))}
              {latestMessages.length === 0 && <div className="empty-state">Mesaj kaydı yok.</div>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="report-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function InfoRow({ label, title, detail }) {
  return (
    <article className="parent-info-row">
      <span>{label}</span>
      <strong>{title}</strong>
      <small>{detail}</small>
    </article>
  );
}

function getResourceProgress(resource) {
  const total = Number(resource.totalUnits || 0);
  if (total <= 0) return Number(resource.progress || 0);
  return Math.min(100, Math.round((Number(resource.completedUnits || 0) / total) * 100));
}

export default ParentDashboard;
