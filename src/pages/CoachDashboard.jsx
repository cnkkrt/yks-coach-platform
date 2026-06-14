import { useMemo, useState } from "react";
import { calculateDataHealth } from "../components/DataHealthPanel.jsx";
import { scrollToSection } from "../utils/navigation.js";
import { buildCoachRiskQueue } from "../utils/studentAnalytics.js";
import { createAssignedResourceFromLibrary, resourceLibraryFilters } from "../data/resourceLibraryData.js";

const emptyForm = {
  name: "",
  email: "",
  grade: "12",
  school: "",
  scoreType: "SAY",
  targetDepartment: "",
  targetUniversity: "",
  lastTytNet: "",
  lastAytNet: "",
  topicProgress: "0",
  resourceProgress: "0",
  homeworkCompletion: "0",
  riskLevel: "Orta",
  coachNote: "",
};

function CoachDashboard({
  students,
  onOpenStudent,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onResetDemoData,
  onAssignResourceToStudent,
  resourceLibrary = [],
  onLogout,
  activeAccount,
  accounts = [],
  theme,
  onToggleTheme,
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [studentFormError, setStudentFormError] = useState("");
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchText, setSearchText] = useState("");
  const [riskFilter, setRiskFilter] = useState("Tümü");
  const [activeMenu, setActiveMenu] = useState("coach-overview");
  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceExamFilter, setResourceExamFilter] = useState("Tümü");
  const [resourceLevelFilter, setResourceLevelFilter] = useState("Tümü");
  const [selectedAssignStudentId, setSelectedAssignStudentId] = useState(students[0]?.id || "");
  const [reportMode, setReportMode] = useState("kurum");

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const searchPool = [
        student.name,
        student.school,
        student.scoreType,
        student.targetDepartment,
        student.targetUniversity,
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      const matchesSearch = searchPool.includes(searchText.toLocaleLowerCase("tr-TR"));
      const matchesRisk = riskFilter === "Tümü" || student.riskLevel === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [students, searchText, riskFilter]);

  const totalStudents = students.length;
  const highRiskCount = students.filter((student) => student.riskLevel === "Yüksek").length;
  const averageTyt = getAverage(students.map((student) => student.lastTytNet));
  const averageResource = getAverage(students.map((student) => student.resourceProgress));
  const averageHomework = getAverage(students.map((student) => student.homeworkCompletion));
  const overviewBars = [
    { label: "TYT Ort.", value: averageTyt, max: 120, unit: "net" },
    { label: "Kaynak", value: averageResource, max: 100, unit: "%" },
    { label: "Ödev", value: averageHomework, max: 100, unit: "%" },
  ];
  const studentNetBars = students.map((student) => ({
    label: student.name,
    value: Number(student.lastTytNet || 0),
    max: 120,
    unit: "net",
  }));
  const notifications = getCoachNotifications(students);
  const professionalReport = getProfessionalCoachReport(students);
  const riskQueue = buildCoachRiskQueue(students);
  const dataHealthItems = students
    .map((student) => ({ student, health: calculateDataHealth(student) }))
    .sort((a, b) => a.health.score - b.health.score);
  const reportStudents = reportMode === "risk"
    ? students.filter((student) => student.riskLevel === "Yüksek")
    : students;
  const filteredResourceLibrary = resourceLibrary.filter((resource) => {
    const searchPool = [
      resource.title,
      resource.publisher,
      resource.exam,
      resource.lesson,
      resource.topic,
      resource.recommendedFor,
      resource.note,
    ].join(" ").toLocaleLowerCase("tr-TR");
    const matchesSearch = searchPool.includes(resourceSearch.toLocaleLowerCase("tr-TR"));
    const matchesExam = resourceExamFilter === "Tümü" || resource.exam === resourceExamFilter;
    const matchesLevel = resourceLevelFilter === "Tümü" || resource.level === resourceLevelFilter;

    return matchesSearch && matchesExam && matchesLevel;
  });

  const startAddStudent = () => {
    setEditingStudentId(null);
    setFormData(emptyForm);
    setStudentFormError("");
    setIsFormOpen(true);
  };

  const startEditStudent = (student) => {
    setEditingStudentId(student.id);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      grade: student.grade || "12",
      school: student.school || "",
      scoreType: student.scoreType || "SAY",
      targetDepartment: student.targetDepartment || "",
      targetUniversity: student.targetUniversity || "",
      lastTytNet: String(student.lastTytNet ?? ""),
      lastAytNet: String(student.lastAytNet ?? ""),
      topicProgress: String(student.topicProgress ?? "0"),
      resourceProgress: String(student.resourceProgress ?? "0"),
      homeworkCompletion: String(student.homeworkCompletion ?? "0"),
      riskLevel: student.riskLevel || "Orta",
      coachNote: student.coachNote || "",
    });
    setStudentFormError("");
    setIsFormOpen(true);
  };

  const cancelForm = () => {
    setIsFormOpen(false);
    setEditingStudentId(null);
    setFormData(emptyForm);
    setStudentFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStudentFormError("");

    if (!formData.name.trim()) {
      alert("Öğrenci adı boş bırakılamaz.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Öğrenci e-postası kullanıcı adı olarak zorunludur.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      grade: formData.grade,
      school: formData.school.trim() || "Okul bilgisi girilmedi",
      scoreType: formData.scoreType,
      targetDepartment: formData.targetDepartment.trim() || "Hedef bölüm girilmedi",
      targetUniversity: formData.targetUniversity.trim() || "Hedef üniversite girilmedi",
      lastTytNet: toNumber(formData.lastTytNet),
      lastAytNet: toNumber(formData.lastAytNet),
      topicProgress: clampPercent(formData.topicProgress),
      resourceProgress: clampPercent(formData.resourceProgress),
      homeworkCompletion: clampPercent(formData.homeworkCompletion),
      riskLevel: formData.riskLevel,
      coachNote: formData.coachNote.trim(),
    };

    setIsSubmittingStudent(true);

    try {
      if (editingStudentId) {
        await onUpdateStudent({ id: editingStudentId, ...payload });
      } else {
        await onAddStudent(payload);
      }

      cancelForm();
    } catch (error) {
      setStudentFormError(error?.message || "Öğrenci kaydedilemedi.");
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleDelete = (student) => {
    const isConfirmed = window.confirm(
      `${student.name} adlı öğrenciyi silmek istediğine emin misin?`
    );

    if (isConfirmed) {
      onDeleteStudent(student.id);
    }
  };

  const handleReset = () => {
    const isConfirmed = window.confirm(
      "Tüm kayıtları demo verilerine döndürmek istiyor musun? Sonradan eklenen öğrenciler silinir."
    );

    if (isConfirmed) {
      onResetDemoData();
      cancelForm();
    }
  };

  const handleAssignResource = (libraryResource) => {
    const targetStudentId = selectedAssignStudentId || students[0]?.id;

    if (!targetStudentId) {
      alert("Kaynak atanacak öğrenci bulunamadı.");
      return;
    }

    onAssignResourceToStudent(Number(targetStudentId), createAssignedResourceFromLibrary(libraryResource));
  };

  const handlePrintCoachReport = () => {
    document.body.classList.add("printing-coach-report");
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => document.body.classList.remove("printing-coach-report"), 400);
    }, 120);
  };

  const handleMenuClick = (sectionId) => {
    setActiveMenu(sectionId);
    scrollToSection(sectionId);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo-box">
          <div className="logo-mark">YK</div>
          <div>
            <strong>Koç Paneli</strong>
            <small>YKS Takip Sistemi</small>
          </div>
        </div>

        <nav className="side-nav">
          <button className={activeMenu === "coach-overview" ? "active" : ""} onClick={() => handleMenuClick("coach-overview")}>Genel Bakış</button>
          <button className={activeMenu === "coach-students" ? "active" : ""} onClick={() => handleMenuClick("coach-students")}>Öğrenciler</button>
          <button className={activeMenu === "coach-planning" ? "active" : ""} onClick={() => handleMenuClick("coach-planning")}>Haftalık Planlama</button>
          <button className={activeMenu === "coach-reports" ? "active" : ""} onClick={() => handleMenuClick("coach-reports")}>Raporlar</button>
          <button className={activeMenu === "coach-resource-library" ? "active" : ""} onClick={() => handleMenuClick("coach-resource-library")}>Kaynak Kütüphanesi</button>
          <button className={activeMenu === "coach-notifications" ? "active" : ""} onClick={() => handleMenuClick("coach-notifications")}>Alarm Merkezi</button>
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          Çıkış Yap
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Koç Ana Paneli</h1>
            <p>Öğrenci planı, ödev, kaynak, deneme ve hata analizinin ana yönetim merkezi.</p>
          </div>

          <div className="top-actions">
            <div className="session-pill">
              <span>Oturum</span>
              <strong>{activeAccount?.name || "Koç"}</strong>
            </div>
            <button className="theme-toggle" onClick={onToggleTheme}>
              <span className="theme-toggle-dot" />
              {theme === "dark" ? "Gündüz modu" : "Gece modu"}
            </button>
            <button className="ghost-btn" onClick={handleReset}>Demo Veriyi Yükle</button>
            <button className="yellow-btn" onClick={startAddStudent}>+ Yeni Öğrenci</button>
          </div>
        </header>

        <section className="command-panel menu-target" id="coach-overview">
          <div className="command-copy">
            <span>Canlı takip özeti</span>
            <strong>Bugünün koçluk masası</strong>
            <p>Öğrencinin kendi panelinde girdiği veriler burada koç kontrolüne düşer; plan ve strateji yönetimi koçta kalır.</p>
          </div>

          <div className="command-chip">
            <span>Aktif öğrenci</span>
            <strong>{totalStudents}</strong>
          </div>

          <div className="command-chip warning">
            <span>Yüksek risk</span>
            <strong>{highRiskCount}</strong>
          </div>

          <div className="command-chip success">
            <span>Kaynak ort.</span>
            <strong>%{averageResource.toFixed(0)}</strong>
          </div>

          <div className="command-chip resource">
            <span>Ödev ort.</span>
            <strong>%{averageHomework.toFixed(0)}</strong>
          </div>
        </section>

        <section className="panel-card coach-risk-board menu-target" id="coach-risk-board">
          <div className="section-head">
            <div>
              <h2>Riskli Öğrenci Radarı</h2>
              <p>Haftalık plan, ödev, deneme trendi, günlük çalışma ve eksik konu verisine göre otomatik önceliklendirme.</p>
            </div>
            <button className="ghost-btn" onClick={() => handleMenuClick("coach-notifications")}>Alarm Merkezine Git</button>
          </div>

          <div className="risk-queue-grid">
            {riskQueue.slice(0, 4).map(({ student, card }) => (
              <article className={`risk-student-card risk-${card.risk.level.toLowerCase()}`} key={student.id}>
                <div>
                  <span>{card.risk.level} Risk · %{card.risk.score}</span>
                  <strong>{student.name}</strong>
                  <small>{student.targetDepartment} · {student.targetUniversity}</small>
                </div>
                <div className="mini-metrics">
                  <b>TYT {card.tytNet.toFixed(1)}</b>
                  <b>AYT {card.aytNet.toFixed(1)}</b>
                  <b>Plan %{card.weeklyCompletion}</b>
                  <b>Eksik {card.missingTopicCount}</b>
                </div>
                <ul>
                  {card.risk.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                <button className="yellow-btn" onClick={() => onOpenStudent(student.id)}>Öğrenci Karnesini Aç</button>
              </article>
            ))}
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Toplam Öğrenci</span>
            <strong>{totalStudents}</strong>
            <small>Aktif takipte</small>
          </div>

          <div className="stat-card danger">
            <span>Yüksek Risk</span>
            <strong>{highRiskCount}</strong>
            <small>Yakın takip gerekli</small>
          </div>

          <div className="stat-card">
            <span>Ortalama TYT Net</span>
            <strong>{averageTyt.toFixed(1)}</strong>
            <small>Son deneme ortalaması</small>
          </div>

          <div className="stat-card success">
            <span>Ödev Tamamlama</span>
            <strong>%{averageHomework.toFixed(0)}</strong>
            <small>Genel ortalama</small>
          </div>
        </section>

        <section className="panel-card coach-data-health-board menu-target" id="coach-data-health">
          <div className="section-head">
            <div>
              <h2>Veri Sağlığı ve Senkron Omurgası</h2>
              <p>Öğrenci verisinin kaynak, ödev, çalışma, deneme ve video modülleriyle ne kadar sağlıklı bağlandığını gösterir.</p>
            </div>
          </div>

          <div className="coach-data-health-list">
            {dataHealthItems.map(({ student, health }) => (
              <button className="coach-data-health-row" type="button" onClick={() => onOpenStudent(student.id)} key={student.id}>
                <div>
                  <strong>{student.name}</strong>
                  <small>{student.dataVersion || "model sürümü yok"} · {student.lastSyncedAt ? "son senkron var" : "son senkron bekleniyor"}</small>
                </div>
                <div className="health-mini-bars">
                  <span>Plan %{student.moduleProgress?.weeklyPlan || 0}</span>
                  <span>Kaynak %{student.moduleProgress?.resource || student.resourceProgress || 0}</span>
                  <span>Ödev %{student.moduleProgress?.homework || student.homeworkCompletion || 0}</span>
                </div>
                <span className={`data-health-score ${health.tone}`}>%{health.score} · {health.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="analytics-board menu-target" id="coach-analytics">
          <div className="panel-card geo-panel">
            <div className="section-head">
              <div>
                <h2>İlerleme Panosu</h2>
                <p>Genel net, kaynak ve ödev ölçümlerinin hızlı görünümü.</p>
              </div>
            </div>
            <MetricBars items={overviewBars} />
          </div>

          <div className="panel-card geo-panel">
            <div className="section-head">
              <div>
                <h2>Deneme Net Grafiği</h2>
                <p>Öğrencilerin son TYT netleri karşılaştırmalı bar görünümü.</p>
              </div>
            </div>
            <BarChart items={studentNetBars} />
          </div>
        </section>

        <section className="panel-card notification-center menu-target" id="coach-notifications">
          <div className="section-head">
            <div>
              <h2>Takip Bildirimleri</h2>
              <p>Risk, ödev, kaynak ve hata kayıtlarından otomatik oluşturulan uyarılar.</p>
            </div>
          </div>

          <div className="notification-list">
            {notifications.map((notification) => (
              <button
                type="button"
                className={`notification-item ${notification.tone}`}
                onClick={() => notification.student && onOpenStudent(notification.student)}
                key={notification.id}
              >
                <span>{notification.label}</span>
                <strong>{notification.title}</strong>
                <small>{notification.detail}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="panel-card coach-planning-hub menu-target" id="coach-planning">
          <div className="section-head list-head">
            <div>
              <h2>Haftalık Planlama Merkezi</h2>
              <p>Ana plan, günlük ekstra çalışma, ödev ve deneme/test atamaları öğrencinin haftalık planına bağlanır.</p>
            </div>
          </div>

          <div className="planning-action-grid">
            <article className="planning-action-card">
              <span>1</span>
              <strong>Ana Plan</strong>
              <p>Ders, seviye, konu, hedef soru ve süreyi haftanın günlerine yerleştir.</p>
            </article>
            <article className="planning-action-card">
              <span>2</span>
              <strong>Ekstra Çalışma Ekle</strong>
              <p>Öğrencinin eksik kaldığı günlere paragraf, problem, tekrar veya video görevi ekle.</p>
            </article>
            <article className="planning-action-card">
              <span>3</span>
              <strong>Ödev Ver</strong>
              <p>Kitap sayfası, PDF, video, kaynak bölümü veya yanlış kapatma görevi ata.</p>
            </article>
            <article className="planning-action-card">
              <span>4</span>
              <strong>Sınav/Test Ata</strong>
              <p>TYT, AYT/YDT, branş denemesi, konu tarama testi, mini test veya yanlış tekrar testi planla.</p>
            </article>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Öğrenci</th>
                  <th>Haftalık Plan</th>
                  <th>Ödev</th>
                  <th>Risk</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={`planning-${student.id}`}>
                    <td><strong>{student.name}</strong><small>{student.scoreType} · {student.targetDepartment}</small></td>
                    <td>%{student.weeklyCompletion || student.topicProgress || 0}</td>
                    <td>%{student.homeworkCompletion || 0}</td>
                    <td><span className={`risk-badge ${getRiskClass(student.riskLevel)}`}>{student.riskLevel}</span></td>
                    <td><button className="small-btn" onClick={() => onOpenStudent(student.id)}>Plan / Ödev / Test Yönet</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel-card menu-target" id="coach-resource-library">
          <div className="section-head list-head">
            <div>
              <h2>Kaynak Kütüphanesi</h2>
              <p>Ortak kaynak havuzundan öğrenciye kaynak ata. Öğrenci tarafında yalnızca atanan kaynaklar “Kaynaklarım” olarak görünür.</p>
            </div>

            <div className="filter-row">
              <input
                value={resourceSearch}
                onChange={(event) => setResourceSearch(event.target.value)}
                placeholder="Kaynak, yayın, ders ara..."
              />
              <select value={resourceExamFilter} onChange={(event) => setResourceExamFilter(event.target.value)}>
                {resourceLibraryFilters.exams.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
              <select value={resourceLevelFilter} onChange={(event) => setResourceLevelFilter(event.target.value)}>
                {resourceLibraryFilters.levels.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
              <select value={selectedAssignStudentId} onChange={(event) => setSelectedAssignStudentId(event.target.value)}>
                {students.map((student) => (
                  <option value={student.id} key={student.id}>{student.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="resource-library-grid">
            {filteredResourceLibrary.map((resource) => (
              <article className="library-resource-card" key={resource.id}>
                <div>
                  <span>{resource.exam} · {resource.lesson} · {resource.level}</span>
                  <strong>{resource.title}</strong>
                  <small>{resource.publisher} · {resource.resourceType}</small>
                </div>
                <p>{resource.recommendedFor}</p>
                <div className="mini-progress-row">
                  <span>{resource.topic}</span>
                  <strong>{resource.totalUnits} {resource.unitLabel}</strong>
                </div>
                <button className="small-btn" onClick={() => handleAssignResource(resource)}>
                  Seçili öğrenciye ata
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel-card coach-report-pro menu-target print-area" id="coach-reports">
          <div className="section-head list-head">
            <div>
              <h2>Profesyonel Koç Raporları</h2>
              <p>Performans, risk, kaynak, ödev, deneme ve yanlış kapatma verileri grafiklerle tek raporda.</p>
            </div>
            <div className="filter-row no-print">
              <select value={reportMode} onChange={(event) => setReportMode(event.target.value)}>
                <option value="kurum">Tüm öğrenciler</option>
                <option value="risk">Sadece yüksek risk</option>
              </select>
              <button className="yellow-btn" onClick={handlePrintCoachReport}>PDF / Yazdır</button>
            </div>
          </div>

          <div className="report-cover">
            <div>
              <span>Koçluk Raporu</span>
              <strong>{new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}</strong>
              <p>Bu çıktı; veli görüşmesi, haftalık koç toplantısı ve kurum içi takip için hazırlanmıştır.</p>
            </div>
            <div className="report-score-ring">
              <span>Genel Sağlık</span>
              <strong>{professionalReport.healthScore}</strong>
              <small>/100</small>
            </div>
          </div>

          <div className="report-kpi-grid">
            <div className="report-kpi"><span>Öğrenci</span><strong>{professionalReport.totalStudents}</strong><small>Aktif takip</small></div>
            <div className="report-kpi danger"><span>Yüksek Risk</span><strong>{professionalReport.highRiskCount}</strong><small>Acil görüşme</small></div>
            <div className="report-kpi success"><span>Ödev Ort.</span><strong>%{professionalReport.averageHomework}</strong><small>Tamamlanma</small></div>
            <div className="report-kpi"><span>Kaynak Ort.</span><strong>%{professionalReport.averageResource}</strong><small>İlerleme</small></div>
            <div className="report-kpi"><span>TYT Ort.</span><strong>{professionalReport.averageTyt}</strong><small>Net</small></div>
            <div className="report-kpi"><span>AYT Ort.</span><strong>{professionalReport.averageAyt}</strong><small>Net</small></div>
          </div>

          <div className="report-chart-grid">
            <ReportBarChart title="Öğrenci Bazlı TYT Netleri" bars={reportStudents.map((student) => ({ label: student.name, value: Number(student.lastTytNet || 0), max: 120, unit: "net" }))} />
            <ReportBarChart title="Kaynak İlerlemesi" bars={reportStudents.map((student) => ({ label: student.name, value: Number(student.resourceProgress || 0), max: 100, unit: "%" }))} />
            <ReportBarChart title="Ödev Tamamlama" bars={reportStudents.map((student) => ({ label: student.name, value: Number(student.homeworkCompletion || 0), max: 100, unit: "%" }))} />
            <ReportBarChart title="Açık Yanlış / Eksik Alan" bars={reportStudents.map((student) => ({ label: student.name, value: (student.errors || []).filter((error) => error.status !== "Çözüldü").length, max: Math.max(1, professionalReport.maxOpenErrors), unit: "kayıt" }))} />
          </div>

          <div className="report-insight-grid">
            {professionalReport.insights.map((insight) => (
              <article className={`report-insight ${insight.tone}`} key={insight.title}>
                <span>{insight.label}</span>
                <strong>{insight.title}</strong>
                <p>{insight.detail}</p>
              </article>
            ))}
          </div>

          <div className="table-wrapper report-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Öğrenci</th>
                  <th>Risk</th>
                  <th>TYT</th>
                  <th>AYT/YDT</th>
                  <th>Kaynak</th>
                  <th>Ödev</th>
                  <th>Açık Yanlış</th>
                  <th>Koç Aksiyonu</th>
                </tr>
              </thead>
              <tbody>
                {reportStudents.map((student) => {
                  const openErrors = (student.errors || []).filter((error) => error.status !== "Çözüldü").length;
                  return (
                    <tr key={`report-${student.id}`}>
                      <td><strong>{student.name}</strong><small>{student.targetDepartment} · {student.targetUniversity}</small></td>
                      <td><span className={`risk-badge ${getRiskClass(student.riskLevel)}`}>{student.riskLevel}</span></td>
                      <td>{student.lastTytNet}</td>
                      <td>{student.lastAytNet}</td>
                      <td>%{student.resourceProgress}</td>
                      <td>%{student.homeworkCompletion}</td>
                      <td>{openErrors}</td>
                      <td>{getRecommendedCoachAction(student, openErrors)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {isFormOpen && (
          <section className="panel-card form-card">
            <div className="section-head">
              <div>
                <h2>{editingStudentId ? "Öğrenci Bilgisini Düzenle" : "Yeni Öğrenci Ekle"}</h2>
                <p>Zorunlu alan: öğrenci adı. Diğer alanlar sonradan düzenlenebilir.</p>
              </div>
            </div>

            <form className="student-form" onSubmit={handleSubmit}>
              <label>
                Öğrenci Adı Soyadı
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Örn: Ayşe Yılmaz"
                />
              </label>

              <label>
                Öğrenci E-posta
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ogrenci@ornek.com"
                />
              </label>

              <label>
                Sınıf
                <select name="grade" value={formData.grade} onChange={handleChange}>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                  <option value="Mezun">Mezun</option>
                </select>
              </label>

              <label>
                Okul
                <input
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="Örn: Bozyaka Şehit Fethi Bey Anadolu Lisesi"
                />
              </label>

              <label>
                Puan Türü
                <select name="scoreType" value={formData.scoreType} onChange={handleChange}>
                  <option value="SAY">SAY</option>
                  <option value="EA">EA</option>
                  <option value="SÖZ">SÖZ</option>
                  <option value="DİL">DİL</option>
                  <option value="TYT">TYT</option>
                </select>
              </label>

              <label>
                Hedef Bölüm
                <input
                  name="targetDepartment"
                  value={formData.targetDepartment}
                  onChange={handleChange}
                  placeholder="Örn: Tıp"
                />
              </label>

              <label>
                Hedef Üniversite
                <input
                  name="targetUniversity"
                  value={formData.targetUniversity}
                  onChange={handleChange}
                  placeholder="Örn: Ege Üniversitesi"
                />
              </label>

              <label>
                Son TYT Net
                <input
                  name="lastTytNet"
                  type="number"
                  step="0.25"
                  value={formData.lastTytNet}
                  onChange={handleChange}
                  placeholder="0"
                />
              </label>

              <label>
                Son AYT Net
                <input
                  name="lastAytNet"
                  type="number"
                  step="0.25"
                  value={formData.lastAytNet}
                  onChange={handleChange}
                  placeholder="0"
                />
              </label>

              <label>
                Kaynak İlerlemesi %
                <input
                  name="resourceProgress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.resourceProgress}
                  onChange={handleChange}
                />
              </label>

              <label>
                Ödev Tamamlama %
                <input
                  name="homeworkCompletion"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.homeworkCompletion}
                  onChange={handleChange}
                />
              </label>

              <label>
                Risk Durumu
                <select name="riskLevel" value={formData.riskLevel} onChange={handleChange}>
                  <option value="Düşük">Düşük</option>
                  <option value="Orta">Orta</option>
                  <option value="Yüksek">Yüksek</option>
                </select>
              </label>

              <label className="full-width">
                Koç Notu
                <textarea
                  name="coachNote"
                  value={formData.coachNote}
                  onChange={handleChange}
                  placeholder="Öğrenciye özel kısa takip notu"
                />
              </label>

              {studentFormError && <div className="form-message error full-width">{studentFormError}</div>}

              <div className="form-actions full-width">
                <button type="button" className="ghost-btn" onClick={cancelForm} disabled={isSubmittingStudent}>Vazgeç</button>
                <button type="submit" className="yellow-btn" disabled={isSubmittingStudent}>
                  {isSubmittingStudent ? "Kaydediliyor" : editingStudentId ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="panel-card menu-target" id="coach-students">
          <div className="section-head list-head">
            <div>
              <h2>Öğrenci Listesi</h2>
              <p>Arama, risk filtresi, detay, düzenleme ve silme işlemleri.</p>
            </div>

            <div className="filter-row">
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Öğrenci, okul, hedef ara..."
              />
              <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
                <option value="Tümü">Tüm Riskler</option>
                <option value="Düşük">Düşük</option>
                <option value="Orta">Orta</option>
                <option value="Yüksek">Yüksek</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Öğrenci</th>
                  <th>Sınıf</th>
                  <th>Puan Türü</th>
                  <th>Hedef</th>
                  <th>Son TYT</th>
                  <th>Son AYT</th>
                  <th>Kaynak %</th>
                  <th>Ödev %</th>
                  <th>Giriş</th>
                  <th>Risk</th>
                  <th>İşlem</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong>
                      <small>{student.school}</small>
                    </td>
                    <td>{student.grade}</td>
                    <td>{student.scoreType}</td>
                    <td>{student.targetDepartment}</td>
                    <td>{student.lastTytNet}</td>
                    <td>{student.lastAytNet}</td>
                    <td>%{student.resourceProgress}</td>
                    <td>%{student.homeworkCompletion}</td>
                    <td>
                      <CredentialPill account={getStudentAccount(accounts, student.id)} />
                    </td>
                    <td>
                      <span className={`risk-badge ${getRiskClass(student.riskLevel)}`}>
                        {student.riskLevel}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="small-btn" onClick={() => onOpenStudent(student)}>
                          Detay
                        </button>
                        <button className="small-btn neutral" onClick={() => startEditStudent(student)}>
                          Düzenle
                        </button>
                        <button className="small-btn danger-action" onClick={() => handleDelete(student)}>
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="11">
                      <div className="empty-state">Arama veya filtreye uygun öğrenci bulunamadı.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function ReportBarChart({ title, bars }) {
  const safeBars = bars.length > 0 ? bars : [{ label: "Veri yok", value: 0, max: 100, unit: "%" }];

  return (
    <div className="report-chart-card">
      <div className="mini-section-head">
        <strong>{title}</strong>
        <span>{safeBars.length} kayıt</span>
      </div>

      <div className="report-bars">
        {safeBars.map((bar) => {
          const percent = bar.max > 0 ? Math.min(100, Math.round((Number(bar.value || 0) / bar.max) * 100)) : 0;

          return (
            <div className="report-bar-row" key={`${title}-${bar.label}`}>
              <span>{bar.label}</span>
              <div className="report-bar-track">
                <div className="report-bar-fill" style={{ width: `${percent}%` }} />
              </div>
              <strong>{bar.value} {bar.unit}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CredentialPill({ account }) {
  if (!account) {
    return <span className="login-code-pill muted">Hesap yok</span>;
  }

  return (
    <span className="login-code-pill">
      <strong>{account.username}</strong>
      <small>Şifre: {account.accessCode}</small>
    </span>
  );
}

function getStudentAccount(accounts, studentId) {
  return accounts.find((item) =>
    item.role === "student" && String(item.studentId) === String(studentId)
  );
}

function getProfessionalCoachReport(students) {
  const totalStudents = students.length;
  const highRiskCount = students.filter((student) => student.riskLevel === "Yüksek").length;
  const averageHomework = Math.round(getAverage(students.map((student) => student.homeworkCompletion)));
  const averageResource = Math.round(getAverage(students.map((student) => student.resourceProgress)));
  const averageTyt = getAverage(students.map((student) => student.lastTytNet)).toFixed(1);
  const averageAyt = getAverage(students.map((student) => student.lastAytNet)).toFixed(1);
  const maxOpenErrors = Math.max(
    1,
    ...students.map((student) => (student.errors || []).filter((error) => error.status !== "Çözüldü").length)
  );
  const riskPenalty = highRiskCount * 12;
  const homeworkPenalty = Math.max(0, 80 - averageHomework) * 0.35;
  const resourcePenalty = Math.max(0, 75 - averageResource) * 0.25;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - riskPenalty - homeworkPenalty - resourcePenalty)));

  return {
    totalStudents,
    highRiskCount,
    averageHomework,
    averageResource,
    averageTyt,
    averageAyt,
    maxOpenErrors,
    healthScore,
    insights: [
      {
        label: "Risk Yönetimi",
        title: highRiskCount > 0 ? `${highRiskCount} öğrenci yakın takipte` : "Risk seviyesi dengeli",
        detail: highRiskCount > 0
          ? "Yüksek riskli öğrenciler için haftalık birebir görüşme, yanlış defteri ve mikro hedef kontrolü önerilir."
          : "Şu an yüksek riskli öğrenci görünmüyor; düzenli takip temposu korunmalı.",
        tone: highRiskCount > 0 ? "danger" : "success",
      },
      {
        label: "Kaynak Disiplini",
        title: `Ortalama kaynak ilerlemesi %${averageResource}`,
        detail: averageResource < 60
          ? "Kaynak bitirme temposu düşük. Koç panelindeki kütüphaneden hedefe uygun kaynak atanmalı ve haftalık sayfa/soru hedefi yazılmalı."
          : "Kaynak ilerlemesi kabul edilebilir seviyede. Deneme yanlışlarına göre kaynak önceliği güncellenmeli.",
        tone: averageResource < 60 ? "warning" : "success",
      },
      {
        label: "Ödev Rutinleri",
        title: `Ödev tamamlama ortalaması %${averageHomework}`,
        detail: averageHomework < 70
          ? "Ödev teslim disiplini güçlendirilmeli. Eksik ödevler kısa, ölçülebilir ve tarihli mikro görevlere bölünmeli."
          : "Ödev tamamlama güçlü. Zorlayıcı deneme analizi ve son tekrar planlarına ağırlık verilebilir.",
        tone: averageHomework < 70 ? "warning" : "success",
      },
    ],
  };
}

function getRecommendedCoachAction(student, openErrors) {
  if (student.riskLevel === "Yüksek") return "Acil birebir görüşme + 3 günlük kurtarma planı";
  if (openErrors >= 4) return "Yanlış kapatma oturumu planla";
  if (Number(student.resourceProgress || 0) < 45) return "Kaynak ataması ve günlük hedef belirle";
  if (Number(student.homeworkCompletion || 0) < 65) return "Ödevi mikro parçalara böl";
  return "Mevcut planı sürdür, deneme analiziyle ince ayar yap";
}


function getCoachNotifications(students) {
  const notifications = [];

  students.forEach((student) => {
    const missingHomeworks = (student.homeworks || []).filter((homework) => homework.status === "Eksik" || homework.status === "Tekrar Verildi");
    const lowResources = (student.resources || []).filter((resource) =>
      resource.status !== "Tamamlandı" &&
      Number(resource.totalUnits || 0) > 0 &&
      Number(resource.completedUnits || 0) / Number(resource.totalUnits || 1) < 0.35
    );
    const openErrors = (student.errors || []).filter((error) => error.status !== "Çözüldü");

    if (student.riskLevel === "Yüksek") {
      notifications.push({
        id: `risk-${student.id}`,
        tone: "danger",
        label: "Risk",
        title: student.name,
        detail: "Yüksek risk seviyesinde; koç görüşmesi planlanmalı.",
        student,
      });
    }

    if (missingHomeworks.length > 0) {
      notifications.push({
        id: `homework-${student.id}`,
        tone: "warning",
        label: "Ödev",
        title: student.name,
        detail: `${missingHomeworks.length} ödev eksik veya tekrar verildi.`,
        student,
      });
    }

    if (lowResources.length > 0) {
      notifications.push({
        id: `resource-${student.id}`,
        tone: "warning",
        label: "Kaynak",
        title: student.name,
        detail: `${lowResources.length} kaynakta ilerleme düşük görünüyor.`,
        student,
      });
    }

    if (openErrors.length > 0) {
      notifications.push({
        id: `error-${student.id}`,
        tone: "neutral",
        label: "Hata",
        title: student.name,
        detail: `${openErrors.length} açık hata analizi kaydı var.`,
        student,
      });
    }
  });

  if (notifications.length === 0) {
    return [{
      id: "clear",
      tone: "success",
      label: "Sistem",
      title: "Kritik uyarı yok",
      detail: "Tüm öğrenciler için takip dengeli görünüyor.",
      student: students[0] || null,
    }];
  }

  return notifications.slice(0, 8);
}

function getAverage(numbers) {
  if (!numbers.length) return 0;
  return numbers.reduce((total, number) => total + Number(number || 0), 0) / numbers.length;
}

function toNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function clampPercent(value) {
  const numberValue = toNumber(value);
  if (numberValue < 0) return 0;
  if (numberValue > 100) return 100;
  return numberValue;
}

function getRiskClass(riskLevel) {
  if (riskLevel === "Yüksek") return "risk-high";
  if (riskLevel === "Orta") return "risk-mid";
  return "risk-low";
}

function MetricBars({ items }) {
  return (
    <div className="metric-bars">
      {items.map((item) => (
        <div className="metric-bar" key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{formatChartValue(item)}</strong>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${getBarWidth(item)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BarChart({ items }) {
  return (
    <div className="bar-chart">
      {items.map((item) => (
        <div className="bar-row" key={item.label}>
          <span>{item.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${getBarWidth(item)}%` }} />
          </div>
          <strong>{formatChartValue(item)}</strong>
        </div>
      ))}
    </div>
  );
}

function getBarWidth(item) {
  const max = Number(item.max || 100);
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (Number(item.value || 0) / max) * 100));
}

function formatChartValue(item) {
  const value = Number(item.value || 0);
  if (item.unit === "%") return `%${value.toFixed(0)}`;
  if (item.unit === "net") return value.toFixed(1);
  return value.toFixed(0);
}

export default CoachDashboard;
