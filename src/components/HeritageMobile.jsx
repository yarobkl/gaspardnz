import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD } from "../constants.js";
import { useTr } from "../context.jsx";

const HeritageMobile = ({ refEl }) => {
  const t = useTr();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  return (
    <section ref={refEl} style={{ background: "#f5f0e8", overflow: "hidden" }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", height: "80vw", minHeight: "340px", maxHeight: "520px", overflow: "hidden" }}
      >
        <img
          src={`${import.meta.env.BASE_URL}images/heritage.jpg`}
          alt="Gaspardnz — L'Inspirateur"
          width="1200"
          height="900"
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #f5f0e8 0%, transparent 25%, transparent 45%, rgba(245,240,232,0.7) 80%, #f5f0e8 100%)" }} />
        <motion.div
          initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ position: "absolute", top: "1.4rem", left: "1.4rem", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <div style={{ width: "20px", height: "1px", background: GOLD }} />
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.45em", color: GOLD, textTransform: "uppercase" }}>{t("inspirateur")}</p>
        </motion.div>
      </motion.div>

      <div style={{ padding: "0 1.6rem 5rem", marginTop: "-1.5rem", position: "relative", textAlign: "center" }}>
        <motion.div
          initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "0 auto 2.2rem", width: "60px", transformOrigin: "center" }}
        />

        <motion.p
          initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55, duration: 0.9 }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.35rem, 5.5vw, 1.9rem)", fontWeight: 300, lineHeight: 1.65, color: "rgba(28,18,8,0.82)", fontStyle: "italic", marginBottom: "2rem" }}
        >
          {t("hero_desc")}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.55 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(0.72rem, 2.8vw, 0.82rem)", fontWeight: 300, lineHeight: 1.9, color: "rgba(28,18,8,0.78)", letterSpacing: "0.03em" }}
        >
          {t("heritage_desc")}
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "2.2rem auto 0", width: "60px", transformOrigin: "center" }}
        />
      </div>
    </section>
  );
};

export default HeritageMobile;
