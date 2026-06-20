// HandTalk app — light reskin, indigo product tint. window.HandTalkApp.
const { useState: useStateHT, useRef: useRefHT, useEffect: useEffectHT } = React;
const DSh = window.TogetherDesignSystem_58a58f;
const { Button: BtnHT, Avatar: AvHT } = DSh;
const Sht = window.TSite;
const TIht = window.TIcons;
const FONT_Dht = Sht.FONT_D;

const STREAM = [
  { who: "speaker", en: "Hi Mariam, can you see the slides?", ar: "أهلاً مريم، شايفة الشرائح؟", gloss: "SLIDES YOU SEE?" },
  { who: "signer", en: "Yes, clearly. Let's begin.", ar: "أيوه، واضحة. يلا نبدأ.", gloss: "YES CLEAR. BEGIN." },
  { who: "speaker", en: "Great — I'll share the budget first.", ar: "تمام — هشارك الميزانية الأول.", gloss: "BUDGET FIRST SHARE." },
  { who: "signer", en: "Sounds good, go ahead.", ar: "كويس، اتفضل.", gloss: "GOOD. GO." },
];

function Landmarks() {
  const pts = [[50,40],[46,48],[43,56],[55,46],[57,56],[60,46],[62,56],[64,47],[66,56]];
  return (
    <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .9 }}>
      <path d="M50 40 46 48 43 56M50 40 55 46 57 56M50 40 60 46 62 56M50 40 64 47 66 56" stroke="var(--p-accent)" strokeWidth=".5" fill="none" opacity=".5" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="1.1" fill="#34d399" style={{ animation: `tp 1.4s ${i*.06}s infinite` }} />)}
    </svg>
  );
}

