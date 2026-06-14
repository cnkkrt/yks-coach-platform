import { useState } from "react";
import { scrollToSection } from "../utils/navigation.js";

function AdminDashboard({
  students,
  resourceLibrary = [],
  videoPlaylists = [],
  onLogout,
  activeAccount,
  accounts = [],
  theme,
  onToggleTheme,
  systemStatus,
  appConfig,
  backendConfig,
  appVersion,
  onExportBackup,
  onImportBackup,
  onAddAccount,
  onDeleteAccount,
  onResetAccounts,
  onAssignCoach,
}) {
  const totalStudents = students.length;
  const coachAccounts = accounts.filter((account) => account.role === "coach");
  const parentAccounts = accounts.filter((account) => account.role === "parent");
  const totalCoaches = coachAccounts.length;
  const highRiskCount = students.filter((student) => student.riskLevel === "Yüksek").length;
  const totalVideoCount = videoPlaylists.reduce((sum, playlist) => sum + (playlist.videos?.length || 0), 0);
  const averageResourceProgress =
    students.length > 0
      ? students.reduce((total, student) => total + student.resourceProgress, 0) / students.length
      : 0;
  const institutionAlerts = getInstitutionAlerts(students, averageResourceProgress);
  const publishReadiness = getPublishReadiness({ students, accounts, coachAccounts, parentAccounts, appConfig, backendConfig });
  const [activeMenu, setActiveMenu] = useState("admin-overview");
  const [accountForm, setAccountForm] = useState({
    role: "student",
    name: "",
    email: "",
    title: "",
    accessCode: "",
    studentId: students[0]?.id || "",
  });
  const handleMenuClick = (sectionId) => {
    setActiveMenu(sectionId);
    scrollToSection(sectionId);
  };
  const handleAccountFieldChange = (field, value) => {
    setAccountForm((currentForm) => ({
      ...currentForm,
      [field]: value,
      ...(field === "role" && !["student", "parent"].includes(value) ? { studentId: "" } : {}),
    }));
  };
  const handleAccountSubmit = (event) => {
    event.preventDefault();

    if (!accountForm.name.trim() || !accountForm.email.trim() || !accountForm.accessCode.trim()) {
      alert("Hesap adı, e-posta ve şifre zorunludur.");
      return;
    }

    onAddAccount({
      ...accountForm,
      name: accountForm.name.trim(),
      email: accountForm.email.trim(),
      username: accountForm.email.trim(),
      title: accountForm.title.trim(),
      accessCode: accountForm.accessCode.trim(),
    });
    setAccountForm({
      role: "student",
      name: "",
      email: "",
      title: "",
      accessCode: "",
      studentId: students[0]?.id || "",
    });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo-box">
          <div className="logo-mark">YK</div>
          <div>
            <strong>Yönetici Paneli</strong>
            <small>Kurum Özeti</small>
          </div>
        </div>

        <nav className="side-nav">
          <button className={activeMenu === "admin-overview" ? "active" : ""} onClick={() => handleMenuClick("admin-overview")}>Kurum Analitik</button>
          <button className={activeMenu === "admin-students" ? "active" : ""} onClick={() => handleMenuClick("admin-students")}>Kullanıcılar</button>
          <button className={activeMenu === "admin-resource-governance" ? "active" : ""} onClick={() => handleMenuClick("admin-resource-governance")}>Kaynak Havuzu</button>
          <button className={activeMenu === "admin-video-governance" ? "active" : ""} onClick={() => handleMenuClick("admin-video-governance")}>Video Yönetimi</button>
          <button className={activeMenu === "admin-settings" ? "active" : ""} onClick={() => handleMenuClick("admin-settings")}>Sistem Ayarları</button>
        </nav>

        <button className="logout-btn" onClick={onLogout}>
          Çıkış Yap
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Yönetici Ana Paneli</h1>
            <p>Kurum genelindeki kullanım, koç ve öğrenci kayıt özetini takip et. Detaylı öğrenci takibi koç panelinde kalır.</p>
          </div>
          <div className="top-actions">
            <div className="session-pill">
              <span>Oturum</span>
              <strong>{activeAccount?.name || "Yönetici"}</strong>
            </div>
            <button className="theme-toggle" onClick={onToggleTheme}>
              <span className="theme-toggle-dot" />
              {theme === "dark" ? "Gündüz modu" : "Gece modu"}
            </button>
          </div>
        </header>

        <section className="stats-grid menu-target" id="admin-overview">
          <div className="stat-card">
            <span>Toplam Öğrenci</span>
            <strong>{totalStudents}</strong>
            <small>Kayıtlı öğrenci</small>
          </div>

          <div className="stat-card">
            <span>Toplam Koç</span>
            <strong>{totalCoaches}</strong>
            <small>Aktif koç</small>
          </div>

          <div className="stat-card danger">
            <span>Yakın Takip Gereken</span>
            <strong>{highRiskCount}</strong>
            <small>Sadece kurum özeti</small>
          </div>

          <div className="stat-card success">
            <span>Ortalama Kaynak İlerlemesi</span>
            <strong>%{averageResourceProgress.toFixed(0)}</strong>
            <small>Kurum geneli</small>
          </div>

          <div className="stat-card">
            <span>Video Havuzu</span>
            <strong>{totalVideoCount}</strong>
            <small>{videoPlaylists.length} oynatma listesi</small>
          </div>
        </section>

        <section className="panel-card notification-center menu-target" id="admin-reports">
          <div className="section-head">
            <div>
              <h2>Kurum Bildirimleri</h2>
              <p>Yönetici için risk, ilerleme ve takip uyarıları.</p>
            </div>
          </div>

          <div className="notification-list">
            {institutionAlerts.map((alert) => (
              <div className={`notification-item ${alert.tone}`} key={alert.id}>
                <span>{alert.label}</span>
                <strong>{alert.title}</strong>
                <small>{alert.detail}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="panel-card menu-target" id="admin-coaches">
          <div className="section-head">
            <div>
              <h2>Koçlar</h2>
              <p>Kurum için aktif koç hesapları.</p>
            </div>
          </div>

          <div className="notification-list">
            {coachAccounts.map((coach) => {
              const assignedStudentCount = students.filter((student) => student.coachId === coach.id).length;

              return (
                <div className="notification-item success" key={coach.id}>
                  <span>Koç</span>
                  <strong>{coach.name}</strong>
                  <small>{assignedStudentCount} öğrenci takibinde, rapor ve bildirim merkezi aktif.</small>
                </div>
              );
            })}
            {coachAccounts.length === 0 && (
              <div className="notification-item warning">
                <span>Eksik</span>
                <strong>Koç hesabı yok</strong>
                <small>Hesap yönetiminden gerçek e-postalı koç eklenmeli.</small>
              </div>
            )}
          </div>
        </section>

        <section className="panel-card menu-target" id="admin-students">
          <div className="section-head">
            <div>
              <h2>Kurum Öğrenci Özeti</h2>
              <p>Bu tablo yöneticinin genel durumu hızlı görmesi içindir.</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Öğrenci</th>
                  <th>Sınıf</th>
                  <th>Puan Türü</th>
                  <th>Kaynak %</th>
                  <th>Ödev %</th>
                  <th>Koç</th>
                  <th>Koç Takibi</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.name}</strong>
                      <small>{student.school}</small>
                    </td>
                    <td>{student.grade}</td>
                    <td>{student.scoreType}</td>
                    <td>%{student.resourceProgress}</td>
                    <td>%{student.homeworkCompletion}</td>
                    <td>
                      <select
                        className="inline-table-select"
                        value={student.coachId || "coach-demo"}
                        onChange={(event) => onAssignCoach(student.id, event.target.value)}
                      >
                        {coachAccounts.map((coach) => (
                          <option value={coach.id} key={coach.id}>{coach.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`risk-badge ${getRiskClass(student.riskLevel)}`}>
                        {student.riskLevel === "Yüksek" ? "Yakın takip" : "Normal"}
                      </span>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state">Kayıtlı öğrenci bulunamadı.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel-card menu-target" id="admin-resource-governance">
          <div className="section-head">
            <div>
              <h2>Genel Kaynak Havuzu Yönetimi</h2>
              <p>Kurumun ortak kaynak standardı. Koçlar bu havuzdan öğrenciye kaynak atar; öğrenci sadece kendisine atanmış “Kaynaklarım” listesini görür.</p>
            </div>
          </div>

          <div className="report-kpi-grid">
            <div className="report-kpi">
              <span>Toplam Kaynak</span>
              <strong>{resourceLibrary.length}</strong>
              <small>Kurum havuzu</small>
            </div>
            <div className="report-kpi">
              <span>TYT</span>
              <strong>{resourceLibrary.filter((resource) => resource.exam === "TYT").length}</strong>
              <small>Kaynak</small>
            </div>
            <div className="report-kpi">
              <span>AYT</span>
              <strong>{resourceLibrary.filter((resource) => resource.exam === "AYT").length}</strong>
              <small>Kaynak</small>
            </div>
            <div className="report-kpi">
              <span>YDT</span>
              <strong>{resourceLibrary.filter((resource) => resource.exam === "YDT").length}</strong>
              <small>Kaynak</small>
            </div>
          </div>

          <div className="resource-library-grid admin-library-grid">
            {resourceLibrary.map((resource) => (
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
              </article>
            ))}
          </div>
        </section>

        <section className="panel-card menu-target" id="admin-video-governance">
          <div className="section-head">
            <div>
              <h2>Video Yönetimi</h2>
              <p>YKS LİNK.zip içinden gelen YouTube havuzu. Admin burada ders, seviye ve liste kapsamını denetler.</p>
            </div>
          </div>

          <div className="resource-library-grid">
            {videoPlaylists.map((playlist) => (
              <article className="resource-card" key={playlist.id}>
                <div className="resource-card-head">
                  <span>{playlist.exam} · {playlist.level}</span>
                  <strong>{playlist.lesson}</strong>
                </div>
                <h3>{playlist.title}</h3>
                <p>{playlist.channel || "YouTube"} · {playlist.topic || "Genel"} · {playlist.videos?.length || 0} video</p>
                <div className="mini-progress-row">
                  <span>Kaynak</span>
                  <strong>{playlist.sourceType || "Video havuzu"}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel-card menu-target" id="admin-settings">
          <div className="section-head">
            <div>
              <h2>Ayarlar</h2>
              <p>Kurum verisi, yedekleme ve gerçek sistem geçiş durumu.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="summary-row">
              <span>Oturum</span>
              <strong>{activeAccount?.name || "Yönetici"}</strong>
            </div>
            <div className="summary-row">
              <span>Veri</span>
              <strong>{systemStatus?.mode || "Yerel demo modu"}</strong>
            </div>
            <div className="summary-row">
              <span>Yetki Mantığı</span>
              <strong>Admin: kurum / Koç: takip / Öğrenci: giriş</strong>
            </div>
            <div className="summary-row">
              <span>Sürüm</span>
              <strong>{appVersion}</strong>
            </div>
          </div>

          <div className="data-admin-panel">
            <div className={`notification-item ${systemStatus?.tone || "neutral"}`}>
              <span>Sistem Durumu</span>
              <strong>{systemStatus?.mode || "Yerel demo modu"}</strong>
              <small>{systemStatus?.detail || "Veriler tarayıcıda saklanıyor."}</small>
            </div>

            <div className="data-admin-actions">
              <button type="button" className="yellow-btn" onClick={onExportBackup}>
                JSON Yedek İndir
              </button>
              <label className="file-action-btn">
                JSON Yedek Yükle
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => {
                    onImportBackup(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div className="publish-readiness-panel">
            <div className="section-head compact-head">
              <div>
                <h2>Yayın Hazırlığı Kontrolü</h2>
                <p>Canlı kullanıma geçmeden önce tamamlanması gereken kritik başlıklar.</p>
              </div>
              <span className={`data-health-score ${publishReadiness.tone}`}>
                %{publishReadiness.score} · {publishReadiness.label}
              </span>
            </div>

            <div className="readiness-grid">
              {publishReadiness.items.map((item) => (
                <div className={`readiness-item ${item.passed ? "passed" : "failed"}`} key={item.label}>
                  <span>{item.passed ? "Tamam" : "Eksik"}</span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="account-admin-panel">
            <div className="section-head compact-head">
              <div>
                <h2>Hesap Yönetimi</h2>
                <p>Koç, öğrenci ve yönetici giriş kodlarını kurum yöneticisi belirler.</p>
              </div>
              {backendConfig?.mode === "local" && (
                <button type="button" className="small-btn" onClick={onResetAccounts}>
                  Başlangıç Hesaplarına Dön
                </button>
              )}
            </div>

            <form className="account-form-grid" onSubmit={handleAccountSubmit}>
              <label>
                Rol
                <select value={accountForm.role} onChange={(event) => handleAccountFieldChange("role", event.target.value)}>
                  <option value="student">Öğrenci</option>
                  <option value="coach">Koç</option>
                  <option value="admin">Yönetici</option>
                </select>
              </label>
              <label>
                Ad
                <input value={accountForm.name} onChange={(event) => handleAccountFieldChange("name", event.target.value)} placeholder="Hesap adı" />
              </label>
              <label>
                E-posta / Kullanıcı adı
                <input type="email" value={accountForm.email} onChange={(event) => handleAccountFieldChange("email", event.target.value)} placeholder="ogrenci@ornek.com" />
              </label>
              <label>
                Açıklama
                <input value={accountForm.title} onChange={(event) => handleAccountFieldChange("title", event.target.value)} placeholder="Panel açıklaması" />
              </label>
              <label>
                Giriş kodu
                <input value={accountForm.accessCode} onChange={(event) => handleAccountFieldChange("accessCode", event.target.value)} placeholder="Örn. 4821" />
              </label>
              <label>
                Öğrenci
                <select
                  value={accountForm.studentId}
                  disabled={!["student", "parent"].includes(accountForm.role)}
                  onChange={(event) => handleAccountFieldChange("studentId", event.target.value)}
                >
                  <option value="">Bağlı öğrenci yok</option>
                  {students.map((student) => (
                    <option value={student.id} key={student.id}>{student.name}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="yellow-btn">Hesap Ekle</button>
            </form>

            <div className="account-list">
              {accounts.map((account) => (
                <article className="account-row" key={account.id}>
                  <div>
                    <span>{getRoleLabel(account.role)}</span>
                    <strong>{account.name}</strong>
                    <small>{account.title} {account.studentId ? `· Öğrenci ID: ${account.studentId}` : ""}</small>
                    <small>Kullanıcı adı: {account.username || account.email || "-"} · Şifre: {account.accessCode}</small>
                  </div>
                  <button
                    type="button"
                    className="small-btn danger-action"
                    disabled={accounts.length <= 1}
                    onClick={() => onDeleteAccount(account.id)}
                  >
                    Sil
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function getInstitutionAlerts(students, averageResourceProgress) {
  const highRiskCount = students.filter((student) => student.riskLevel === "Yüksek").length;
  const lowHomeworkCount = students.filter((student) => Number(student.homeworkCompletion || 0) < 50).length;
  const openErrorCount = students.reduce((total, student) => {
    return total + (student.errors || []).filter((error) => error.status !== "Çözüldü").length;
  }, 0);
  const alerts = [];

  if (highRiskCount > 0) {
    alerts.push({
      id: "high-risk",
      tone: "danger",
      label: "Risk",
      title: `${highRiskCount} yüksek riskli öğrenci`,
      detail: "Koç görüşmeleri ve veli bilgilendirmeleri önceliklendirilmeli.",
    });
  }

  if (lowHomeworkCount > 0) {
    alerts.push({
      id: "homework",
      tone: "warning",
      label: "Ödev",
      title: `${lowHomeworkCount} öğrencide düşük ödev tamamlama`,
      detail: "Haftalık görev yoğunluğu ve takip sıklığı gözden geçirilmeli.",
    });
  }

  if (openErrorCount > 0) {
    alerts.push({
      id: "errors",
      tone: "neutral",
      label: "Hata Analizi",
      title: `${openErrorCount} açık hata kaydı`,
      detail: "Çözülen/tekrar planlanan kayıtlar kurum raporuna yansıtılmalı.",
    });
  }

  if (averageResourceProgress < 50) {
    alerts.push({
      id: "resource-average",
      tone: "warning",
      label: "Kaynak",
      title: "Kaynak ortalaması düşük",
      detail: "Kurum genelinde kaynak ilerleme planı sıkılaştırılmalı.",
    });
  }

  if (alerts.length === 0) {
    return [{
      id: "clear",
      tone: "success",
      label: "Sistem",
      title: "Kurum takip dengeli",
      detail: "Risk ve ilerleme metriklerinde kritik uyarı yok.",
    }];
  }

  return alerts;
}

function getPublishReadiness({ students, accounts, coachAccounts, parentAccounts, appConfig, backendConfig }) {
  const assignedStudents = students.filter((student) => Boolean(student.coachId));
  const studentAccounts = accounts.filter((account) => account.role === "student");
  const adminAccounts = accounts.filter((account) => account.role === "admin");
  const remoteBackendReady = backendConfig?.mode === "firestore" || (backendConfig?.mode === "remote" && Boolean(backendConfig?.apiUrl));
  const productionMode = appConfig?.mode === "production";
  const firebaseAuthMode = appConfig?.authMode === "firebase";
  const accountsWithEmail = accounts.filter((account) => isRealEmail(account.email || account.username));
  const localEmailAccounts = accounts.filter((account) => String(account.email || account.username || "").endsWith("@yks.local"));
  const realCoachAccounts = coachAccounts.filter((account) => isRealEmail(account.email || account.username));
  const realAdminAccounts = adminAccounts.filter((account) => isRealEmail(account.email || account.username));
  const studentAccountsWithEmail = studentAccounts.filter((account) => isRealEmail(account.email || account.username));
  const verifiedStudentAccounts = studentAccounts.filter((account) => account.emailVerified || account.isDemo);
  const items = [
    {
      label: "Uygulama modu",
      passed: productionMode ? remoteBackendReady : true,
      detail: productionMode ? "Production mod aktif" : `${appConfig?.mode || "pilot"} mod; pilot kullanım için uygun`,
      weight: 10,
    },
    {
      label: "Öğrenci kayıtları",
      passed: students.length > 0,
      detail: `${students.length} öğrenci kayıtlı`,
      weight: 10,
    },
    {
      label: "Koç hesapları",
      passed: realCoachAccounts.length > 0,
      detail: `${realCoachAccounts.length}/${coachAccounts.length} gerçek e-postalı koç hesabı`,
      weight: 10,
    },
    {
      label: "Öğrenci hesapları",
      passed: studentAccounts.length > 0 && studentAccountsWithEmail.length === studentAccounts.length,
      detail: `${studentAccountsWithEmail.length}/${studentAccounts.length} öğrenci hesabında gerçek e-posta`,
      weight: 10,
    },
    {
      label: "Veli hesapları",
      passed: true,
      detail: parentAccounts.length > 0 ? `${parentAccounts.length} veli hesabı` : "Bu kurulumda veli paneli kullanılmıyor",
      weight: 0,
    },
    {
      label: "Koç atamaları",
      passed: students.length > 0 && assignedStudents.length === students.length,
      detail: `${assignedStudents.length}/${students.length || 0} öğrenci koça atanmış`,
      weight: 14,
    },
    {
      label: "Yedekleme",
      passed: true,
      detail: "JSON yedek alma ve yükleme aktif",
      weight: 12,
    },
    {
      label: "Yönetici hesabı",
      passed: realAdminAccounts.length > 0,
      detail: `${realAdminAccounts.length}/${adminAccounts.length} gerçek e-postalı yönetici hesabı`,
      weight: 10,
    },
    {
      label: "Firebase Auth",
      passed: firebaseAuthMode,
      detail: firebaseAuthMode ? "Firebase giriş modu aktif" : "VITE_AUTH_MODE=firebase yapılmalı",
      weight: 12,
    },
    {
      label: "Firebase e-posta doğrulama",
      passed: studentAccounts.length > 0 && verifiedStudentAccounts.length === studentAccounts.length,
      detail: `${verifiedStudentAccounts.length}/${studentAccounts.length} öğrenci e-postası doğrulanmış`,
      weight: 12,
    },
    {
      label: "Demo e-posta temizliği",
      passed: localEmailAccounts.length === 0,
      detail: localEmailAccounts.length === 0 ? `${accountsWithEmail.length} gerçek e-posta hesabı` : `${localEmailAccounts.length} adet @yks.local hesap kaldı`,
      weight: 8,
    },
    {
      label: "Uzak backend",
      passed: remoteBackendReady,
      detail: backendConfig?.mode === "firestore" ? "Firebase Firestore aktif" : remoteBackendReady ? backendConfig.apiUrl : "Yerel mod; canlı yayın için backend bağlanmalı",
      weight: 18,
    },
  ];
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const passedWeight = items.reduce((sum, item) => sum + (item.passed ? item.weight : 0), 0);
  const score = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 0;

  return {
    score,
    label: score >= 85 ? "Yayına yakın" : score >= 65 ? "Pilot hazır" : "Eksik var",
    tone: score >= 85 ? "good" : score >= 65 ? "warn" : "bad",
    items,
  };
}

function isRealEmail(value) {
  const email = String(value || "").trim();
  return email.includes("@") && !email.endsWith("@yks.local");
}

function getRiskClass(riskLevel) {
  if (riskLevel === "Yüksek") return "risk-high";
  if (riskLevel === "Orta") return "risk-mid";
  return "risk-low";
}

function getRoleLabel(role) {
  if (role === "coach") return "Koç";
  if (role === "admin") return "Yönetici";
  if (role === "parent") return "Veli";
  return "Öğrenci";
}

export default AdminDashboard;
