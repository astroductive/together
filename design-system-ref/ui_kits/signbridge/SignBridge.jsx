// SignBridge — Text & Speech → Sign workspace.
const { useState, useRef, useEffect } = React;
const DS = window.TogetherDesignSystem_58a58f;
const { Button, Card, Badge, Segmented, Input } = DS;
const I = window.TIcons;

// naive sentence → Topic-Comment gloss (demo presets + fallback tokenizer)
const PRESETS = {
  "How are you?": ["YOU", "HOW"],
  "I need help": ["HELP", "ME", "NEED"],
  "Thank you very much": ["THANK-YOU", "MUCH"],
  "Where is the clinic?": ["CLINIC", "WHERE"],
};
const STOP = new Set(["the", "a", "an", "is", "are", "to", "of", "and"]);
function toGloss(text) {
  const key = Object.keys(PRESETS).find((k) => k.toLowerCase() === text.trim().toLowerCase());
  if (key) return PRESETS[key];
  return text.trim().toUpperCase().replace(/[^\wء-ي\s]/g, "").split(/\s+/).filter((w) => w && !STOP.has(w.toLowerCase())).slice(0, 8);
}

// Abstract pose figure — shifts stance per frame to imply signing motion.
function PoseAvatar({ frame, playing }) {
  const poses = [
    { la: -20, ra: 20, h: 0 }, { la: -55, ra: 50, h: -3 }, { la: -35, ra: 70, h: 2 },
    { la: -70, ra: 35, h: -2 }, { la: -25, ra: 25, h: 0 },
  ];
  const p = poses[frame % poses.length];
  const T = "transform .5s cubic-bezier(.16,1,.3,1)";
  return (
    <svg viewBox="0 0 200 220" style={{ width: 200, height: 220 }}>
      <defs><linearGradient id="lim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--teal)" /><stop offset="1" stopColor="var(--teal-strong)" /></linearGradient></defs>
      {/* head */}
      <circle cx="100" cy={42 + p.h} r="20" fill="url(#lim)" style={{ transition: T }} />
      {/* torso */}
      <rect x="82" y="64" width="36" height="62" rx="16" fill="var(--teal)" opacity=".85" />
      {/* arms */}
      <g style={{ transformOrigin: "82px 78px", transform: `rotate(${p.la}deg)`, transition: T }}>
        <rect x="58" y="74" width="30" height="11" rx="5.5" fill="url(#lim)" />
        <circle cx="58" cy="79" r="7" fill="var(--live)" style={{ filter: playing ? "drop-shadow(0 0 6px var(--live))" : "none" }} />
      </g>
      <g style={{ transformOrigin: "118px 78px", transform: `rotate(${p.ra}deg)`, transition: T }}>
        <rect x="112" y="74" width="30" height="11" rx="5.5" fill="url(#lim)" />
        <circle cx="142" cy="79" r="7" fill="var(--live)" style={{ filter: playing ? "drop-shadow(0 0 6px var(--live))" : "none" }} />
      </g>
    </svg>
  );
}

