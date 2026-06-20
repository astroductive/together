// Together — Home. Composes DS primitives + TSite shell + Three.js hero.
const { useState, useEffect } = React;
const DS = window.TogetherDesignSystem_58a58f;
const { Button, Card, Badge } = DS;
const S = window.TSite;
const TI = window.TIcons;
const { PRODUCTS, FONT_D } = S;
const IMG = { signlens: "../assets/features/recognition.png", signbridge: "../assets/features/avatar.png", handtalk: "../assets/features/sync.png" };

function LiveCard({ lang }) {
  const [i, setI] = useState(0);
  const pairs = [["إزيك؟", "How are you?"], ["شكراً", "Thank you"], ["محتاج مساعدة", "I need help"]];
  useEffect(() => { const id = setInterval(() => setI(v => (v + 1) % pairs.length), 2600); return () => clearInterval(id); }, []);
  return (
    <div style={{ position: "absolute", insetInlineEnd: 22, bottom: 22, width: 248, borderRadius: 20, background: "rgba(20,20,26,.72)", border: "1px solid rgba(255,255,255,.12)", backdropFilter: "blur(16px)", padding: 18, color: "#fff", boxShadow: "0 20px 50px rgba(0,0,0,.4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 0 3px rgba(52,211,153,.25)", animation: "tp 1.4s infinite" }} />
        <span style={{ fontSize: 11.5, color: "rgba(255,255,255,.55)", fontFamily: "var(--font-mono)", letterSpacing: ".12em", textTransform: "uppercase" }}>Live translation</span>
      </div>
      <div style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 30, letterSpacing: "-.02em", minHeight: 38 }}>{pairs[i][0]}</div>
      <div style={{ marginTop: 12, borderRadius: 12, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.1)", padding: "10px 12px", fontSize: 13.5, color: "rgba(255,255,255,.8)" }}>{pairs[i][1]}</div>
      <style>{`@keyframes tp{50%{opacity:.4}}`}</style>
    </div>
  );
}

