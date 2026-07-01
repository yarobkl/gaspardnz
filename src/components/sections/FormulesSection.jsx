import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { SvgArrow } from "../../icons.jsx";
import { useTr } from "../../context.jsx";
import { useSettings } from "../../hooks/useSettings.js";
import { LOOKBOOK_PRICE_EUR, openLookbookCheckout } from "../../utils/lookbookCheckout.js";

const FormulesSection = ({ refEl, onContact }) => {
  const t = useTr();
  const settings = useSettings();
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  const formules = [
    {
      id: "prestige",
      titre: t("formule_prestige_titre"),
      tag: t("tag_premium"),
      tagline: t("formule1_tagline"),
      looks: [
        {
          nom: t("look_mairie"),
          items: [
            { label: t("item_costume") },
            { label: t("item_chemise") },
            { label: t("item_cravate") },
            { label: t("item_boutons") },
            { label: t("item_chaussettes") },
            { label: t("item_chaussures_opt") },
          ],
        },
        {
          nom: t("look_soiree"),
          tag: t("tag_smoking"),
          items: [
            { label: t("item_smoking") },
            { label: t("item_noeud") },
            { label: t("item_plastron") },
            { label: t("item_boutons") },
            { label: t("item_chaussettes") },
          ],
        },
      ],
    },
    {
      id: "gnz",
      titre: t("formule_gnz_titre"),
      tag: t("tag_signature"),
      tagline: t("formule2_tagline"),
      looks: [
        {
          nom: t("look_mairie"),
          items: [
            { label: t("item_costume") },
            { label: t("item_chemise") },
            { label: t("item_cravate") },
            { label: t("item_boutons") },
            { label: t("item_chaussettes") },
            { label: t("item_chaussures_opt") },
          ],
        },
        {
          nom: t("look_soiree"),
          tag: t("tag_smoking"),
          items: [
            { label: t("item_smoking") },
            { label: t("item_noeud") },
            { label: t("item_plastron") },
            { label: t("item_boutons") },
            { label: t("item_chaussettes") },
          ],
        },
      ],
    },
  ];

  return (
    <section ref={node => { ref.current = node; if (refEl) refEl.current = node; }} style={{ background: "#0d1b3e", padding: "5rem 0 6rem", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", right: "-1rem", top: "50%", transform: "translateY(-50%)", fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px, 35vw, 220px)", color: "rgba(255,255,255,0.03)", lineHeight: 1, letterSpacing: "0.05em", whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none" }}>{t("formules_title")}</div>

      <div ref={ref} style={{ padding: "0 1.4rem", position: "relative" }}>
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.7 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}
        >{t("formules_surtitle")}</motion.p>

        <div style={{ overflow: "hidden", marginBottom: "0.6rem" }}>
          <motion.h2 initial={{ y: "105%" }} animate={inView ? { y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 13vw, 72px)", lineHeight: 0.9, letterSpacing: "0.04em", color: "#f5f0e8", margin: 0 }}
          >{t("formules_title")}</motion.h2>
        </div>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(0.95rem, 3.8vw, 1.1rem)", fontWeight: 300, color: "rgba(245,240,232,0.75)", lineHeight: 1.7, fontStyle: "italic", marginBottom: "3rem" }}
        >
          {t("formules_sub")}
        </motion.p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {formules.map((f, fi) => (
            <motion.div key={f.id}
              initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + fi * 0.08, duration: 0.55 }}
              style={{ border: `1px solid rgba(184,151,62,${selected === f.id ? "0.5" : "0.18"})`, background: selected === f.id ? "rgba(184,151,62,0.05)" : "rgba(255,255,255,0.02)", transition: "all 0.3s" }}
            >
              <button
                onClick={() => setSelected(selected === f.id ? null : f.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(selected === f.id ? null : f.id);
                  }
                }}
                aria-expanded={selected === f.id}
                aria-controls={`formule-content-${f.id}`}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "1.6rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", textAlign: "left" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", border: `1px solid rgba(184,151,62,0.3)`, padding: "3px 8px" }}>{f.tag}</span>
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.3rem, 5.5vw, 1.7rem)", color: "#f5f0e8", fontWeight: 400, letterSpacing: "0.02em", margin: 0 }}>{f.titre}</p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.3em", color: "rgba(184,151,62,0.6)", textTransform: "uppercase", marginTop: "6px" }}>{t("prix_sur_demande")}</p>
                </div>
                <motion.div animate={{ rotate: selected === f.id ? 45 : 0 }} transition={{ duration: 0.3 }}
                  style={{ color: GOLD, marginTop: "0.5rem", flexShrink: 0 }}
                ><SvgArrow size={16} /></motion.div>
              </button>

              <AnimatePresence>
                {selected === f.id && (
                  <motion.div
                    id={`formule-content-${f.id}`}
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 1.4rem 1.8rem", borderTop: "1px solid rgba(184,151,62,0.1)" }}>
                      {f.looks.map((look, li) => (
                        <div key={li} style={{ marginTop: "1.4rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.9rem" }}>
                            <div style={{ height: "1px", width: "20px", background: GOLD }} />
                            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase" }}>
                              {look.nom}{look.tag ? ` — ${look.tag}` : ""}
                            </p>
                          </div>
                          {look.items.map((item, ii) => (
                            <div key={ii} style={{ padding: "0.45rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.6)", fontWeight: 300, margin: 0 }}>{item.label}</p>
                            </div>
                          ))}
                        </div>
                      ))}

                      <div style={{ marginTop: "1.4rem", padding: "1.2rem", background: "rgba(184,151,62,0.08)", border: `1px solid rgba(184,151,62,0.25)`, textAlign: "center" }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", color: "rgba(245,240,232,0.75)", fontStyle: "italic", marginBottom: "1.2rem" }}>{f.tagline}</p>
                        <button onClick={onContact}
                          style={{ width: "100%", background: "none", border: `1px solid rgba(184,151,62,0.5)`, color: GOLD, padding: "0.9rem", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        >{t("btn_reveler")} <SvgArrow size={13} /></button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.7 }}
          style={{ margin: "2.5rem 0 0", padding: "2rem 1.4rem", border: "1px solid rgba(184,151,62,0.3)", background: "rgba(184,151,62,0.05)", textAlign: "center" }}
        >
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}>GASPARDNZ · 2025</p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 7vw, 2.2rem)", fontWeight: 300, color: "#f5f0e8", letterSpacing: "0.02em", margin: "0 0 0.6rem" }}>
            {t("lookbook_title")}
          </h3>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.9rem", color: "rgba(245,240,232,0.62)", marginBottom: "1.6rem" }}>
            {t("lookbook_desc")}
          </p>
          <button
            type="button"
            onClick={() => openLookbookCheckout(settings.whatsappNumber)}
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: GOLD, color: "#0d1b3e", border: "none", cursor: "pointer", padding: "1rem 2.2rem", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/>
            </svg>
            Acheter le lookbook · {LOOKBOOK_PRICE_EUR}€
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FormulesSection;
