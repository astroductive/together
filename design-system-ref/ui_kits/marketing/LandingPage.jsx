// Together — marketing landing page recreation.
// Composes design-system primitives (Button, Card, Logo, Badge) + shared icons.
const { useState, useRef } = React;
const DS = window.TogetherDesignSystem_58a58f;
const { Button, Card, Logo, Badge } = DS;
const I = window.TIcons;

const FONT_D = "'Bricolage Grotesque', serif";
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".22em", color: "var(--muted)" };

const features = [
  { icon: I.fileText, title: "Sign to text", tag: "MODE 01", span: 3, desc: "Turn Egyptian Sign Language into clean Arabic or English captions in real time." },
  { icon: I.volume, title: "Sign to speech", tag: "MODE 02", span: 3, desc: "Speak signed messages aloud with a natural voice — for counters, clinics, classrooms, and daily life." },
  { icon: I.hand, title: "Speech to sign", tag: "MODE 03", span: 2, desc: "Convert spoken Arabic or English into guided sign output for two-way conversations." },
  { icon: I.captions, title: "Text to sign", tag: "MODE 04", span: 2, desc: "Type a phrase and watch it become structured sign guidance that is easy to follow." },
  { icon: I.video, title: "Live meetings", tag: "MODE 05", span: 2, desc: "Add translation overlays to calls so everyone can follow the room without waiting." },
];

const fieldNotes = [
  { n: "N.001", date: "12 · MAY · 26", title: "On hands as a first language", body: "Captions are not an afterthought. We design the signing space first, then let text and voice follow its rhythm." },
  { n: "N.002", date: "28 · MAY · 26", title: "Arabic, written right to left", body: "Egyptian signing and Arabic script share a room here — every layout respects direction, diacritics, and tone." },
  { n: "N.003", date: "09 · JUN · 26", title: "Silence is a setting, not a wall", body: "A meeting overlay should disappear into the conversation. The best translation is the one nobody has to wait for." },
];

function FeatureCard({ f }) {
  const [hover, setHover] = useState(false);
  const Ic = f.icon;
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ gridColumn: `span ${f.span}`, position: "relative", overflow: "hidden",
        borderRadius: "var(--radius-2xl)", border: "1px solid var(--glass-border)",
        background: "var(--glass-bg)", backdropFilter: "blur(var(--blur))",
        boxShadow: "var(--shadow-glass)", padding: 28, minHeight: 188,
        transform: hover ? "translateY(-4px)" : "none", transition: "transform .3s var(--ease-out-expo)" }}>
      <div style={{ position: "absolute", inset: 0, background: "var(--ink)",
        transform: hover ? "translateY(0)" : "translateY(101%)", transition: "transform .5s var(--ease-inout)" }} />
      <div style={{ position: "relative", color: hover ? "#fff" : "var(--text)", transition: "color .3s", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
          <Ic size={24} stroke={1.5} style={{ color: hover ? "#fff" : "var(--muted)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".2em", color: hover ? "rgba(255,255,255,.5)" : "var(--faint)" }}>{f.tag}</span>
        </div>
        <h3 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 24, letterSpacing: "-.025em", margin: 0 }}>{f.title}</h3>
        <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 10, color: hover ? "rgba(255,255,255,.65)" : "var(--muted)" }}>{f.desc}</p>
      </div>
    </div>
  );
}

