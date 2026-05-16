import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { GOLD } from "../../constants.js";
import { STYLE_DU_MOIS, WA_GNZ } from "../../data/styleDuMoisData.js";

const StyleDuMoisSection = ({ refEl }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const [activeSpot, setActiveSpot] = useState(null);

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
              <div style={{ position: "relative", width: "100%", aspectRatio: "4/3" }}
                onClick={() => setActiveSpot(null)}>
                <img src={item.src} alt={item.title || "Style du mois"}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
                {(item.spots || []).map((spot, si) => (
                  <div key={si} style={{ position: "absolute", left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%,-50%)", zIndex: 2 }}>
                    <button
                      onClick={e => { e.stopPropagation(); setActiveSpot(activeSpot === `${i}-${si}` ? null : `${i}-${si}`); }}
                      style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(184,151,62,0.25)", border: `1.5px solid ${GOLD}`, backdropFilter: "blur(4px)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: GOLD }} />
                    </button>
                    <AnimatePresence>
                      {activeSpot === `${i}-${si}` && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          onClick={e => e.stopPropagation()}
                          style={{ position: "absolute", left: spot.x > 60 ? "auto" : "36px", right: spot.x > 60 ? "36px" : "auto", top: "-10px", width: "180px", background: "rgba(12,10,6,0.97)", border: `1px solid rgba(184,151,62,0.4)`, borderRadius: "10px", padding: "10px 12px", zIndex: 10 }}>
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.12em", color: GOLD, textTransform: "uppercase", marginBottom: "5px" }}>{spot.label}</p>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.75rem", color: "rgba(245,240,232,0.7)", lineHeight: 1.4, marginBottom: "8px" }}>{spot.detail}</p>
                          <button
                            onClick={() => window.open(`${WA_GNZ}?text=${encodeURIComponent(`Bonjour Gaspard, je suis intéressé(e) par : ${spot.label}`)}`, "_blank")}
                            style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", background: "rgba(184,151,62,0.1)", border: `1px solid rgba(184,151,62,0.35)`, borderRadius: "20px", padding: "5px 10px", cursor: "pointer", width: "100%" }}>
                            Demander le prix →
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
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
