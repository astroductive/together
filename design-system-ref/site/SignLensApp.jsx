// SignLens app — light reskin, site nav, teal product tint. window.SignLensApp.
const { useState, useRef, useEffect } = React;
const DS = window.TogetherDesignSystem_58a58f;
const { Button, Card, Badge, Switch } = DS;
const S = window.TSite;
const TI = window.TIcons;
const { FONT_D, PRODUCTS } = S;

const SCRIPT = [
  { gloss: "YOU", t: "00:01" },
  { gloss: "HOW", t: "00:02", en: "How are you?", ar: "إزيك؟" },
  { gloss: "ME", t: "00:05" },
  { gloss: "GOOD", t: "00:06" },
  { gloss: "THANK-YOU", t: "00:07", en: "I'm good, thank you.", ar: "أنا كويس، شكراً." },
];

function LandmarkOverlay({ live }) {
  const pts = [[50,34],[46,42],[42,50],[39,58],[54,40],[55,50],[56,59],[60,40],[62,50],[63,60],[66,41],[68,50],[69,59]];
  return (
    <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: live ? 1 : .22, transition: "opacity .4s" }}>
      <path d="M50 34 46 42 42 50 39 58M50 34 54 40 55 50 56 59M50 34 60 40 62 50 63 60M50 34 66 41 68 50 69 59" stroke="var(--p-accent)" strokeWidth=".5" fill="none" opacity=".5" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="1.1" fill="#34d399" style={{ animation: live ? `tp 1.4s ${i * .05}s infinite` : "none" }} />)}
    </svg>
  );
}