function Marquee({ items, reverse }) {
  const seq = [...items, ...items, ...items];
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ display: "inline-flex", gap: 48, animation: `t-marq 26s linear infinite ${reverse ? "reverse" : ""}` }}>
        {seq.map((it, i) => (
          <span key={i} style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 22, letterSpacing: "-.02em", color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 48 }}>
            {it}<span style={{ color: "var(--teal)" }}>✦</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes t-marq{to{transform:translateX(-33.33%)}}`}</style>
    </div>
  );
}

function Section({ id, children, style }) {
  return <section id={id} style={{ padding: "96px 24px", ...style }}><div style={{ maxWidth: 1180, margin: "0 auto" }}>{children}</div></section>;
}

function LandingPage() {
  const [menu, setMenu] = useState(false);
  return (
    <div className="t-scope" style={{ minHeight: "100vh", overflowX: "hidden", color: "var(--text)", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: -1,
        background: "radial-gradient(circle at 15% 10%, #fff, transparent 28%), radial-gradient(circle at 80% 20%, rgba(230,234,238,.75), transparent 30%), linear-gradient(180deg,#f8f8f6,#ececea)" }} />

      {/* Nav */}
      <nav style={{ position: "fixed", left: 0, right: 0, top: 0, zIndex: 50, padding: 16 }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", height: 56, borderRadius: 999,
          background: "var(--glass-bg-2)", border: "1px solid var(--glass-border)", backdropFilter: "blur(var(--blur))",
          boxShadow: "var(--shadow-glass)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px 0 18px" }}>
          <Logo size={32} />
          <div style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 14, color: "var(--muted)" }} className="lp-nav-links">
            <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>Features</a>
            <a href="#language" style={{ color: "inherit", textDecoration: "none" }}>Arabic + ESL</a>
            <a href="#notes" style={{ color: "inherit", textDecoration: "none" }}>Field notes</a>
          </div>
          <Button variant="primary" size="sm" style={{ borderRadius: 999, padding: "9px 18px" }}>Open dashboard</Button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: "112px 24px 60px" }}>
        <div className="lp-hero-ink" style={{ position: "absolute", right: 0, top: 0, height: "100%", width: "46%", background: "#050505", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 60% 40%, rgba(31,138,130,.25), transparent 55%)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.12) 1px, transparent 1px)", backgroundSize: "26px 26px", maskImage: "radial-gradient(circle at 60% 45%, #000, transparent 70%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 40, alignItems: "center" }} className="lp-hero-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <span style={{ ...mono, display: "inline-flex", borderRadius: 999, border: "1px solid var(--border)", background: "var(--glass-bg)", padding: "8px 16px", backdropFilter: "blur(12px)" }}>Built for Arabic conversations</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--faint)" }} className="lp-coords">30.0444° N, 31.2357° E</span>
            </div>
            <h1 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(52px, 8vw, 104px)", lineHeight: .9, letterSpacing: "-.045em", margin: 0, maxWidth: 760 }}>Sign, speak, read — together.</h1>
            <p style={{ marginTop: 28, maxWidth: 520, fontSize: 19, lineHeight: 1.55, color: "var(--muted)" }}>A minimal translation layer for Egyptian Sign Language and Arabic: from hands to text, voice to signs, and meetings where nobody is left outside the conversation.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 36 }}>
              <Button variant="primary" size="lg" style={{ borderRadius: 999 }} iconRight={<I.arrowRight size={16} />}>Launch dashboard</Button>
              <Button variant="outline" size="lg" style={{ borderRadius: 999 }}>Explore five modes</Button>
            </div>
          </div>
          <div className="lp-hero-card" style={{ marginInlineStart: "auto", maxWidth: 380, width: "100%" }}>
            <Card variant="glass" padding={20}>
              <div style={{ borderRadius: 24, background: "#070707", padding: 22, color: "#fff" }}>
                <Logo light size={30} />
                <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 16 }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,.45)" }}>Live translation</span>
                  <span style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 40, letterSpacing: "-.03em" }}>إزيك؟</span>
                  <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.08)", padding: 14, fontSize: 14, color: "rgba(255,255,255,.78)", backdropFilter: "blur(12px)" }}>How are you?</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,.3)", backdropFilter: "blur(var(--blur))", padding: "30px 0" }}>
        <Marquee items={["SIGN → TEXT", "SIGN → SPEECH", "SPEECH → SIGN", "TEXT → SIGN", "LIVE MEETINGS", "العربية"]} />
      </section>

      {/* Features */}
      <Section id="features">
        <div style={{ maxWidth: 560, marginBottom: 56, display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={mono}>( 01 ) — Five translation modes</span>
          <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(40px,5vw,72px)", lineHeight: 1, letterSpacing: "-.04em", margin: 0 }}>One interface for every direction.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 16 }} className="lp-feat-grid">
          {features.map((f) => <FeatureCard key={f.title} f={f} />)}
        </div>
      </Section>

      {/* Language */}
      <Section id="language" style={{ paddingTop: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 24 }} className="lp-lang-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={mono}>( 02 ) — Language first</span>
            <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(36px,4.5vw,60px)", lineHeight: 1, letterSpacing: "-.04em", margin: 0 }}>Designed for Arabic and Egyptian Sign Language.</h2>
          </div>
          <Card variant="glass" padding={40}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ borderRadius: 24, background: "var(--ink)", padding: 24, color: "#fff" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", margin: 0 }}>Arabic output</p>
                <p style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 40, margin: "32px 0 0" }}>مرحباً</p>
              </div>
              <div style={{ borderRadius: 24, border: "1px solid var(--border)", background: "var(--glass-bg-2)", padding: 24 }}>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>Egyptian Sign Language</p>
                <p style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 40, letterSpacing: "-.03em", margin: "32px 0 0" }}>ESL</p>
              </div>
            </div>
            <p style={{ marginTop: 24, fontSize: 14, lineHeight: 1.7, color: "var(--muted)" }}>Together treats language support as a first-class product choice, not a footnote — Arabic text, Arabic speech, and Egyptian signing contexts sit at the center of the experience.</p>
          </Card>
        </div>
      </Section>

      {/* Field notes */}
      <Section id="notes" style={{ paddingTop: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={mono}>( 03 ) — Field notes, unfiltered</span>
            <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(40px,5vw,72px)", lineHeight: 1, letterSpacing: "-.04em", margin: 0 }}>From the studio.</h2>
          </div>
          <span style={mono}>A column on accessible design</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border)", borderRadius: 32, overflow: "hidden", border: "1px solid var(--border)" }} className="lp-notes-grid">
          {fieldNotes.map((n) => (
            <div key={n.n} style={{ background: "var(--glass-bg-2)", backdropFilter: "blur(var(--blur))", padding: 32, minHeight: 256, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}><span>{n.n}</span><span>{n.date}</span></div>
              <div>
                <h3 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: 24, lineHeight: 1.1, letterSpacing: "-.02em", margin: 0 }}>{n.title}</h3>
                <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Workflow (ink) */}
      <section style={{ background: "#050505", color: "#fff", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ ...mono, color: "rgba(255,255,255,.35)" }}>( 04 ) — Simple workflow</span>
            <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(40px,5vw,72px)", lineHeight: 1, letterSpacing: "-.04em", margin: 0 }}>Capture the intent. Choose the output. Share it instantly.</h2>
          </div>
          <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 32, overflow: "hidden" }} className="lp-flow-grid">
            {["Camera, microphone, or text input", "Arabic / English processing", "Text, speech, sign guide, or meeting captions"].map((s, i) => (
              <div key={s} style={{ background: "rgba(255,255,255,.03)", padding: 32, minHeight: 192 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,.3)" }}>0{i + 1}</span>
                <p style={{ marginTop: 56, fontSize: 20, fontWeight: 500 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <Section style={{ textAlign: "center" }}>
        <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(52px,8vw,104px)", lineHeight: .9, letterSpacing: "-.05em", margin: "0 auto", maxWidth: 900 }}>Make every room accessible.</h2>
        <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
          <Button variant="primary" size="lg" style={{ borderRadius: 999 }} iconRight={<I.arrowRight size={16} />}>Open the dashboard</Button>
        </div>
      </Section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Logo size={32} />
          <span style={{ ...mono, fontSize: 11 }}>© 2026 Together — Cairo · Alexandria</span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px){
          .lp-nav-links,.lp-coords,.lp-hero-ink{display:none!important}
          .lp-hero-grid,.lp-lang-grid{grid-template-columns:1fr!important}
          .lp-feat-grid,.lp-notes-grid,.lp-flow-grid{grid-template-columns:1fr!important}
          .lp-feat-grid > div{grid-column:span 1!important}
          .lp-hero-card{margin:32px 0 0!important}
        }
      `}</style>
    </div>
  );
}
window.LandingPage = LandingPage;
