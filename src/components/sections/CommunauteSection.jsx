import { motion } from "framer-motion";
import { GOLD } from "../../constants.js";
import { WA_CHANNEL_URL } from "../../data/styleDuMoisData.js";
import { useTr } from "../../context.jsx";

const SvgWA = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.032a.75.75 0 0 0 .921.921l5.18-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.355l-.355-.212-3.676 1.047 1.047-3.608-.23-.372A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
  </svg>
);

const HeartbeatLine = () => {
  const beat = (x) =>
    `L${x},14 L${x+5},10 L${x+10},1 L${x+14},27 L${x+18},9 L${x+22},14`;
  const d = `M0,14 ${beat(28)} L80,14 ${beat(108)} L160,14 ${beat(188)} L240,14 ${beat(268)} L320,14 ${beat(348)} L400,14`;

  const svgPath = (
    <path
      d={d}
      fill="none"
      stroke={GOLD}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      style={{ filter: `drop-shadow(0 0 5px ${GOLD}) drop-shadow(0 0 14px rgba(184,151,62,0.5))` }}
    />
  );

  return (
    <div style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)", overflow: "hidden", padding: "2.2rem 0", position: "relative", zIndex: 1 }}>
      <motion.div
        style={{ display: "flex", width: "200%" }}
        initial={{ x: "0%" }}
        animate={{ x: "-50%" }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear", repeatType: "loop" }}
      >
        {[0, 1].map(i => (
          <svg key={i} viewBox="0 0 400 28" preserveAspectRatio="none" style={{ width: "50%", height: "40px", display: "block", flexShrink: 0 }}>
            {svgPath}
          </svg>
        ))}
      </motion.div>
    </div>
  );
};

const CommunauteSection = () => {
  const t = useTr();
  return (
    <section style={{ background: "#0a0602", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", position: "relative", overflow: "hidden" }}>

      <motion.div
        animate={{ boxShadow: ["0 0 4px 1px rgba(184,151,62,0.2)", "0 0 12px 4px rgba(184,151,62,0.7)", "0 0 4px 1px rgba(184,151,62,0.2)"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", top: "1.4rem", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "8px", height: "8px", border: "1px solid rgba(184,151,62,0.8)", background: "rgba(184,151,62,0.3)" }} />
      <motion.div
        animate={{ boxShadow: ["0 0 4px 1px rgba(184,151,62,0.2)", "0 0 12px 4px rgba(184,151,62,0.7)", "0 0 4px 1px rgba(184,151,62,0.2)"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
        style={{ position: "absolute", bottom: "1.4rem", left: "50%", transform: "translateX(-50%) rotate(45deg)", width: "8px", height: "8px", border: "1px solid rgba(184,151,62,0.8)", background: "rgba(184,151,62,0.3)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: "center", maxWidth: "420px", width: "100%", zIndex: 1 }}>

        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.5em", color: "rgba(184,151,62,0.8)", textTransform: "uppercase", marginBottom: "2rem" }}>
          {t("comm_surtitle")}
        </p>

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.8rem, 12vw, 4rem)", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.01em", lineHeight: 1.1, margin: "0 0 0.2rem" }}>
          {t("comm_title_l1")}<br />{t("comm_title_l2")}
        </h2>

        <HeartbeatLine />

        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1rem, 4vw, 1.15rem)", color: "rgba(245,240,232,0.5)", lineHeight: 1.75, marginBottom: "2.4rem" }}>
          {t("comm_desc")}
        </p>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "40px", padding: "0.85rem 1.4rem", marginBottom: "2.4rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#b8973e">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.25em", color: "#faf7f2", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>{t("comm_badge_title")}</p>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", color: "rgba(245,240,232,0.4)", letterSpacing: "0.1em", margin: "3px 0 0" }}>{t("comm_badge_sub")}</p>
          </div>
        </div>

        <motion.a
          href={WA_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.97 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", background: "#25D366", color: "white", padding: "1.1rem 2rem", borderRadius: "50px", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700 }}>
          <SvgWA />
          {t("comm_cta")}
        </motion.a>
      </motion.div>
    </section>
  );
};

export default CommunauteSection;