function SignBridge() {
  const [src, setSrc] = useState("text");
  const [text, setText] = useState("How are you?");
  const [gloss, setGloss] = useState(["YOU", "HOW"]);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("1");
  const [listening, setListening] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing || gloss.length === 0) return;
    const ms = 900 / parseFloat(speed);
    timer.current = setInterval(() => {
      setFrame((f) => {
        if (f + 1 >= gloss.length) { setPlaying(false); return f; }
        return f + 1;
      });
    }, ms);
    return () => clearInterval(timer.current);
  }, [playing, speed, gloss]);

  const translate = (t) => { const g = toGloss(t || text); setGloss(g); setFrame(0); setPlaying(g.length > 0); };
  const current = gloss[frame] || "—";

  return (
    <window.AppShell active="SignBridge" title="SignBridge" sub="Text & Speech → Sign · Egyptian Sign Language guidance"
      status={playing ? "live" : "idle"} statusLabel={playing ? "Signing" : "Ready"}
      actions={<Segmented value={src} onChange={setSrc} options={[{ value: "text", label: "Text", icon: <I.type size={14} /> }, { value: "speech", label: "Speech", icon: <I.mic size={14} /> }]} />}>
      <div style={{ padding: "26px 32px", display: "grid", gridTemplateColumns: "360px 1fr", gap: 22, alignItems: "start" }} className="sb-content">
        {/* Left: input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card variant="solid" padding={18}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}>{src === "text" ? "Type a phrase" : "Speak a phrase"}</div>
            {src === "text" ? (
              <>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
                  style={{ width: "100%", resize: "none", padding: "11px 13px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                  placeholder="Type Arabic or English…" />
                <Button block variant="accent" style={{ marginTop: 12 }} iconLeft={<I.hand size={15} />} onClick={() => translate()}>Translate to sign</Button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "10px 0 4px" }}>
                <button onClick={() => { setListening((v) => !v); if (!listening) setTimeout(() => { setListening(false); setText("I need help"); translate("I need help"); }, 1800); }}
                  style={{ width: 72, height: 72, borderRadius: "50%", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "#fff", background: listening ? "var(--danger)" : "var(--accent)", boxShadow: listening ? "0 0 0 8px var(--danger-soft)" : "0 0 0 8px var(--accent-soft)", transition: "all .2s" }}>
                  {listening ? <I.micOff size={26} /> : <I.mic size={26} />}
                </button>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{listening ? "Listening…" : "Tap to speak"}</span>
              </div>
            )}
          </Card>
          <Card variant="solid" padding={18}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}>Try a phrase</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.keys(PRESETS).map((p) => (
                <button key={p} onClick={() => { setText(p); translate(p); }} style={{ border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--muted)", fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 600, padding: "7px 12px", borderRadius: 999, cursor: "pointer" }}>{p}</button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: avatar + gloss */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card variant="solid" padding={0} style={{ overflow: "hidden" }}>
            <div style={{ position: "relative", minHeight: 320, background: "var(--viewport)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PoseAvatar frame={frame} playing={playing} />
              <span style={{ position: "absolute", top: 14, insetInlineStart: 14, fontSize: 11, fontWeight: 700, letterSpacing: ".05em", color: "var(--faint)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Sign guide</span>
              <div style={{ position: "absolute", bottom: 14, insetInlineStart: "50%", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: "rgba(8,8,12,.7)", color: "#fff" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.55)" }}>Now signing</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500, color: "var(--live)" }}>{current}</span>
              </div>
            </div>
            {/* playback */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
              <Button variant="accent" iconLeft={playing ? <I.pause size={15} /> : <I.play size={15} />} onClick={() => { if (frame + 1 >= gloss.length) setFrame(0); setPlaying((v) => !v); }}>{playing ? "Pause" : "Play"}</Button>
              <Button variant="ghost" iconLeft={<I.rotate size={15} />} onClick={() => { setFrame(0); setPlaying(true); }}>Restart</Button>
              <div style={{ flex: 1, minWidth: 80, height: 6, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 999, background: "var(--teal)", width: `${gloss.length ? ((frame + 1) / gloss.length) * 100 : 0}%`, transition: "width .4s" }} />
              </div>
              <Segmented value={speed} onChange={setSpeed} options={[{ value: "0.5", label: "0.5×" }, { value: "1", label: "1×" }, { value: "1.5", label: "1.5×" }]} />
            </div>
          </Card>
          <Card variant="solid" padding={18}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 }}>Gloss sequence · Topic-Comment</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {gloss.length === 0 && <span style={{ fontSize: 13, color: "var(--faint)" }}>Translate a phrase to see its gloss.</span>}
              {gloss.map((g, i) => (
                <span key={i} onClick={() => { setFrame(i); setPlaying(false); }} style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 500, padding: "7px 13px", borderRadius: 999, transition: "all .2s",
                  background: i === frame ? "var(--accent)" : "var(--accent-soft)", color: i === frame ? "var(--accent-text)" : "var(--accent)" }}>{g}</span>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <style>{`@media(max-width:1080px){.sb-content{grid-template-columns:1fr!important}}`}</style>
    </window.AppShell>
  );
}
window.SignBridge = SignBridge;
