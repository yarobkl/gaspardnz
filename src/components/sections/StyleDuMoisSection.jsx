import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { STYLE_DU_MOIS, WA_GNZ, WA_CHANNEL_URL } from "../../data/styleDuMoisData.js";

const StyleDuMoisSection = ({ refEl }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  if (!STYLE_DU_MOIS || STYLE_DU_MOIS.length === 0) return null;

  return (
    <section ref={node => { ref.current = node; if (refEl) refEl.current = node; }} style={{ background: "#0a0602", padding: "4.5rem 0 5rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ padding: "0 1.4rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>GASPARDNZ</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 }}>Style du Mois</p>
        <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginTop: "14px" }} />
      </motion.div>

      <div style={{ padding: "0 1.4rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        {STYLE_DU_MOIS.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-6% 0px" }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: "#111009", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(184,151,62,0.15)" }}>
            {item.src && (
              <img src={item.src} alt={item.title || "Style du mois"} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", objectPosition: "top", display: "block" }} />
            )}
            <div style={{ padding: "1.2rem" }}>
              {item.title && <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.06em", color: "#faf7f2", margin: "0 0 0.6rem" }}>{item.title}</h3>}
              {item.desc && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,232,0.6)", lineHeight: 1.65 }}>{item.desc}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StyleDuMoisSection;
