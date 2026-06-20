// SignBridge app — light reskin, amber product tint. window.SignBridgeApp.
const { useState: useStateSB, useRef: useRefSB, useEffect: useEffectSB } = React;
const DSb = window.TogetherDesignSystem_58a58f;
const { Button: BtnSB, Segmented: SegSB } = DSb;
const Ssb = window.TSite;
const TIsb = window.TIcons;
const FONT_Dsb = Ssb.FONT_D;

const PRESETS = [
  { en: "How are you?", ar: "إزيك؟", gloss: ["YOU", "HOW"] },
  { en: "I need help", ar: "محتاج مساعدة", gloss: ["HELP", "ME", "NEED"] },
  { en: "Thank you very much", ar: "شكراً جزيلاً", gloss: ["THANK-YOU", "MUCH"] },
  { en: "Where is the clinic?", ar: "فين العيادة؟", gloss: ["CLINIC", "WHERE"] },
];
const STOP = new Set(["the", "a", "an", "is", "are", "to", "of", "and"]);
function toGloss(text) {
  const hit = PRESETS.find(p => p.en.toLowerCase() === text.trim().toLowerCase() || p.ar === text.trim());
  if (hit) return hit.gloss;
  return text.trim().toUpperCase().replace(/[^\wء-ي\s]/g, "").split(/\s+/).filter(w => w && !STOP.has(w.toLowerCase())).slice(0, 8);
}

function PoseAvatar({ frame, playing }) {
  const poses = [{ la: -20, ra: 20, h: 0 }, { la: -55, ra: 50, h: -3 }, { la: -35, ra: 70, h: 2 }, { la: -70, ra: 35, h: -2 }, { la: -25, ra: 25, h: 0 }];
  const p = poses[frame % poses.length];
  const T = "transform .5s cubic-bezier(.16,1,.3,1)";
  return (
    <svg viewBox="0 0 200 220" style={{ width: 200, height: 220 }}>
      <defs><linearGradient id="sbgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--p-accent)" /><stop offset="1" stopColor="var(--p-accent-strong)" /></linearGradient></defs>
      <circle cx="100" cy={42 + p.h} r="20" fill="url(#sbgrad)" style={{ transition: T }} />
      <rect x="82" y="64" width="36" height="62" rx="16" fill="var(--p-accent)" opacity=".85" />
      <g style={{ transformOrigin: "82px 78px", transform: `rotate(${p.la}deg)`, transition: T }}>
        <rect x="58" y="74" width="30" height="11" rx="5.5" fill="url(#sbgrad)" />
        <circle cx="58" cy="79" r="7" fill="#34d399" style={{ filter: playing ? "drop-shadow(0 0 6px #34d399)" : "none" }} />
      </g>
      <g style={{ transformOrigin: "118px 78px", transform: `rotate(${p.ra}deg)`, transition: T }}>
        <rect x="112" y="74" width="30" height="11" rx="5.5" fill="url(#sbgrad)" />
        <circle cx="142" cy="79" r="7" fill="#34d399" style={{ filter: playing ? "drop-shadow(0 0 6px #34d399)" : "none" }} />
      </g>
    </svg>
  );
}

