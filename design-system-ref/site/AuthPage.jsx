// Together — Auth (login / signup). window.AuthPage.
const { useState: useStateA } = React;
const DSa = window.TogetherDesignSystem_58a58f;
const { Button: BtnA, Input: InputA } = DSa;
const Sa = window.TSite;
const TIa = window.TIcons;
const FONT_Da = Sa.FONT_D;

function AuthPage() {
  const [lang, setLang] = Sa.useLang();
  const [mode, setMode] = useStateA("signin");
  const t = (en, ar) => Sa.tr(lang, en, ar);
  const signup = mode === "signup";

  return (
    <div className="t-scope" style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <Sa.Nav current="auth" lang={lang} setLang={setLang} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="auth-grid">
        {/* form */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px 48px" }}>
          <div style={{ width: "100%", maxWidth: 400 }}>
            <div style={{ display: "inline-flex", gap: 2, padding: 3, borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", marginBottom: 28 }}>
              {[["signin", t("Sign in", "تسجيل الدخول")], ["signup", t("Create account", "إنشاء حساب")]].map(([v, l]) => (
                <button key={v} onClick={() => setMode(v)} style={{ border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 650, padding: "8px 16px", borderRadius: 999, background: mode === v ? "var(--ink)" : "transparent", color: mode === v ? "#fff" : "var(--faint)", transition: "all .2s" }}>{l}</button>
              ))}
            </div>
            <h1 style={{ fontFamily: FONT_Da, fontWeight: 700, fontSize: 38, letterSpacing: "-.03em", margin: 0 }}>{signup ? t("Create your account", "أنشئ حسابك") : t("Welcome back", "أهلاً بعودتك")}</h1>
            <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 10 }}>{signup ? t("Start translating in both directions, in minutes.", "ابدأ الترجمة في الاتجاهين خلال دقائق.") : t("Sign in to your Together workspace.", "سجّل الدخول إلى مساحة عملك في Together.")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
              {signup && <InputA label={t("Full name", "الاسم الكامل")} placeholder={t("Mariam Adel", "مريم عادل")} />}
              <InputA label={t("Email", "البريد الإلكتروني")} type="email" placeholder="you@together.eg" defaultValue="" />
              <InputA label={t("Password", "كلمة المرور")} type="password" placeholder="••••••••" />
              <BtnA block size="lg" variant="accent" iconRight={<TIa.arrowRight size={16} />}>{signup ? t("Create account", "إنشاء حساب") : t("Sign in", "تسجيل الدخول")}</BtnA>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--faint)", fontSize: 12 }}>
                <span style={{ flex: 1, height: 1, background: "var(--border)" }} /> {t("or", "أو")} <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
              </div>
              <BtnA block size="lg" variant="ghost">{t("Continue with Google", "المتابعة مع Google")}</BtnA>
            </div>
            <p style={{ marginTop: 22, fontSize: 13, color: "var(--faint)", textAlign: "center" }}>
              {signup ? t("Already have an account? ", "لديك حساب؟ ") : t("New to Together? ", "جديد على Together؟ ")}
              <a onClick={() => setMode(signup ? "signin" : "signup")} style={{ color: "var(--teal)", fontWeight: 650, cursor: "pointer" }}>{signup ? t("Sign in", "سجّل الدخول") : t("Create one", "أنشئ حسابًا")}</a>
            </p>
          </div>
        </div>
        {/* hero image */}
        <div className="auth-hero" style={{ position: "relative", overflow: "hidden", background: "#0a0a0c" }}>
          <img src="../assets/auth-hero.png" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,8,10,.35), rgba(8,8,10,.05) 40%, rgba(8,8,10,.7))" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 48, color: "#fff" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", marginBottom: 14 }}>Together · Cairo</div>
            <div style={{ fontFamily: FONT_Da, fontWeight: 600, fontSize: 32, letterSpacing: "-.025em", lineHeight: 1.1, maxWidth: 420 }}>{t("Make every room accessible.", "اجعل كل غرفة في متناول الجميع.")}</div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:860px){.auth-grid{grid-template-columns:1fr!important}.auth-hero{display:none!important}}`}</style>
    </div>
  );
}
window.AuthPage = AuthPage;
