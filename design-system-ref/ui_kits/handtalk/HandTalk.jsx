// HandTalk — live two-person meeting (signer ↔ speaker) over the same shell.
const { useState, useRef, useEffect } = React;
const DS = window.TogetherDesignSystem_58a58f;
const { Button, Card, Badge, Avatar, Pill } = DS;
const I = window.TIcons;

// Alternating captions: signer signs (→ text), speaker talks (→ sign + text).
const STREAM = [
  { who: "speaker", name: "Omar", en: "Hi Mariam, can you see the slides?", gloss: "SLIDES YOU SEE?" },
  { who: "signer", name: "You", en: "Yes, clearly. Let's begin.", gloss: "YES CLEAR. BEGIN." },
  { who: "speaker", name: "Omar", en: "Great — I'll share the budget first.", gloss: "BUDGET FIRST SHARE." },
  { who: "signer", name: "You", en: "Sounds good, go ahead.", gloss: "GOOD. GO." },
];

function Landmarks() {
  const pts = [[50,40],[46,48],[43,56],[55,46],[57,56],[60,46],[62,56],[64,47],[66,56]];
  return (
    <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .9 }}>
      <path d="M50 40 46 48 43 56M50 40 55 46 57 56M50 40 60 46 62 56M50 40 64 47 66 56" stroke="var(--teal)" strokeWidth=".5" fill="none" opacity=".5" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="1.1" fill="var(--live)" style={{ animation: `t-pulse 1.4s ${i * .06}s infinite` }} />)}
    </svg>
  );
}

function Tile({ role, name, sub, active, caption, camera }) {
  return (
    <div style={{ position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--viewport)", border: `1px solid ${active ? "var(--teal)" : "var(--border)"}`, minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: active ? "0 0 0 3px var(--accent-soft)" : "none", transition: "all .3s" }}>
      {role === "signer" && camera && <Landmarks />}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {camera ? <Avatar name={name} size={84} /> : <div style={{ width: 84, height: 84, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--surface-2)", color: "var(--faint)" }}><I.videoOff size={30} /></div>}
      </div>
      <span style={{ position: "absolute", top: 12, insetInlineStart: 12, display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, background: "rgba(8,8,12,.62)", color: "#fff", fontSize: 11.5, fontWeight: 650 }}>
        <I.hand size={13} style={{ color: role === "signer" ? "var(--live)" : "var(--sand)" }} /> {name} · {sub}
      </span>
      {active && <span style={{ position: "absolute", top: 12, insetInlineEnd: 12, width: 9, height: 9, borderRadius: "50%", background: "var(--live)", boxShadow: "0 0 0 3px var(--live-soft)", animation: "t-pulse 1.4s infinite" }} />}
      {caption && (
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(8,8,12,.74)", backdropFilter: "blur(8px)", color: "#fff" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", color: "var(--live)", textTransform: "uppercase", marginBottom: 4 }}>{role === "signer" ? "sign → text" : "speech → sign · " + caption.gloss}</div>
          <div style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.4 }}>{caption.en}</div>
        </div>
      )}
    </div>
  );
}

function HandTalk() {
  const [phase, setPhase] = useState("lobby"); // lobby | connecting | live
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [i, setI] = useState(-1);
  const tick = useRef(null);

  const join = () => { setPhase("connecting"); setTimeout(() => { setPhase("live"); setI(0); }, 1600); };
  useEffect(() => {
    if (phase !== "live") return;
    tick.current = setInterval(() => setI((n) => (n + 1) % STREAM.length), 2600);
    return () => clearInterval(tick.current);
  }, [phase]);

  const cur = i >= 0 ? STREAM[i] : null;
  const signerCap = captions && cur && cur.who === "signer" ? cur : null;
  const speakerCap = captions && cur && cur.who === "speaker" ? cur : null;
  const statusMap = { lobby: "idle", connecting: "connecting", live: "live" };
  const labelMap = { lobby: "Not connected", connecting: "Connecting…", live: "Live · 2 in room" };

  return (
    <window.AppShell active="HandTalk" title="HandTalk" sub="Live meeting · signer ↔ speaker, translated both ways"
      status={statusMap[phase]} statusLabel={labelMap[phase]}>
      <div style={{ padding: "26px 32px" }}>
        {phase === "lobby" ? (
          <Card variant="solid" padding={0} style={{ overflow: "hidden", maxWidth: 760, margin: "10px auto" }}>
            <div style={{ background: "var(--ink)", color: "#fff", padding: "44px 40px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, letterSpacing: "-.03em" }}>Room · clinic-204</div>
              <p style={{ color: "rgba(255,255,255,.6)", marginTop: 10, fontSize: 15 }}>A signer and a speaker, understood in both directions — live captions and sign guidance per role.</p>
            </div>
            <div style={{ padding: 28, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name="Mariam Adel" size={40} /><div><div style={{ fontSize: 13.5, fontWeight: 650, color: "var(--text)" }}>You</div><div style={{ fontSize: 12, color: "var(--faint)" }}>Signer · ESL</div></div>
              </div>
              <I.plus size={18} style={{ color: "var(--faint)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name="Omar" size={40} style={{ background: "var(--sand)" }} /><div><div style={{ fontSize: 13.5, fontWeight: 650, color: "var(--text)" }}>Omar</div><div style={{ fontSize: 12, color: "var(--faint)" }}>Speaker · Arabic</div></div>
              </div>
              <Button variant="accent" size="lg" style={{ marginInlineStart: "auto" }} iconLeft={<I.video size={16} />} onClick={join}>Join meeting</Button>
            </div>
          </Card>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="ht-grid">
              <Tile role="signer" name="You" sub="Signer · ESL" active={phase === "live" && cur && cur.who === "signer"} caption={signerCap} camera={cam} />
              <Tile role="speaker" name="Omar" sub="Speaker · Arabic" active={phase === "live" && cur && cur.who === "speaker"} caption={speakerCap} camera={true} />
            </div>
            {/* control bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              <CtrlBtn on={mic} onIcon={<I.mic size={18} />} offIcon={<I.micOff size={18} />} onClick={() => setMic((v) => !v)} label="Mic" />
              <CtrlBtn on={cam} onIcon={<I.video size={18} />} offIcon={<I.videoOff size={18} />} onClick={() => setCam((v) => !v)} label="Camera" />
              <CtrlBtn on={captions} onIcon={<I.captions size={18} />} offIcon={<I.captions size={18} />} onClick={() => setCaptions((v) => !v)} label="Captions" />
              <button onClick={() => { setPhase("lobby"); setI(-1); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "none", cursor: "pointer", padding: "11px 20px", borderRadius: 999, background: "var(--danger)", color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 650, fontSize: 13.5 }}>
                <I.phone size={17} style={{ transform: "rotate(135deg)" }} /> Leave
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes t-pulse{50%{opacity:.4}}@media(max-width:1080px){.ht-grid{grid-template-columns:1fr!important}}`}</style>
    </window.AppShell>
  );
}

function CtrlBtn({ on, onIcon, offIcon, onClick, label }) {
  return (
    <button onClick={onClick} title={label} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
      border: "1px solid var(--border)", background: on ? "var(--surface-2)" : "var(--danger-soft)", color: on ? "var(--text)" : "var(--danger)", transition: "all .2s" }}>
      {on ? onIcon : offIcon}
    </button>
  );
}
window.HandTalk = HandTalk;
