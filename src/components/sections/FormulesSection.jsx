import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { SvgArrow } from "../../icons.jsx";

const FormulesSection = ({ refEl, onContact }) => {
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  const formules = [
    {
      id: "prestige",
      titre: "Formule Prestige",
      prix: "1447€",
      tag: "Premium",
      tagline: "Une allure complète, élégante et inoubliable pour le jour J.",
      looks: [
        {
          nom: "Look Mairie",
          items: [
            { label: "Costume coupe droite, croisé ou trois pièces", prix: "449€" },
            { label: "Chemise", prix: "69€" },
            { label: "Cravate", prix: "35€" },
            { label: "Boutons de manchettes", prix: "29€" },
            { label: "Chaussettes fil d'Écosse", prix: "19€" },
            { label: "Chaussures (option)", prix: "à partir de 315€" },
          ],
          sous_total: "601€",
        },
        {
          nom: "Look Soirée",
          tag: "Smoking",
          items: [
            { label: "Ensemble smoking", prix: "600€" },
            { label: "Nœud papillon", prix: "49€" },
            { label: "Chemise plastron col cassé", prix: "149€" },
            { label: "Boutons de manchettes", prix: "29€" },
            { label: "Chaussettes fil d'Écosse", prix: "19€" },
          ],
          sous_total: "846€",
        },
      ],
    },
    {
      id: "gnz",
      titre: "Formule Gaspard NZ",
      prix: "1086€",
      tag: "Signature",
      tagline: "L'élégance accessible pour un mariage parfaitement maîtrisé.",
      looks: [
        {
          nom: "Look Mairie",
          items: [
            { label: "Costume coupe droite, croisé ou trois pièces", prix: "349€" },
            { label: "Chemise", prix: "60€" },
            { label: "Cravate", prix: "30€" },
            { label: "Boutons de manchettes", prix: "20€" },
            { label: "Chaussettes fil d'Écosse", prix: "19€" },
            { label: "Chaussures (option)", prix: "à partir de 315€" },
          ],
          sous_total: "474€",
        },
        {
          nom: "Look Soirée",
          tag: "Smoking",
          items: [
            { label: "Ensemble smoking", prix: "449€" },
            { label: "Nœud papillon", prix: "29€" },
            { label: "Chemise plastron col cassé", prix: "99€" },
            { label: "Boutons de manchettes", prix: "20€" },
            { label: "Chaussettes fil d'Écosse", prix: "15€" },
          ],
          sous_total: "612€",
        },
      ],
    },
  ];

  return (
    <section ref={node => { ref.current = node; if (refEl) refEl.current = node; }} style={{ background: "#0d1b3e", padding: "5rem 0 6rem", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", right: "-1rem", top: "50%", transform: "translateY(-50%)", fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px, 35vw, 220px)", color: "rgba(255,255,255,0.03)", lineHeight: 1, letterSpacing: "0.05em", whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none" }}>FORMULES</div>

      <div ref={ref} style={{ padding: "0 1.4rem", position: "relative" }}>
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.7 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}
        >Mariage & Événements</motion.p>

        <div style={{ overflow: "hidden", marginBottom: "0.6rem" }}>
          <motion.h2 initial={{ y: "105%" }} animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 13vw, 72px)", lineHeight: 0.9, letterSpacing: "0.04em", color: "#f5f0e8", margin: 0 }}
          >NOS FORMULES</motion.h2>
        </div>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(0.95rem, 3.8vw, 1.1rem)", fontWeight: 300, color: "rgba(245,240,232,0.45)", lineHeight: 1.7, fontStyle: "italic", marginBottom: "3rem" }}
        >
          Deux packages complets pour sublimer chaque moment de votre grand jour.
        </motion.p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {formules.map((f, fi) => (
            <motion.div key={f.id}
              initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + fi * 0.15, duration: 0.8 }}
              style={{ border: `1px solid rgba(184,151,62,${selected === f.id ? "0.5" : "0.18"})`, background: selected === f.id ? "rgba(184,151,62,0.05)" : "rgba(255,255,255,0.02)", transition: "all 0.3s" }}
            >
              <button onClick={() => setSelected(selected === f.id ? null : f.id)}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "1.6rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", textAlign: "left" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", border: `1px solid rgba(184,151,62,0.3)`, padding: "3px 8px" }}>{f.tag}</span>
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.3rem, 5.5vw, 1.7rem)", color: "#f5f0e8", fontWeight: 400, letterSpacing: "0.02em", margin: 0 }}>{f.titre}</p>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.6rem, 7vw, 2.2rem)", color: GOLD, letterSpacing: "0.05em", marginTop: "0.3rem" }}>{f.prix} <span style={{ fontSize: "0.5em", color: "rgba(184,151,62,0.5)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.1em" }}>hors chaussures</span></p>
                </div>
                <motion.div animate={{ rotate: selected === f.id ? 45 : 0 }} transition={{ duration: 0.3 }}
                  style={{ color: GOLD, marginTop: "0.5rem", flexShrink: 0 }}
                ><SvgArrow size={16} /></motion.div>
              </button>

              <AnimatePresence>
                {selected === f.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 1.4rem 1.8rem", borderTop: "1px solid rgba(184,151,62,0.1)" }}>
                      {f.looks.map((look, li) => (
                        <div key={li} style={{ marginTop: "1.4rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.9rem" }}>
                            <div style={{ height: "1px", width: "20px", background: GOLD }} />
                            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase" }}>
                              {look.nom}{look.tag ? ` — ${look.tag}` : ""}
                            </p>
                          </div>
                          {look.items.map((item, ii) => (
                            <div key={ii} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0.45rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.6)", fontWeight: 300, paddingRight: "1rem", flex: 1 }}>{item.label}</p>
                              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "#f5f0e8", fontWeight: 500, whiteSpace: "nowrap" }}>{item.prix}</p>
                            </div>
                          ))}
                          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.8rem", padding: "0.6rem 0", borderTop: `1px solid rgba(184,151,62,0.2)` }}>
                            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.2em", color: "rgba(245,240,232,0.4)", textTransform: "uppercase" }}>Sous-total {look.nom}</p>
                            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: GOLD, fontWeight: 600 }}>{look.sous_total}</p>
                          </div>
                        </div>
                      ))}

                      <div style={{ marginTop: "1.4rem", padding: "1.2rem", background: "rgba(184,151,62,0.08)", border: `1px solid rgba(184,151,62,0.25)`, textAlign: "center" }}>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: "rgba(245,240,232,0.5)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Total {f.titre}</p>
                        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: GOLD, letterSpacing: "0.05em" }}>{f.prix}</p>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", color: "rgba(245,240,232,0.45)", fontStyle: "italic", marginTop: "0.5rem", marginBottom: "1.2rem" }}>{f.tagline}</p>
                        <button onClick={onContact}
                          style={{ width: "100%", background: "none", border: `1px solid rgba(184,151,62,0.5)`, color: GOLD, padding: "0.9rem", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        >Réserver cette formule <SvgArrow size={13} /></button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FormulesSection;
