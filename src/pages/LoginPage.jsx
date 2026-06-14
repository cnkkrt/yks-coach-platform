import { useEffect, useMemo, useState } from "react";

function LoginPage({
  accounts,
  loginError,
  onLogin,
  onPasswordReset,
  theme,
  onToggleTheme,
  appMode = "pilot",
}) {
  const firstAccountId = accounts[0]?.id || "";

  const [selectedAccountId, setSelectedAccountId] =
    useState(firstAccountId);

  const [username, setUsername] = useState(
    accounts[0]?.username || accounts[0]?.email || ""
  );

  const [accessCode, setAccessCode] = useState("");

  const selectedAccount = useMemo(() => {
    return (
      accounts.find(
        (account) => account.id === selectedAccountId
      ) || accounts[0]
    );
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    if (accounts.length === 0) {
      setSelectedAccountId("");
      setUsername("");
      setAccessCode("");
      return;
    }

    const selectedStillExists = accounts.some(
      (account) => account.id === selectedAccountId
    );

    if (selectedStillExists) {
      return;
    }

    const nextAccount = accounts[0];

    setSelectedAccountId(nextAccount.id);
    setUsername(
      nextAccount.username || nextAccount.email || ""
    );
    setAccessCode("");
  }, [accounts, selectedAccountId]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const effectiveAccountId = selectedAccount?.id || "";

    onLogin(
      effectiveAccountId,
      accessCode.trim(),
      username.trim()
    );
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-topline">
          <div className="brand-badge">
            YKS KOÇLUK PLATFORMU
          </div>

          <div className="version-badge">
            Kurum girişi
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
          >
            <span className="theme-toggle-dot" />

            {theme === "dark"
              ? "Gündüz modu"
              : "Gece modu"}
          </button>
        </div>

        <h1>Kurum YKS Koçluk Yönetim Paneli</h1>

        <p>
          Koçluk ekibiniz; öğrenci planlarını, ödevleri,
          kaynak ilerlemesini, deneme sonuçlarını ve günlük
          çalışma verilerini tek merkezden takip eder.
        </p>

        <div className="login-grid">
          <div className="login-cards">
            {accounts.map((account) => (
              <button
                type="button"
                className={`login-card ${
                  selectedAccount?.id === account.id
                    ? "primary"
                    : ""
                }`}
                onClick={() => {
                  setSelectedAccountId(account.id);

                  setUsername(
                    account.username ||
                      account.email ||
                      ""
                  );

                  setAccessCode("");
                }}
                key={account.id}
              >
                <span className="login-icon">
                  {getRoleIcon(account.role)}
                </span>

                <strong>
                  {getRoleLabel(account.role)}
                </strong>

                <small>
                  {account.name} · {account.title}
                </small>

                <em>
                  {appMode === "production" &&
                  account.isDemo
                    ? "Canlı modda kapalı"
                    : "Kurum hesabı"}
                </em>
              </button>
            ))}
          </div>

          <form
            className="login-form-panel"
            onSubmit={handleSubmit}
          >
            <span>Seçili hesap</span>

            <strong>{selectedAccount?.name}</strong>

            <small>
              {getRoleLabel(selectedAccount?.role)} ·{" "}
              {selectedAccount?.title}
            </small>

            <label>
              Kullanıcı Adı / E-posta

              <input
                type="email"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="ogrenci@ornek.com"
                autoComplete="username"
              />
            </label>

            <label>
              Şifre

              <input
                type="password"
                value={accessCode}
                onChange={(event) =>
                  setAccessCode(event.target.value)
                }
                placeholder="Şifre gir"
                autoComplete="current-password"
              />
            </label>

            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="yellow-btn"
            >
              Giriş Yap
            </button>

            <button
              type="button"
              className="login-link-btn"
              onClick={() =>
                onPasswordReset?.(username.trim())
              }
            >
              Şifremi Sıfırla
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function getRoleLabel(role) {
  if (role === "coach") return "Koç Hesabı";
  if (role === "student") return "Öğrenci Hesabı";
  if (role === "parent") return "Veli Hesabı";
  if (role === "admin") return "Yönetici Hesabı";

  return "Hesap";
}

function getRoleIcon(role) {
  if (role === "coach") return "K";
  if (role === "student") return "Ö";
  if (role === "parent") return "V";
  if (role === "admin") return "Y";

  return "YK";
}

export default LoginPage;