function AppFrame({ which, children }) {
  const [lang, setLang] = S.useLang();
  const p = PRODUCTS[which];
  const Ic = TI[p.icon];
  const t = (en, ar) => S.tr(lang, en, ar);
  return (
    <div className="t-scope" data-product={which} style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: `radial-gradient(circle at 12% 6%, #fff, transparent 34%), radial-gradient(circle at 90% 8%, ${p.accent}0d, transparent 32%), linear-gradient(180deg,#fafafa,#f1f1ef)` }} />
      <S.Nav current={which} lang={lang} setLang={setLang} />
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "112px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, display: "grid", placeItems: "center", background: p.accent, color: "#fff", boxShadow: `0 8px 22px ${p.accent}44` }}><Ic size={22} /></span>
            <div>
              <div style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 26, letterSpacing: "-.02em" }}>{p.name}</div>
              <div style={{ fontSize: 13, color: "var(--faint)" }}>{t(p.tag.en, p.tag.ar)}</div>
            </div>
          </div>
          <a href={p.landing} style={{ textDecoration: "none", color: "var(--muted)", fontSize: 13.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}><TI.arrowLeft size={15} /> {t("Product page", "صفحة المنتج")}</a>
        </div>
        {children(lang, t, p)}
      </main>
      <style>{`@keyframes tp{50%{opacity:.4}}@keyframes tb{0%,60%,100%{opacity:.35}30%{opacity:1}}@media(max-width:1000px){.app-2col{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

function SignLensApp() {
  return <AppFrame which="signlens">{(lang, t, p) => <Inner lang={lang} t={t} p={p} />}</AppFrame>;
}

function Inner({ lang, t, p }) {
  const [live, setLive] = useState(false);
  const [speak, setSpeak] = useState(true);
  const [log, setLog] = useState([]);
  const [sentence, setSentence] = useState({ en: "", ar: "" });
  const [copied, setCopied] = useState(false);
  const idx = useRef(0);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const step = SCRIPT[idx.current % SCRIPT.length];
      setLog((l) => [{ ...step, id: Date.now() }, ...l].slice(0, 7));
      if (step.en) setSentence({ en: step.en, ar: step.ar });
      idx.current++;
    }, 1300);
    return () => clearInterval(id);
  }, [live]);
  const reset = () => { setLive(false); setLog([]); setSentence({ en: "", ar: "" }); idx.current = 0; };
  const display = lang === "ar" ? sentence.ar : sentence.en;
  const accBtn = { background: "var(--p-accent)", color: "#fff" };
  const card = { background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-sm)" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 22, alignItems: "start" }} className="app-2col">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ position: "relative", minHeight: 340, background: "var(--viewport)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LandmarkOverlay live={live} />
            {live && <span style={{ position: "absolute", top: 14, insetInlineStart: 14, display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, background: "rgba(8,8,12,.7)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: ".05em" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,.3)", animation: "tp 1.4s infinite" }} />REC</span>}
            {!live && <div style={{ position: "relative", textAlign: "center", color: "var(--faint)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}><TI.camera size={40} style={{ opacity: .4 }} /><p style={{ fontSize: 14, maxWidth: 230, lineHeight: 1.5, margin: 0 }}>{t("Camera is off. Start recognition to translate your signs.", "الكاميرا مغلقة. ابدأ التعرّف لترجمة إشاراتك.")}</p></div>}
            {live && <div style={{ position: "absolute", bottom: 14, insetInlineStart: "50%", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 999, background: "rgba(8,8,12,.7)", color: "#fff", fontSize: 12, fontWeight: 600 }}>{t("Detecting signs", "جارٍ التعرّف")}<span style={{ display: "inline-flex", gap: 4 }}>{[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--p-accent)", animation: `tb 1.2s ${i*.15}s infinite` }} />)}</span></div>}
          </div>
          <div style={{ display: "flex", gap: 10, padding: 16, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid var(--border)" }}>
            <Button style={live ? {} : accBtn} variant={live ? "ghost" : "accent"} iconLeft={live ? <TI.pause size={15} /> : <TI.play size={15} />} onClick={() => setLive(v => !v)}>{live ? t("Pause", "إيقاف") : t("Start recognition", "ابدأ التعرّف")}</Button>
            <Button variant="ghost" iconLeft={<TI.rotate size={15} />} onClick={reset}>{t("Reset", "إعادة")}</Button>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginInlineStart: "auto" }}>
              <Switch checked={speak} onChange={setSpeak} />
              <span style={{ fontSize: 13, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6 }}><TI.volume size={15} /> {t("Speak aloud", "نطق بصوت")}</span>
            </div>
          </div>
        </div>
        <div style={{ ...card, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 10 }}>{t("Transcript", "النص")}</div>
          <div style={{ fontFamily: FONT_D, fontSize: 24, fontWeight: 500, lineHeight: 1.45, color: display ? "var(--text)" : "var(--faint)", minHeight: 34 }}>{display || (live ? t("Listening for hands…", "بانتظار اليدين…") : t("Your translation will appear here.", "ستظهر الترجمة هنا."))}</div>
          <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
            <Button size="sm" variant="soft" disabled={!display} iconLeft={copied ? <TI.check size={14} /> : <TI.copy size={14} />} onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }}>{copied ? t("Copied", "تم") : t("Copy", "نسخ")}</Button>
            <Button size="sm" variant="ghost" disabled={!display} iconLeft={<TI.volume size={14} />}>{t("Replay voice", "إعادة الصوت")}</Button>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 6px" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{t("Detected signs", "الإشارات المكتشفة")}</div>
            <Badge tone="accent">{log.length}</Badge>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: "4px 12px 14px", display: "flex", flexDirection: "column", gap: 1 }}>
            {log.length === 0 && <li style={{ padding: "14px 8px", color: "var(--faint)", fontSize: 13 }}>{t("No signs yet.", "لا إشارات بعد.")}</li>}
            {log.map(e => <li key={e.id} style={{ display: "flex", gap: 12, padding: "10px 8px", alignItems: "baseline" }}><span style={{ fontSize: 11.5, color: "var(--faint)", minWidth: 38, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{e.t}</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--p-accent)", fontWeight: 500 }}>{e.gloss}</span></li>)}
          </ul>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 1, background: "var(--border)", borderRadius: 13, overflow: "hidden", border: "1px solid var(--border)" }}>
          {[[lang === "ar" ? "98" : "88", "%", t("Accuracy", "الدقة")], ["50", "+", t("Signs", "إشارات")]].map(m => (
            <div key={m[2]} style={{ background: "var(--surface-solid)", padding: "14px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 750, fontVariantNumeric: "tabular-nums" }}>{m[0]}<span style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 600 }}>{m[1]}</span></div>
              <div style={{ fontSize: 11, color: "var(--faint)", marginTop: 3 }}>{m[2]}</div>
            </div>
          ))}
        </div>
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{t("On-device & private", "على الجهاز وخاص")}</div>
          <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--muted)", margin: 0 }}>{t("Landmark detection and inference run locally. No video ever leaves your device.", "يجري الكشف والاستدلال محليًا. لا يغادر الفيديو جهازك أبدًا.")}</p>
        </div>
      </div>
    </div>
  );
}
window.SignLensApp = SignLensApp;
window.TAppFrame = AppFrame;
window.TLandmark = LandmarkOverlay;
