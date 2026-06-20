// Shared product landing template + bilingual content for the 3 products.
const { useState } = React;
const DS = window.TogetherDesignSystem_58a58f;
const { Button, Card } = DS;
const S = window.TSite;
const TI = window.TIcons;
const { PRODUCTS, FONT_D } = S;

// ── Per-product marketing content (EN / AR) ───────────────
const PC = {
  signlens: {
    no: "01",
    headline: { en: ["See signs.", "Read language."], ar: ["شوف الإشارة.", "اقرأ اللغة."] },
    lead: { en: "SignLens uses real-time kinetic recognition to turn Egyptian and American Sign Language into text and natural voice — instantly, on any device, fully on-device.",
            ar: "يستخدم SignLens التعرّف الحركي الفوري لتحويل لغة الإشارة المصرية والأمريكية إلى نص وصوت طبيعي — فورًا، على أي جهاز، ودون أي رفع." },
    specs: [["98", "%", { en: "Egyptian Sign Language accuracy", ar: "دقة لغة الإشارة المصرية" }], ["88", "%", { en: "American Sign Language accuracy", ar: "دقة لغة الإشارة الأمريكية" }], ["100", "%", { en: "On-device, private", ar: "على الجهاز، خاص" }]],
    steps: [[TI.camera, { en: "Capture landmarks", ar: "التقاط النقاط" }, { en: "MediaPipe Holistic reads 21 hand + 33 body keypoints locally, 30fps.", ar: "يقرأ MediaPipe ٢١ نقطة لليد و٣٣ للجسم محليًا، ٣٠ إطار/ث." }],
            [TI.gauge, { en: "Recognize", ar: "تعرّف" }, { en: "A quantized TFLite model commits a sign once confidence stabilizes.", ar: "يثبّت نموذج TFLite الإشارة عند استقرار الثقة." }],
            [TI.volume, { en: "Read & speak", ar: "اقرأ وانطق" }, { en: "Signs stream to the transcript and can be spoken aloud in a natural voice.", ar: "تتدفّق الإشارات إلى النص ويمكن نطقها بصوت طبيعي." }]],
    uses: [[TI.users, { en: "Workplace", ar: "مكان العمل" }, { en: "Deaf professionals sign naturally while colleagues read live captions.", ar: "يوقّع المحترفون الصمّ بطبيعية بينما يقرأ الزملاء ترجمة حيّة." }],
           [TI.building, { en: "Clinics", ar: "العيادات" }, { en: "Patients sign to staff; consultations proceed without interpreter delays.", ar: "يوقّع المرضى للطاقم؛ وتمضي الاستشارات دون تأخير المترجم." }],
           [TI.graduation, { en: "Education", ar: "التعليم" }, { en: "Students get instant feedback; teachers verify correctness in real time.", ar: "يحصل الطلاب على تقييم فوري؛ ويتحقق المعلمون لحظيًا." }]],
  },
  signbridge: {
    no: "02",
    headline: { en: ["Bridge every", "conversation."], ar: ["اعبُر بكل", "محادثة."] },
    lead: { en: "SignBridge is a reverse translation engine: typed or spoken Egyptian and English become structured sign guidance — Egyptian and American Sign Language — through a pose avatar you can follow in real time.",
            ar: "SignBridge محرّك ترجمة عكسي: يتحوّل النص أو الكلام بالمصرية والإنجليزية إلى توجيه منظّم — بلغة الإشارة المصرية والأمريكية — عبر أفاتار حركي تتابعه فوريًا." },
    specs: [["EG · EN", "", { en: "Source languages", ar: "لغتا المصدر" }], ["ESL · ASL", "", { en: "Sign output", ar: "خرج الإشارة" }], ["Live", "", { en: "Streaming support", ar: "بث حيّ" }]],
    steps: [[TI.type, { en: "Type or speak", ar: "اكتب أو تكلّم" }, { en: "Enter Egyptian or English by keyboard or microphone.", ar: "أدخل المصرية أو الإنجليزية بالكتابة أو الميكروفون." }],
            [TI.languages, { en: "Gloss mapping", ar: "تخطيط الإشارة" }, { en: "An NLP engine resolves text to a Topic-Comment gloss sequence.", ar: "يحوّل محرك اللغة النص إلى تسلسل إشاري بترتيب الموضوع-التعليق." }],
            [TI.hand, { en: "Avatar signs", ar: "الأفاتار يوقّع" }, { en: "A pose-based avatar plays the sequence with adjustable speed.", ar: "يشغّل أفاتار حركي التسلسل بسرعة قابلة للضبط." }]],
    uses: [[TI.users, { en: "Two-way talk", ar: "حوار ثنائي" }, { en: "Hearing users speak; the Deaf participant follows ESL guidance.", ar: "يتكلّم السامعون؛ ويتابع المشارك الأصمّ توجيه الإشارة." }],
           [TI.building, { en: "Public counters", ar: "شبابيك الخدمة" }, { en: "Banks, offices and hospitals serve Deaf visitors without extra staff.", ar: "تخدم البنوك والمكاتب والمستشفيات الزوار الصمّ دون طاقم إضافي." }],
           [TI.graduation, { en: "Learning", ar: "التعلّم" }, { en: "Learners type a phrase and see the correct signing sequence.", ar: "يكتب المتعلّم جملة ويرى تسلسل الإشارة الصحيح." }]],
  },
  handtalk: {
    no: "03",
    headline: { en: ["Meet without", "barriers."], ar: ["اجتمع بلا", "حواجز."] },
    lead: { en: "HandTalk puts a signer and a speaker in one live room — each understood in their own language. Sign becomes captions, speech becomes sign guidance, both ways, over WebRTC.",
            ar: "يجمع HandTalk المُشير والمتحدث في غرفة حيّة واحدة — كلٌّ مفهوم بلغته. تتحوّل الإشارة إلى ترجمة، والكلام إلى إشارة، في الاتجاهين، عبر WebRTC." },
    specs: [["2", "", { en: "Roles per room", ar: "أدوار بالغرفة" }], ["Live", "", { en: "WebRTC video", ar: "فيديو حيّ" }], ["Both", "", { en: "Directions translated", ar: "اتجاهان مترجمان" }], ["0", "", { en: "Interpreters needed", ar: "بلا مترجمين" }]],
    steps: [[TI.video, { en: "Join the room", ar: "ادخل الغرفة" }, { en: "Signer and speaker connect over a peer-to-peer video call.", ar: "يتصل المُشير والمتحدث عبر مكالمة فيديو مباشرة." }],
            [TI.languages, { en: "Translate per role", ar: "ترجمة بالدور" }, { en: "Each side is captioned or given sign guidance automatically.", ar: "يُترجَم كل طرف بالترجمة أو بتوجيه الإشارة تلقائيًا." }],
            [TI.captions, { en: "Follow live", ar: "تابع مباشرةً" }, { en: "Captions and the sign avatar update in real time, both ways.", ar: "تتحدّث الترجمة والأفاتار في الوقت الفعلي، في الاتجاهين." }]],
    uses: [[TI.building, { en: "Healthcare", ar: "الرعاية الصحية" }, { en: "Doctor-patient consultations without scheduling an interpreter.", ar: "استشارات طبيب-مريض دون جدولة مترجم." }],
           [TI.users, { en: "Remote teams", ar: "الفرق عن بُعد" }, { en: "Deaf and hearing teammates meet on equal footing.", ar: "يجتمع الزملاء الصمّ والسامعون على قدم المساواة." }],
           [TI.broadcast, { en: "Live events", ar: "الفعاليات الحيّة" }, { en: "Add a translated sign track to any broadcast or webinar.", ar: "أضف مسار إشارة مترجمًا لأي بثّ أو ندوة." }]],
  },
};

