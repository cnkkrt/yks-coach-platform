const moduleLabels = {
  weeklyPlan: "Haftalık plan",
  homework: "Ödev",
  resource: "Kaynak",
  topic: "Konu",
  studyTarget: "Çalışma hedefi",
  video: "Video",
};

export function calculateDataHealth(student = {}) {
  const resources = Array.isArray(student.resources) ? student.resources : [];
  const errors = Array.isArray(student.errors) ? student.errors : [];
  const exams = Array.isArray(student.exams) ? student.exams : [];
  const syncEvents = Array.isArray(student.syncEvents) ? student.syncEvents : [];
  const checks = [
    {
      label: "Model sürümü",
      passed: Boolean(student.dataVersion),
      weight: 18,
      detail: student.dataVersion || "Sürüm etiketi yok",
    },
    {
      label: "Merkezi ilerleme",
      passed: Boolean(student.moduleProgress),
      weight: 20,
      detail: student.moduleProgress ? "Modül yüzdeleri hesaplanıyor" : "Modül yüzdeleri eksik",
    },
    {
      label: "Senkron geçmişi",
      passed: syncEvents.length > 0,
      weight: 18,
      detail: `${syncEvents.length} işlem kaydı`,
    },
    {
      label: "Kaynak sınav alanı",
      passed: resources.every((resource) => Boolean(resource.exam)),
      weight: 14,
      detail: resources.length ? `${resources.length} kaynak kontrol edildi` : "Kaynak yok",
    },
    {
      label: "Hata sınav alanı",
      passed: errors.every((error) => Boolean(error.exam)),
      weight: 10,
      detail: errors.length ? `${errors.length} hata kaydı kontrol edildi` : "Hata kaydı yok",
    },
    {
      label: "Deneme kırılımı",
      passed: exams.every((exam) => Array.isArray(exam.sections)),
      weight: 10,
      detail: exams.length ? `${exams.length} deneme/test kaydı` : "Deneme yok",
    },
    {
      label: "Son senkron zamanı",
      passed: Boolean(student.lastSyncedAt || student.updatedAt),
      weight: 10,
      detail: formatSyncDate(student.lastSyncedAt || student.updatedAt),
    },
  ];
  const score = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0);

  return {
    score,
    label: score >= 85 ? "Güçlü" : score >= 60 ? "İzlenmeli" : "Eksik",
    tone: score >= 85 ? "good" : score >= 60 ? "warn" : "bad",
    checks,
  };
}

export function DataHealthPanel({ student, title = "Veri Sağlığı ve Senkron", compact = false }) {
  const health = calculateDataHealth(student);
  const moduleProgress = student?.moduleProgress || {};

  return (
    <section className={`panel-card data-health-panel ${compact ? "compact-data-health" : ""}`}>
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          <p>İlerleme değerlerinin hangi modüllerden beslendiği ve son senkron durumu.</p>
        </div>
        <span className={`data-health-score ${health.tone}`}>%{health.score} · {health.label}</span>
      </div>

      <div className="module-progress-grid">
        {Object.entries(moduleLabels).map(([key, label]) => (
          <div className="module-progress-card" key={key}>
            <span>{label}</span>
            <strong>%{Math.round(Number(moduleProgress[key] || 0))}</strong>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, Number(moduleProgress[key] || 0)))}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="data-health-checks">
        {health.checks.map((check) => (
          <div className={`data-health-check ${check.passed ? "passed" : "failed"}`} key={check.label}>
            <span>{check.label}</span>
            <strong>{check.passed ? "Tamam" : "Eksik"}</strong>
            <small>{check.detail}</small>
          </div>
        ))}
      </div>

      <SyncTimeline events={student?.syncEvents || []} limit={compact ? 3 : 5} />
    </section>
  );
}

export function SyncTimeline({ events = [], limit = 5 }) {
  const visibleEvents = Array.isArray(events) ? events.slice(0, limit) : [];

  return (
    <div className="sync-timeline">
      <div className="sync-timeline-head">
        <h3>Son Otomatik Güncellemeler</h3>
        <span>{Array.isArray(events) ? events.length : 0} kayıt</span>
      </div>

      {visibleEvents.length > 0 ? (
        visibleEvents.map((event) => (
          <article className="sync-event" key={event.id || `${event.type}-${event.createdAt}`}>
            <div>
              <strong>{formatSyncType(event.type || event.sourceType)}</strong>
              <small>{formatSyncDate(event.createdAt)} · {formatActor(event.actor)}</small>
            </div>
            <p>{event.detail || "Sistem öğrenci verisini yeniden hesapladı."}</p>
          </article>
        ))
      ) : (
        <div className="empty-state compact-empty">Henüz senkron geçmişi yok. İlk kayıt değişiminden sonra burada görünür.</div>
      )}
    </div>
  );
}

function formatSyncType(type = "sync") {
  const labels = {
    "study.sync": "Günlük çalışma senkronu",
    "weeklyTask.sync": "Haftalık plan senkronu",
    "homework.sync": "Ödev senkronu",
    "resource.sync": "Kaynak senkronu",
    "exam.add": "Deneme eklendi",
    "exam.update": "Deneme güncellendi",
    "exam.delete": "Deneme silindi",
    "error.add": "Hata kaydı eklendi",
    "error.update": "Hata kaydı güncellendi",
    "resource.delete": "Kaynak silindi",
    "homework.delete": "Ödev silindi",
    "weeklyTemplate.apply": "Plan şablonu uygulandı",
    "message.add": "Mesaj eklendi",
    "videoPlaylist.add": "Video listesi eklendi",
    "videoPlaylist.delete": "Video listesi silindi",
  };

  return labels[type] || type.replace(/\./g, " ");
}

function formatActor(actor = "system") {
  if (actor === "coach") return "Koç";
  if (actor === "student") return "Öğrenci";
  if (actor === "system") return "Sistem";
  return actor;
}

function formatSyncDate(value) {
  if (!value) return "Zaman yok";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