function SBInner({ lang, t }) {
  const [src, setSrc] = useStateSB("text");
  const [text, setText] = useStateSB(lang === "ar" ? "إزيك؟" : "How are you?");
  const [gloss, setGloss] = useStateSB(["YOU", "HOW"]);
  const [frame, setFrame] = useStateSB(0);
  const [playing, setPlaying] = useStateSB(false);
  const [speed, setSpeed] = useStateSB("1");
  const [listening, setListening] = useStateSB(false);
  const timer = useRefSB(null);
  useEffectSB(() => {
    if (!playing || gloss.length === 0) return;
    const ms = 900 / parseFloat(speed);
    timer.current = setInterval(() => setFrame(f => { if (f + 1 >= gloss.length) { setPlaying(false); return f; } return f + 1; }), ms);
    return () => clearInterval(timer.current);
  }, [playing, speed, gloss]);
  const translate = (tx) => { const g = toGloss(tx || text); setGloss(g); setFrame(0); setPlaying(g.length > 0); };
  const current = gloss[frame] || "—";
  const card = { background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-sm)" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 22, alignItems: "start" }} className="app-2col">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ ...card, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--faint)" }}>{src === "text" ? t("Type a phrase", "اكتب جملة") : t("Speak a phrase", "تكلّم بجملة")}</div>
            <SegSB value={src} onChange={setSrc} options={[{ value: "text", label: t("Text", "نص"), icon: <TIsb.type size={14} /> }, { value: "speech", label: t("Speech", "كلام"), icon: <TIsb.mic size={14} /> }]} />
          </div>
          {src === "text" ? (
            <>
              <textarea value={text} onChange={e => setText(e.target.value)} rows={3} dir={lang === "ar" ? "rtl" : "ltr"}
                style={{ width: "100%", resize: "none", padding: "11px 13px", borderRadius: 13, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
              <Button block style={{ marginTop: 12, background: "var(--p-accent)", color: "#fff" }} variant="accent" iconLeft={<TIsb.hand size={15} />} onClick={() => translate()}>{t("Translate to sign", "ترجم إلى إشارة")}</Button>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "10px 0 4px" }}>
              <button onClick={() => { setListening(v => !v); if (!listening) setTimeout(() => { setListening(false); const x = t("I need help", "محتاج مساعدة"); setText(x); translate(x); }, 1700); }}
                style={{ width: 72, height: 72, borderRadius: "50%", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "#fff", background: listening ? "#ef4444" : "var(--p-accent)", boxShadow: listening ? "0 0 0 8px rgba(239,68,68,.15)" : "0 0 0 8px var(--p-accent-soft)", transition: "all .2s" }}>
                {listening ? <TIsb.micOff size={26} /> : <TIsb.mic size={26} />}
              </button>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{listening ? t("Listening…", "بستمع…") : t("Tap to speak", "اضغط للتحدّث")}</span>
            </div>
          )}
        </div>
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}>{t("Try a phrase", "جرّب جملة")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PRESETS.map(pr => { const label = lang === "ar" ? pr.ar : pr.en; return <button key={pr.en} onClick={() => { setText(label); translate(label); }} style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--muted)", fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 600, padding: "7px 12px", borderRadius: 999, cursor: "pointer" }}>{label}</button>; })}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ position: "relative", minHeight: 340, background: "var(--viewport)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PoseAvatar frame={frame} playing={playing} />
            <span style={{ position: "absolute", top: 14, insetInlineStart: 14, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--faint)" }}>{t("Sign guide", "دليل الإشارة")}</span>
            <div style={{ position: "absolute", bottom: 14, insetInlineStart: "50%", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "rgba(8,8,12,.72)", color: "#fff" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.55)" }}>{t("Now signing", "يوقّع الآن")}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500, color: "#34d399" }}>{current}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
            <Button style={{ background: "var(--p-accent)", color: "#fff" }} variant="accent" iconLeft={playing ? <TIsb.pause size={15} /> : <TIsb.play size={15} />} onClick={() => { if (frame + 1 >= gloss.length) setFrame(0); setPlaying(v => !v); }}>{playing ? t("Pause", "إيقاف") : t("Play", "تشغيل")}</Button>
            <Button variant="ghost" iconLeft={<TIsb.rotate size={15} />} onClick={() => { setFrame(0); setPlaying(true); }}>{t("Restart", "إعادة")}</Button>
            <div style={{ flex: 1, minWidth: 70, height: 6, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 999, background: "var(--p-accent)", width: `${gloss.length ? ((frame + 1) / gloss.length) * 100 : 0}%`, transition: "width .4s" }} /></div>
            <SegSB value={speed} onChange={setSpeed} options={[{ value: "0.5", label: "0.5×" }, { value: "1", label: "1×" }, { value: "1.5", label: "1.5×" }]} />
          </div>
        </div>
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}>{t("Gloss sequence · Topic-Comment", "تسلسل الإشارة · موضوع-تعليق")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {gloss.length === 0 && <span style={{ fontSize: 13, color: "var(--faint)" }}>{t("Translate a phrase to see its gloss.", "ترجم جملة لرؤية تسلسلها.")}</span>}
            {gloss.map((g, i) => <span key={i} onClick={() => { setFrame(i); setPlaying(false); }} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 500, padding: "7px 13px", borderRadius: 999, transition: "all .2s", background: i === frame ? "var(--p-accent)" : "var(--p-accent-soft)", color: i === frame ? "#fff" : "var(--p-accent)" }}>{g}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignBridgeApp() {
  return <window.TAppFrame which="signbridge">{(lang, t) => <SBInner lang={lang} t={t} />}</window.TAppFrame>;
}
window.SignBridgeApp = SignBridgeApp;