function ProductLanding({ which }) {
  const [lang, setLang] = S.useLang();
  const t = (en, ar) => S.tr(lang, en, ar);
  const p = PRODUCTS[which];
  const c = PC[which];
  const accent = p.accent;
  const Ic = TI[p.icon];

  const SpecCard = (s, i) => (
    <div key={i} style={{ background: "var(--surface-solid)", padding: "26px 22px", borderRadius: 18, border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 38, letterSpacing: "-.03em", color: "var(--text)" }}>{s[0]}<span style={{ fontSize: 17, color: accent }}>{s[1]}</span></div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{t(s[2].en, s[2].ar)}</div>
    </div>
  );

  return (
    <div className="t-scope" data-product={which} style={{ minHeight: "100vh", overflowX: "hidden", background: "var(--bg)", color: "var(--text)" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: -1, background: `radial-gradient(circle at 14% 8%, #fff, transparent 32%), radial-gradient(circle at 86% 10%, ${accent}0d, transparent 34%), linear-gradient(180deg,#fafafa,#f1f1ef)` }} />
      <S.Nav current={which} lang={lang} setLang={setLang} />

      {/* Hero */}
      <section style={{ padding: "150px 24px 60px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 44, alignItems: "center" }} className="pl-hero">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 15px", borderRadius: 999, border: "1px solid var(--border)", background: "var(--surface-solid)", marginBottom: 26 }}>
              <span style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", background: accent, color: "#fff" }}><Ic size={15} /></span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase", color: accent }}>{t(`Product ${c.no} — ` + p.tag.en, `المنتج ${c.no} — ` + p.tag.ar)}</span>
            </div>
            <h1 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(46px,6vw,86px)", lineHeight: 1.08, letterSpacing: "-.045em", margin: 0 }}>
              {t(c.headline.en[0], c.headline.ar[0])}<br /><span style={{ color: accent }}>{t(c.headline.en[1], c.headline.ar[1])}</span>
            </h1>
            <p style={{ marginTop: 24, maxWidth: 520, fontSize: 18, lineHeight: 1.6, color: "var(--muted)" }}>{t(c.lead.en, c.lead.ar)}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
              <a href={p.app} style={{ textDecoration: "none" }}><Button size="lg" style={{ borderRadius: 999, background: accent, color: "#fff" }} iconRight={<TI.arrowRight size={16} />}>{t(`Try ${p.name}`, `جرّب ${p.name}`)}</Button></a>
            </div>
          </div>
          <div className="pl-hero-panel" style={{ position: "relative", height: 460, borderRadius: 30, overflow: "hidden", background: "linear-gradient(150deg,#0e0e14,#070709)", border: "1px solid rgba(255,255,255,.06)", boxShadow: "0 40px 100px rgba(0,0,0,.28)" }}>
            <window.ThreeScene accent={accent} type={{ signlens: "landmarks", signbridge: "bridge", handtalk: "dialogue" }[which]} />
            <div style={{ position: "absolute", top: 20, insetInlineStart: 22, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgba(255,255,255,.45)" }}>{p.name}</div>
          </div>
        </div>
      </section>

      {/* Specs */}
      <S.Section style={{ paddingBlock: "30px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${c.specs.length},1fr)`, gap: 18 }} className="pl-specs">{c.specs.map(SpecCard)}</div>
      </S.Section>

      {/* How it works */}
      <S.Section style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 600, marginBottom: 44, display: "flex", flexDirection: "column", gap: 14 }}>
          <S.Eyebrow color={accent}>{t("How it works", "كيف يعمل")}</S.Eyebrow>
          <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(32px,4vw,52px)", lineHeight: 1, letterSpacing: "-.04em", margin: 0 }}>{t("Three steps, in real time.", "ثلاث خطوات، في الوقت الفعلي.")}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="pl-steps">
          {c.steps.map((s, i) => { const SIc = s[0]; return (
            <div key={i} style={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 22, padding: 28, boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: accent + "1f", color: accent }}><SIc size={21} /></span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--faint)" }}>0{i + 1}</span>
              </div>
              <div style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 21, letterSpacing: "-.02em", color: "var(--text)", marginTop: 22 }}>{t(s[1].en, s[1].ar)}</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", margin: "8px 0 0" }}>{t(s[2].en, s[2].ar)}</p>
            </div>
          ); })}
        </div>
      </S.Section>

      {/* Use cases */}
      <S.Section style={{ paddingTop: 0 }}>
        <div style={{ maxWidth: 600, marginBottom: 44, display: "flex", flexDirection: "column", gap: 14 }}>
          <S.Eyebrow color={accent}>{t("Where it helps", "أين يفيد")}</S.Eyebrow>
          <h2 style={{ fontFamily: FONT_D, fontWeight: 600, fontSize: "clamp(32px,4vw,52px)", lineHeight: 1, letterSpacing: "-.04em", margin: 0 }}>{t("Built for everyday rooms.", "مصمّم للغرف اليومية.")}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="pl-uses">
          {c.uses.map((u, i) => { const UIc = u[0]; return (
            <div key={i} style={{ background: "var(--surface-solid)", border: "1px solid var(--border)", borderRadius: 22, padding: 28, boxShadow: "var(--shadow-sm)" }}>
              <span style={{ color: accent }}><UIc size={24} /></span>
              <div style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: 20, color: "var(--text)", marginTop: 16 }}>{t(u[1].en, u[1].ar)}</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", margin: "8px 0 0" }}>{t(u[2].en, u[2].ar)}</p>
            </div>
          ); })}
        </div>
      </S.Section>

      {/* CTA */}
      <section style={{ padding: "20px 24px 110px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", borderRadius: 32, overflow: "hidden", background: `linear-gradient(150deg, ${accent}, ${p.accent})`, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(0,0,0,.18), transparent)" }} />
          <div style={{ position: "relative", padding: "64px 48px", textAlign: "center", color: "#fff" }}>
            <h2 style={{ fontFamily: FONT_D, fontWeight: 700, fontSize: "clamp(34px,4.6vw,58px)", lineHeight: 1, letterSpacing: "-.03em", margin: 0 }}>{t(`Try ${p.name} now.`, `جرّب ${p.name} الآن.`)}</h2>
            <p style={{ marginTop: 14, fontSize: 16, color: "rgba(255,255,255,.85)" }}>{t("Try it live — no account required.", "جرّبها مباشرةً — دون حساب.")}تجربة.")}</p>
            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <a href={p.app} style={{ textDecoration: "none" }}><Button size="lg" style={{ borderRadius: 999, background: "#fff", color: "#0a0a0c" }} iconRight={<TI.arrowRight size={16} />}>{t("Try it live", "جرّبها مباشرةً")}</Button></a>
            </div>
          </div>
        </div>
      </section>

      <S.Footer lang={lang} />
      <style>{`@media(max-width:900px){.pl-hero{grid-template-columns:1fr!important}.pl-hero-panel{height:360px!important}.pl-specs{grid-template-columns:1fr 1fr!important}.pl-steps,.pl-uses{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
window.ProductLanding = ProductLanding;
