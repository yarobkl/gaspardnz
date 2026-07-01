import { useContext, useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { getStyleJournalPhotos } from "../../data/journalData.js";
import { LangCtx, useTr } from "../../context.jsx";
import { useSettings } from "../../hooks/useSettings.js";
import { getWhatsappUrl } from "../../utils/whatsappUtil.js";

const StyleDot = ({ dot }) => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const settings = useSettings();
  const [active, setActive] = useState(false);
  const waIntro = {
    FR: `Bonjour Gaspard, je suis intéressé(e) par : ${dot.label}. Pouvez-vous m'en dire plus ?`,
    EN: `Hello Gaspard, I am interested in: ${dot.label}. Could you tell me more?`,
    ES: `Hola Gaspard, me interesa: ${dot.label}. ¿Podrías contarme más?`,
    ZH: `你好 Gaspard，我对这件单品感兴趣：${dot.label}。可以告诉我更多信息吗？`,
  };
  const waMsg = waIntro[lang] || waIntro.FR;
  const waUrl = getWhatsappUrl(settings.whatsappNumber, waMsg);
  return (
    <div style={{ position: "absolute", top: dot.top, left: dot.left, zIndex: 10 }}>
      <motion.button
        aria-label={dot.label}
        onClick={() => setActive(a => !a)}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "44px", height: "44px", borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transform: "translate(-15px, -15px)" }}>
        <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(184,151,62,0.25)", border: `1px solid ${GOLD}`, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: GOLD }} />
          <motion.span animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.8, repeat: Infinity }}
            style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `1px solid ${GOLD}`, pointerEvents: "none" }} />
        </span>
      </motion.button>
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0, scale: 0.85, y: 4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85 }}
            style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: "rgba(17,16,9,0.95)", backdropFilter: "blur(8px)", border: `1px solid rgba(184,151,62,0.35)`, borderRadius: "8px", padding: "8px 10px", minWidth: "160px", maxWidth: "200px", zIndex: 20 }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.08em", color: "#faf7f2", margin: "0 0 7px", lineHeight: 1.4 }}>{dot.label}</p>
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: "5px", textDecoration: "none" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.032a.75.75 0 0 0 .921.921l5.18-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.355l-.355-.212-3.676 1.047 1.047-3.608-.23-.372A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.25em", color: "#25D366", textTransform: "uppercase" }}>{t("ask_whatsapp")}</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StyleJournalSection = () => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const styleJournalPhotos = getStyleJournalPhotos(lang);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  return (
    <section ref={ref} style={{ background: "#0a0602", paddingTop: "4.5rem" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
        style={{ padding: "0 1.4rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.42em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>GASPARDNZ</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 }}>{t("style_journal_title")}</p>
        <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginTop: "14px" }} />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "12px", color: "rgba(245,240,232,0.62)", marginTop: "8px" }}>{t("style_journal_hint")}</p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {styleJournalPhotos.map((photo, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6% 0px" }}
            transition={{ duration: 0.55, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative", overflow: "hidden" }}>
            <img src={photo.src} alt={photo.caption}
              width="1200" height="1600"
              loading="lazy" decoding="async"
              style={{ width: "100%", height: "auto", display: "block", imageRendering: "high-quality" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, rgba(10,6,2,0.75) 100%)", pointerEvents: "none" }} />
            {photo.dots.map((dot, di) => <StyleDot key={di} dot={dot} />)}
            <div style={{ position: "absolute", bottom: "14px", left: "14px", right: "14px" }}>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", letterSpacing: "0.1em", color: "#faf7f2", margin: 0, textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>{photo.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StyleJournalSection;
