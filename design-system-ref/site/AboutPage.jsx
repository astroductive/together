// Together — About + Contact. window.AboutPage.
const { useState: useStateAb } = React;
const DSab = window.TogetherDesignSystem_58a58f;
const { Button: BtnAb, Input: InputAb } = DSab;
const Sab = window.TSite;
const TIab = window.TIcons;
const FONT_Dab = Sab.FONT_D;

function AboutPage() {
  const [lang, setLang] = Sab.useLang();
  const [sent, setSent] = useStateAb(false);
  const t = (en, ar) => Sab.tr(lang, en, ar);
  const card = { background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 22, boxShadow: "var(--shadow-sm)" };

  const values = [
    [TIab.hand, t("Hands first", "اليدين أولاً"), t("We design the signing space first, then let text and voice follow its rhythm.", "نصمّم مساحة الإشارة أولاً، ثم يتبعها النص والصوت بإيقاعها.")],
    [TIab.languages, t("Two sign languages", "لغتا إشارة"), t("Egyptian and American Sign Language sit at the center — never a translation footnote.", "لغة الإشارة المصرية والأمريكية في القلب — وليست هامشًا للترجمة.")],
    [TIab.gauge, t("No one waits", "لا أحد ينتظر"), t("The best translation is the one nobody has to wait for — it should disappear into the conversation.", "أفضل ترجمة هي التي لا ينتظرها أحد — يجب أن تختفي داخل المحادثة.")],
  ];

  return (
    <div className="t-scope" style={{ minHeight: "100vh", overflowX: "hidden", background: "var(--bg)", color: "var(--text)" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: "radial-gradient(circle at 12% 8%, #fff, transparent 32%), radial-gradient(circle at 88% 10%, rgba(31,138,130,.06), transparent 34%), linear-gradient(180deg,#fafafa,#f1f1ef)" }} />
      <Sab.Nav current="about" lang={lang} setLang={setLang} />

      {/* Hero */}
      <section style={{ padding: "150px 24px 60px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 44, alignItems: "center" }} className="ab-hero">
          <div>
            <Sab.Eyebrow>( 00 ) — {t("About Together", "عن Together")}</Sab.Eyebrow>
            <h1 style={{ fontFamily: FONT_Dab, fontWeight: 600, fontSize: "clamp(44px,5.6vw,82px)", lineHeight: .94, letterSpacing: "-.045em", margin: "16px 0 0" }}>
              {t("Built with the", "بُني مع")}<br /><span style={{ color: "var(--teal)" }}>{t("Deaf community.", "مجتمع الصمّ.")}</span>
            </h1>
            <p style={{ marginTop: 24, maxWidth: 520, fontSize: 18, lineHeight: 1.65, color: "var(--muted)" }}>{t("Together is a real-time translation layer for Egyptian and American Sign Language — made for and with the Deaf and Hard-of-Hearing community across Cairo and Alexandria.", "Together طبقة ترجمة فورية للغة الإشارة المصرية والأمريكية — صُنعت لأجل ومع مجتمع الصمّ وضعاف السمع في القاهرة والإسكندرية.")}</p>
          </div>
          <div className="ab-hero-panel" style={{ position: "relative", height: 420, borderRadius: 30, overflow: "hidden", background: "linear-gradient(150deg,#0e0e14,#070709)", border: "1px solid rgba(255,255,255,.06)", boxShadow: "0 40px 100px rgba(0,0,0,.26)" }}>
            <window.ThreeScene accent="#1f8a82" type="community" />
          </div>
        </div>
      </section>

      {/* Story with image */}
      <Sab.Section style={{ paddingTop: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: ".95fr 1.05fr", gap: 40, alignItems: "center" }} className="ab-story">
          <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", height: 380, ...card, padding: 0 }}>
            <img src="../assets/auth-hero.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <Sab.Eyebrow>{t("Our mission", "مهمتنا")}</Sab.Eyebrow>
            <h2 style={{ fontFamily: FONT_Dab, fontWeight: 600, fontSize: "clamp(30px,3.6vw,46px)", lineHeight: 1.05, letterSpacing: "-.035em", margin: "14px 0 0" }}>{t("Sign language, bridged in real time.", "لغة الإشارة، مترجمة في الوقت الفعلي.")}</h2>
            <p style={{ marginTop: 18, fontSize: 16, lineHeight: 1.7, color: "var(--muted)" }}>{t("Captions are not an afterthought. Every layout respects direction, diacritics, and tone — so a conversation flows whether it starts with hands, voice, or text. We build in the open, with the community, one room at a time.", "الترجمة ليست فكرة لاحقة. كل تصميم يحترم الاتجاه والتشكيل والنبرة — لتتدفّق المحادثة سواء بدأت باليدين أو الصوت أو النص. نبني بشفافية، مع المجتمع، غرفة تلو الأخرى.")}</p>
          </div>
        </div>
      </Sab.Section>

      {/* Values */}
      <Sab.Section style={{ paddingTop: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ab-values">
          {values.map((v, i) => { const VIc = v[0]; return (
            <div key={i} style={{ ...card, padding: 28 }}>
              <span style={{ color: "var(--teal)" }}><VIc size={24} /></span>
              <div style={{ fontFamily: FONT_Dab, fontWeight: 700, fontSize: 20, marginTop: 16 }}>{v[1]}</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", margin: "8px 0 0" }}>{v[2]}</p>
            </div>
          ); })}
        </div>
      </Sab.Section>

      {/* Contact */}
      <Sab.Section id="contact" style={{ paddingTop: 0 }}>
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr" }} className="ab-contact">
            <div style={{ background: "#0a0a0c", color: "#fff", padding: 40, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 20%, rgba(31,138,130,.18), transparent 60%)" }} />
              <div style={{ position: "relative" }}>
                <Sab.Eyebrow color="rgba(255,255,255,.5)">{t("Get in touch", "تواصل معنا")}</Sab.Eyebrow>
                <h2 style={{ fontFamily: FONT_Dab, fontWeight: 600, fontSize: 36, letterSpacing: "-.03em", margin: "14px 0 0" }}>{t("Let's talk.", "لنتحدّث.")}</h2>
                <p style={{ color: "rgba(255,255,255,.6)", fontSize: 15, lineHeight: 1.6, marginTop: 12 }}>{t("Book a demo, partner with us, or just say hello.", "احجز عرضًا، أو اعمل معنا، أو سلّم علينا فقط.")}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
                  {[[TIab.send, "hello@together.eg"]].map((r, i) => { const RIc = r[0]; return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "rgba(255,255,255,.08)", color: "#fff" }}><RIc size={17} /></span><span style={{ fontSize: 14.5 }}>{r[1]}</span></div>
                  ); })}
                </div>
              </div>
            </div>
            <div style={{ padding: 40 }}>
              {sent ? (
                <div style={{ height: "100%", minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14 }}>
                  <span style={{ width: 56, height: 56, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--ok-soft)", color: "var(--ok)" }}><TIab.check size={26} /></span>
                  <div style={{ fontFamily: FONT_Dab, fontWeight: 700, fontSize: 22 }}>{t("Message sent", "تم الإرسال")}</div>
                  <p style={{ color: "var(--muted)", fontSize: 14 }}>{t("We'll get back to you within a day.", "سنعاود التواصل خلال يوم.")}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <InputAb label={t("Name", "الاسم")} placeholder={t("Your name", "اسمك")} />
                  <InputAb label={t("Email", "البريد")} type="email" placeholder="you@example.com" />
                  <label style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--faint)" }}>{t("Message", "الرسالة")}</span>
                    <textarea rows={4} dir={lang === "ar" ? "rtl" : "ltr"} placeholder={t("How can we help?", "كيف نساعدك؟")} style={{ width: "100%", resize: "none", padding: "11px 13px", borderRadius: 13, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </label>
                  <BtnAb block size="lg" variant="accent" iconRight={<TIab.send size={15} />} onClick={() => setSent(true)}>{t("Send message", "إرسال")}</BtnAb>
                </div>
              )}
            </div>
          </div>
        </div>
      </Sab.Section>

      <Sab.Footer lang={lang} />
      <style>{`@media(max-width:900px){.ab-hero,.ab-story,.ab-values,.ab-contact{grid-template-columns:1fr!important}.ab-hero-panel{height:340px!important}}`}</style>
    </div>
  );
}
window.AboutPage = AboutPage;