function ProductCard({ p, lang }) {
  const [hover, setHover] = useState(false);
  const Ic = TI[p.icon];
  const t = (en, ar) => S.tr(lang, en, ar);
  return (
    <a href={p.landing} data-product={p.key} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
       style={{ textDecoration: "none", display: "flex", flexDirection: "column", borderRadius: 28, overflow: "hidden", background: "var(--surface-solid)", border: "1px solid var(--border)", boxShadow: hover ? "0 30px 70px rgba(14,16,24,.16)" : "0 1px 3px rgba(14,16,24,.05),0 12px 32px rgba(14,16,24,.07)", transform: hover ? "translateY(-6px)" : "none", transition: "all .4s var(--ease-out-expo)" }}>
      <div style={{ position: "relative", height: 180, background: `linear-gradient(160deg, ${p.accent}14, ${p.accent}04)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <img src={IMG[p.key]} alt="" style={{ height: 150, objectFit: "contain", transform: hover ? "scale(1.06)" : "scale(1)", transition: "transform .5s var(--ease-out-expo)" }} />
        <span style={{ position: "absolute", top: 16, insetInlineStart: 16, width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: p.accent, color: "#fff", boxShadow: `0 8px 20px ${p.accent}44` }}><Ic size={19} /></span>
      </div>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: p.accent }}>{t(p.tag.en, p.tag.ar)}</span>
        <span style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 26, letterSpacing: "-.025em", color: "var(--text)" }}>{p.name}</span>
        <span style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", flex: 1 }}>{t(p.blurb.en, p.blurb.ar)}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, color: p.accent, fontWeight: 650, fontSize: 14, marginTop: 4 }}>{t("Explore", "اكتشف")} <TI.arrowRight size={15} /></span>
      </div>
    </a>
  );
}

function Home() {
  const [lang, setLang] = S.useLang();
  const t = (en, ar) => S.tr(lang, en, ar);
  const mono = { fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--muted)" };

  return (
    <div className="t-scope" style={{ minHeight: "100vh", overflowX: "hidden", background: "var(--bg)", color: "var(--text)" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "radial-gradient(circle at 12% 8%, #fff, transparent 30%), radial-gradient(circle at 88% 12%, rgba(31,138,130,.06), transparent 32%), linear-gradient(180deg,#fafafa,#f1f1ef)" }} />
      <S.Nav current="home" lang={lang} setLang={setLang} />

      {/* Hero */}
      <section style={{ padding: "150px 24px 70px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.02fr .98fr", gap: 44, alignItems: "center" }} className="h-hero">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 15px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--glass-bg)", backdropFilter: "blur(10px)", marginBottom: 26 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)" }} />
              <span style={mono}>{t("Built for everyday conversations", "مصمّم للمحادثات اليومية")}</span>
            </div>
            <h1 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(48px,6.6vw,92px)", lineHeight: 1.02, letterSpacing: "-.045em", margin: 0 }}>
              {t("Sign, speak, read", "إشارة، كلام، قراءة")}<br /><span style={{ color: "var(--teal)" }}>{t("— together.", "— معًا.")}</span>
            </h1>
            <p style={{ marginTop: 26, maxWidth: 500, fontSize: 18.5, lineHeight: 1.6, color: "var(--muted)" }}>{t("One translation layer for Egyptian and American Sign Language — turning hands into text and voice, and voice into signs, with nobody left waiting.", "طبقة ترجمة واحدة للغة الإشارة المصرية والأمريكية — تحوّل اليدين إلى نص وصوت، والصوت إلى إشارة، دون أن ينتظر أحد.")}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34 }}>
              <a href="signlens-app.html" style={{ textDecoration: "none" }}><Button variant="primary" size="lg" style={{ borderRadius: 999 }} iconRight={<TI.arrowRight size={16} />}>{t("Try it live", "جرّبها مباشرةً")}</Button></a>
              <a href="#products" style={{ textDecoration: "none" }}><Button variant="outline" size="lg" style={{ borderRadius: 999 }}>{t("Explore products", "استكشف المنتجات")}</Button></a>
            </div>
            <div style={{ display: "flex", gap: 26, marginTop: 40, flexWrap: "wrap" }}>
              {[[t("Languages", "اللغات"), "AR · ESL · EN"], [t("On-device", "على الجهاز"), "100%"], [t("Sign classes", "فئات الإشارة"), "50+"]].map(s => (
                <div key={s[0]}><div style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 22, color: "var(--text)" }}>{s[1]}</div><div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 2 }}>{s[0]}</div></div>
              ))}
            </div>
          </div>
          <div className="h-hero-panel" style={{ position: "relative", height: 480, borderRadius: 30, overflow: "hidden", background: "linear-gradient(150deg,#0e0e14,#070709)", border: "1px solid rgba(255,255,255,.06)", boxShadow: "0 40px 100px rgba(0,0,0,.28)" }}>
            <window.ThreeScene accent="#1f8a82" type="field" />
            <div style={{ position: "absolute", top: 20, insetInlineStart: 22, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.45)" }}>Real-time signal</div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{ borderBlock: "1px solid var(--border)", background: "rgba(255,255,255,.5)", backdropFilter: "blur(10px)", padding: "26px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", gap: 44, animation: "hmarq 28s linear infinite" }}>
          {[...Array(3)].flatMap((_, k) => (lang === "ar" ? ["إشارة ← نص", "إشارة ← صوت", "صوت ← إشارة", "نص ← إشارة", "اجتماعات حيّة", "ESL · ASL"] : ["SIGN → TEXT", "SIGN → SPEECH", "SPEECH → SIGN", "TEXT → SIGN", "LIVE MEETINGS", "ESL · ASL"]).map((x, i) =>
            <span key={k + "-" + i} style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 21, letterSpacing: "-.02em", color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 44 }}>{x}<span style={{ color: "var(--teal)" }}>✦</span></span>
          ))}
        </div>
        <style>{`@keyframes hmarq{to{transform:translateX(-33.33%)}}`}</style>
      </div>

      {/* Products */}
      <S.Section id="products">
        <div style={{ maxWidth: 620, marginBottom: 50, display: "flex", flexDirection: "column", gap: 16 }}>
          <S.Eyebrow>( 01 ) — {t("Three products, one platform", "ثلاثة منتجات، منصّة واحدة")}</S.Eyebrow>
          <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(36px,4.6vw,62px)", lineHeight: 1, letterSpacing: "-.04em", margin: 0 }}>{t("Every direction of the conversation.", "كل اتجاهات المحادثة.")}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }} className="h-prod-grid">
          {Object.values(PRODUCTS).map(p => <ProductCard key={p.key} p={p} lang={lang} />)}
        </div>
      </S.Section>

      {/* How it works */}
      <S.Section style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: ".8fr 1.2fr", gap: 40, alignItems: "center" }} className="h-how">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <S.Eyebrow>( 02 ) — {t("Simple workflow", "سير عمل بسيط")}</S.Eyebrow>
            <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(32px,4vw,52px)", lineHeight: 1.02, letterSpacing: "-.04em", margin: 0 }}>{t("Capture. Translate. Share — instantly.", "التقاط. ترجمة. مشاركة — فورًا.")}</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 24, overflow: "hidden" }} className="h-steps">
            {[[TI.camera, t("Capture", "التقاط"), t("Camera, microphone, or text input.", "كاميرا أو ميكروفون أو نص.")],
              [TI.languages, t("Translate", "ترجمة"), t("Egyptian & American Sign Language, on-device.", "لغة الإشارة المصرية والأمريكية، على الجهاز.")],
              [TI.send, t("Share", "مشاركة"), t("Text, speech, sign guide, or captions.", "نص أو صوت أو دليل إشارة أو ترجمة.")]].map((s, i) => {
              const Ic = s[0];
              return (
              <div key={i} style={{ background: "var(--surface-solid)", padding: 26, minHeight: 190, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "var(--accent-soft)", color: "var(--teal)" }}><Ic size={20} /></span>
                <div><div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--faint)", marginBottom: 8 }}>0{i + 1}</div>
                  <div style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 19, color: "var(--text)" }}>{s[1]}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--muted)", margin: "6px 0 0" }}>{s[2]}</p></div>
              </div>
            ); })}
          </div>
        </div>
      </S.Section>

      {/* Accuracy band (ink) */}
      <section style={{ background: "#08080a", color: "#fff", padding: "92px 24px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap", marginBottom: 44 }}>
            <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(34px,4.4vw,58px)", lineHeight: 1, letterSpacing: "-.04em", margin: 0, maxWidth: 620 }}>{t("Accurate in both languages.", "دقيق في اللغتين.")}</h2>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.4)" }}>{t("Measured on held-out test sets", "مقيس على مجموعات اختبار")}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, overflow: "hidden" }} className="h-stats">
            {[["98", "%", t("Egyptian Sign Language accuracy", "دقة لغة الإشارة المصرية")], ["88", "%", t("American Sign Language accuracy", "دقة لغة الإشارة الأمريكية")], ["100", "%", t("On-device, private", "على الجهاز، خاص")]].map(m => (
              <div key={m[2]} style={{ background: "#0d0d10", padding: "34px 24px" }}>
                <div style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 52, letterSpacing: "-.03em" }}>{m[0]}<span style={{ fontSize: 22, color: "rgba(255,255,255,.45)" }}>{m[1]}</span></div>
                <div style={{ fontSize: 13.5, color: "rgba(255,255,255,.55)", marginTop: 8 }}>{m[2]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <S.Section style={{ textAlign: "center" }}>
        <S.Eyebrow>( 03 ) — {t("Get started", "ابدأ الآن")}</S.Eyebrow>
        <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(48px,7vw,96px)", lineHeight: .92, letterSpacing: "-.05em", margin: "18px auto 0", maxWidth: 880 }}>{t("Make every room accessible.", "اجعل كل غرفة في متناول الجميع.")}</h2>
        <div style={{ marginTop: 34, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <a href="signlens-app.html" style={{ textDecoration: "none" }}><Button variant="primary" size="lg" style={{ borderRadius: 999 }} iconRight={<TI.arrowRight size={16} />}>{t("Try it live", "جرّبها مباشرةً")}</Button></a>
          <a href="auth.html" style={{ textDecoration: "none" }}><Button variant="outline" size="lg" style={{ borderRadius: 999 }}>{t("Create account", "إنشاء حساب")}</Button></a>
        </div>
      </S.Section>

      <S.Footer lang={lang} />
      <style>{`@media(max-width:900px){.h-hero,.h-how{grid-template-columns:1fr!important}.h-hero-panel{height:380px!important}.h-prod-grid{grid-template-columns:1fr!important}.h-steps{grid-template-columns:1fr!important}.h-stats{grid-template-columns:1fr 1fr!important}}`}</style>
    </div>
  );
}
window.Home = Home;