function Tile({ role, name, sub, active, caption, camera, lang, t }) {
  return (
    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "var(--viewport)", border: `1px solid ${active ? "var(--p-accent)" : "var(--border)"}`, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: active ? "0 0 0 3px var(--p-accent-soft)" : "var(--shadow-sm)", transition: "all .3s" }}>
      {role === "signer" && camera && <Landmarks />}
      <div style={{ position: "relative" }}>{camera ? <AvHT name={name} size={84} style={role === "speaker" ? { background: "var(--sand)" } : {}} /> : <div style={{ width: 84, height: 84, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--faint)" }}><TIht.videoOff size={30} /></div>}</div>
      <span style={{ position: "absolute", top: 12, insetInlineStart: 12, display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, background: "rgba(8,8,12,.64)", color: "#fff", fontSize: 11.5, fontWeight: 650 }}><TIht.hand size={13} style={{ color: role === "signer" ? "#34d399" : "var(--sand)" }} /> {name} · {sub}</span>
      {active && <span style={{ position: "absolute", top: 12, insetInlineEnd: 12, width: 9, height: 9, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 0 3px rgba(52,211,153,.25)", animation: "tp 1.4s infinite" }} />}
      {caption && (
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(8,8,12,.76)", backdropFilter: "blur(8px)", color: "#fff" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".1em", color: "#34d399", textTransform: "uppercase", marginBottom: 4 }}>{role === "signer" ? t("sign → text", "إشارة ← نص") : t("speech → sign · ", "كلام ← إشارة · ") + caption.gloss}</div>
          <div style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.4 }}>{lang === "ar" ? caption.ar : caption.en}</div>
        </div>
      )}
    </div>
  );
}

function CtrlBtn({ on, onIcon, offIcon, onClick }) {
  return <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", cursor: "pointer", border: "1px solid var(--border)", background: on ? "var(--surface-solid)" : "rgba(239,68,68,.12)", color: on ? "var(--text)" : "#ef4444", boxShadow: "var(--shadow-sm)", transition: "all .2s" }}>{on ? onIcon : offIcon}</button>;
}

function HTInner({ lang, t }) {
  const [phase, setPhase] = useStateHT("lobby");
  const [mic, setMic] = useStateHT(true);
  const [cam, setCam] = useStateHT(true);
  const [captions, setCaptions] = useStateHT(true);
  const [i, setI] = useStateHT(-1);
  const tick = useRefHT(null);
  const join = () => { setPhase("connecting"); setTimeout(() => { setPhase("live"); setI(0); }, 1500); };
  useEffectHT(() => { if (phase !== "live") return; tick.current = setInterval(() => setI(n => (n + 1) % STREAM.length), 2600); return () => clearInterval(tick.current); }, [phase]);
  const cur = i >= 0 ? STREAM[i] : null;
  const card = { background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-sm)" };

  if (phase === "lobby") return (
    <div style={{ ...card, overflow: "hidden", maxWidth: 760, margin: "8px auto" }}>
      <div style={{ background: "#0a0a0c", color: "#fff", padding: "44px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 30%, var(--p-accent-soft), transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: FONT_Dht, fontWeight: 700, fontSize: 34, letterSpacing: "-.03em" }}>{t("Room · clinic-204", "غرفة · clinic-204")}</div>
          <p style={{ color: "rgba(255,255,255,.6)", marginTop: 10, fontSize: 15, maxWidth: 460, marginInline: "auto" }}>{t("A signer and a speaker, understood in both directions — live captions and sign guidance per role.", "مُشير ومتحدث، مفهومان في الاتجاهين — ترجمة حيّة وتوجيه إشارة لكل دور.")}</p>
        </div>
      </div>
      <div style={{ padding: 28, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><AvHT name="Mariam Adel" size={40} /><div><div style={{ fontSize: 13.5, fontWeight: 650 }}>{t("You", "أنت")}</div><div style={{ fontSize: 12, color: "var(--faint)" }}>{t("Signer · ESL", "مُشير · إشارة")}</div></div></div>
        <TIht.plus size={18} style={{ color: "var(--faint)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><AvHT name="Omar" size={40} style={{ background: "var(--sand)" }} /><div><div style={{ fontSize: 13.5, fontWeight: 650 }}>Omar</div><div style={{ fontSize: 12, color: "var(--faint)" }}>{t("Speaker · Voice", "متحدث · صوت")}</div></div></div>
        <BtnHT size="lg" style={{ marginInlineStart: "auto", background: "var(--p-accent)", color: "#fff" }} variant="accent" iconLeft={<TIht.video size={16} />} onClick={join}>{t("Join meeting", "ادخل الاجتماع")}</BtnHT>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="app-2col">
        <Tile role="signer" name={t("You", "أنت")} sub={t("Signer", "مُشير")} active={phase === "live" && cur && cur.who === "signer"} caption={captions && cur && cur.who === "signer" ? cur : null} camera={cam} lang={lang} t={t} />
        <Tile role="speaker" name="Omar" sub={t("Speaker", "متحدث")} active={phase === "live" && cur && cur.who === "speaker"} caption={captions && cur && cur.who === "speaker" ? cur : null} camera={true} lang={lang} t={t} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        {phase === "connecting" && <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{t("Connecting…", "جارٍ الاتصال…")}</span>}
        <CtrlBtn on={mic} onIcon={<TIht.mic size={18} />} offIcon={<TIht.micOff size={18} />} onClick={() => setMic(v => !v)} />
        <CtrlBtn on={cam} onIcon={<TIht.video size={18} />} offIcon={<TIht.videoOff size={18} />} onClick={() => setCam(v => !v)} />
        <CtrlBtn on={captions} onIcon={<TIht.captions size={18} />} offIcon={<TIht.captions size={18} />} onClick={() => setCaptions(v => !v)} />
        <button onClick={() => { setPhase("lobby"); setI(-1); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer", padding: "11px 20px", borderRadius: 999, background: "#ef4444", color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 650, fontSize: 13.5 }}><TIht.phone size={17} style={{ transform: "rotate(135deg)" }} /> {t("Leave", "مغادرة")}</button>
      </div>
    </>
  );
}

function HandTalkApp() {
  return <window.TAppFrame which="handtalk">{(lang, t) => <HTInner lang={lang} t={t} />}</window.TAppFrame>;
}
window.HandTalkApp = HandTalkApp;
