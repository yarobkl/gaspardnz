import { useContext, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { getStyleJournalPhotos } from "../../data/journalData.js";
import { LangCtx, useTr } from "../../context.jsx";
import useCompactMobile from "../../hooks/useCompactMobile.js";
import { useSettings } from "../../hooks/useSettings.js";
import { getWhatsappUrl } from "../../utils/whatsappUtil.js";
import { HotspotSheet, PhotoHotspots } from "../ui/PhotoHotspots.jsx";

const COPY = {
  FR: { more: "Voir le journal", less: "Réduire le journal" },
  EN: { more: "View the journal", less: "Collapse journal" },
  ES: { more: "Ver el diario", less: "Reducir el diario" },
  ZH: { more: "查看风格日志", less: "收起风格日志" },
};

const StyleJournalSection = () => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const settings = useSettings();
  const isCompactMobile = useCompactMobile();
  const styleJournalPhotos = getStyleJournalPhotos(lang);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const [activeSpot, setActiveSpot] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const copy = COPY[lang] || COPY.FR;
  const visiblePhotos = isCompactMobile && !expanded ? styleJournalPhotos.slice(0, 1) : styleJournalPhotos;

  const askSelected = () => {
    const dot = activeSpot?.spot;
    if (!dot) return;
    const waIntro = {
      FR: `Bonjour Gaspard, je suis intéressé(e) par : ${dot.label}. Pouvez-vous m'en dire plus ?`,
      EN: `Hello Gaspard, I am interested in: ${dot.label}. Could you tell me more?`,
      ES: `Hola Gaspard, me interesa: ${dot.label}. ¿Podrías contarme más?`,
      ZH: `你好 Gaspard，我对这件单品感兴趣：${dot.label}。可以告诉我更多信息吗？`,
    };
    window.open(getWhatsappUrl(settings.whatsappNumber, waIntro[lang] || waIntro.FR), "_blank", "noopener,noreferrer");
  };

  return (
    <section ref={ref} style={{ background: "#0a0602", paddingTop: isCompactMobile ? "3rem" : "4.5rem" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
        style={{ padding: "0 1.4rem", marginBottom: isCompactMobile ? "1.35rem" : "2rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.42em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>GASPARDNZ</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 }}>{t("style_journal_title")}</p>
        <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginTop: "14px" }} />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "12px", color: "rgba(245,240,232,0.62)", marginTop: "8px" }}>{t("style_journal_hint")}</p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingBottom: isCompactMobile ? "8px" : "12px" }}>
        {visiblePhotos.map((photo, i) => (
          <motion.article key={i}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6% 0px" }}
            transition={{ duration: 0.55, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: "#111009", overflow: "hidden", borderTop: "1px solid rgba(184,151,62,.1)", borderBottom: "1px solid rgba(184,151,62,.1)" }}>
            <div style={{ position: "relative", overflow: "hidden" }} onClick={() => setActiveSpot(null)}>
              <img src={photo.src} alt={photo.caption}
                width="1200" height="1600"
                loading="lazy" decoding="async"
                style={{ width: "100%", height: "auto", display: "block", imageRendering: "high-quality" }} />
              <PhotoHotspots
                spots={photo.dots || []}
                activeIndex={activeSpot?.photoIndex === i ? activeSpot.spotIndex : -1}
                onSelect={(spotIndex, spot) => setActiveSpot((current) => {
                  const same = current?.photoIndex === i && current?.spotIndex === spotIndex;
                  return same ? null : { photoIndex: i, spotIndex, spot };
                })}
              />
            </div>
            <div style={{ padding: ".8rem 1rem .9rem", display: "flex", alignItems: "start", justifyContent: "space-between", gap: "1rem" }}>
              <div>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: "#faf7f2", margin: 0 }}>{photo.caption}</p>
                {photo.look && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: ".9rem", lineHeight: 1.4, color: "rgba(245,240,232,.52)", margin: ".25rem 0 0" }}>{photo.look}</p>}
              </div>
              {photo.dots?.length > 0 && <span style={{ flex: "0 0 auto", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: ".18em", color: GOLD, textTransform: "uppercase", marginTop: "2px" }}>{t("shop_the_look")}</span>}
            </div>
          </motion.article>
        ))}
      </div>

      {isCompactMobile && styleJournalPhotos.length > 1 && (
        <div style={{ padding: "1rem 1.4rem 2.1rem", display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => { setExpanded((value) => !value); setActiveSpot(null); }}
            style={{ minHeight: 44, border: `1px solid rgba(184,151,62,.36)`, borderRadius: 999, background: "rgba(184,151,62,.06)", color: GOLD, padding: "0 1.25rem", fontFamily: "'Montserrat',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", cursor: "pointer" }}>
            {expanded ? copy.less : `${copy.more} · ${styleJournalPhotos.length}`}
          </button>
        </div>
      )}

      <HotspotSheet
        spot={activeSpot?.spot || null}
        onClose={() => setActiveSpot(null)}
        eyebrow={t("shop_the_look")}
        actionLabel={t("ask_whatsapp")}
        onAction={askSelected}
      />
    </section>
  );
};

export default StyleJournalSection;
