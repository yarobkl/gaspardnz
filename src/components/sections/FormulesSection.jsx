import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { useTr } from "../../context.jsx";

const WA_NUM = "33664826920";

const FormulaCard = ({ formula, defaultOpen = false }) => {
  const t = useTr();
  const [open, setOpen] = useState(defaultOpen);
  const [look, setLook] = useState(0);
  const waMsg = encodeURIComponent(`Bonjour Gaspard, je suis intéressé(e) par la ${formula.title}. Pouvez-vous m'en dire plus ?`);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8% 0px" }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: "#111009", borderRadius: "18px", overflow: "hidden", border: `1px solid ${formula.featured ? "rgba(184,151,62,0.45)" : "rgba(184,151,62,0.15)"}`, position: "relative" }}>
      {formula.featured && (
        <div style={{ background: `linear-gradient(90deg, ${GOLD}, rgba(184,151,62,0.7))`, padding: "6px 1.2rem", textAlign: "center" }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.45em", color: "#0a0602", textTransform: "uppercase", fontWeight: 600 }}>★ Formule Signature ★</span>
        </div>
      )}
      <div style={{ padding: "1.4rem 1.2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
          <div>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.45em", color: GOLD, textTransform: "uppercase", marginBottom: "6px" }}>{formula.surtitle}</p>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.6rem, 7vw, 2.2rem)", letterSpacing: "0.06em", color: "#faf7f2", margin: 0, lineHeight: 1 }}>{formula.title}</h3>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.3rem, 5vw, 1.8rem)", fontWeight: 600, color: GOLD, margin: 0, lineHeight: 1 }}>{formula.price}</p>
            {formula.priceNote && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", color: "rgba(245,240,232,0.35)", margin: "3px 0 0", letterSpacing: "0.1em" }}>{t("hors_chaussures")}</p>}
          </div>
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,232,0.5)", lineHeight: 1.6, marginBottom: "1.2rem" }}>{formula.tagline}</p>
        {formula.looks && formula.looks.length > 1 && (
          <div style={{ display: "flex", gap: "6px", marginBottom: "1rem" }}>
            {formula.looks.map((lk, i) => (
              <button key={i} onClick={() => setLook(i)}
                style={{ flex: 1, padding: "7px", fontFamily: "'Montserrat', sans-serif", fontSize: "7.5px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", borderRadius: "6px", border: `1px solid ${i === look ? GOLD : "rgba(184,151,62,0.2)"}`, background: i === look ? "rgba(184,151,62,0.12)" : "transparent", color: i === look ? GOLD : "rgba(245,240,232,0.4)", transition: "all 0.3s" }}>
                {lk.label}
              </button>
            ))}
          </div>
        )}
        <button onClick={() => setOpen(v => !v)}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0", borderTop: "1px solid rgba(184,151,62,0.12)" }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase" }}>{open ? "Masquer le détail" : "Voir le détail"}</span>
          <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5l3.5 3.5 3.5-3.5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: "hidden" }}>
              <div style={{ paddingTop: "1rem" }}>
                {(formula.looks ? formula.looks[look].items : formula.items).map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "7px 0", borderBottom: "1px solid rgba(184,151,62,0.07)" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "rgba(245,240,232,0.72)", flex: 1, paddingRight: "8px" }}>{item.label}</span>
                    {item.price && <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", color: GOLD, letterSpacing: "0.1em", flexShrink: 0 }}>{item.price}</span>}
                    {item.included && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </div>
                ))}
                {formula.subtotal && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", borderTop: "1px solid rgba(184,151,62,0.18)", marginTop: "6px" }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.15em", color: "rgba(245,240,232,0.4)", textTransform: "uppercase" }}>{t("sous_total_lbl")}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600, color: "rgba(245,240,232,0.6)" }}>{formula.subtotal}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0 0" }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.15em", color: "rgba(245,240,232,0.6)", textTransform: "uppercase" }}>{t("total_lbl")}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 600, color: GOLD }}>{formula.price}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ padding: "0 1.2rem 1.4rem" }}>
        <motion.a href={`https://wa.me/${WA_NUM}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" whileTap={{ scale: 0.97 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: formula.featured ? GOLD : "transparent", border: `1px solid ${GOLD}`, color: formula.featured ? "#0a0602" : GOLD, padding: "0.9rem", borderRadius: "10px", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "8.5px", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: formula.featured ? 700 : 400, transition: "all 0.3s" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.032a.75.75 0 0 0 .921.921l5.18-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.355l-.355-.212-3.676 1.047 1.047-3.608-.23-.372A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
          {t("btn_reveler")}
        </motion.a>
      </div>
    </motion.div>
  );
};

const FormulesSection = ({ refEl }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const t = useTr();

  const formules = [
    {
      id: "prestige", surtitle: t("formules_surtitle"), title: t("formule_prestige_titre"), price: "695€", priceNote: true, tagline: t("formule1_tagline"), featured: true,
      looks: [
        { label: t("look_mairie"), items: [{ label: t("item_costume"), included: true }, { label: t("item_chemise"), included: true }, { label: t("item_cravate"), included: true }, { label: t("item_boutons"), included: true }, { label: t("item_chaussettes"), included: true }, { label: t("item_chaussures_opt"), price: t("item_chaussures_prix") }] },
        { label: t("look_soiree"), items: [{ label: t("item_smoking"), included: true }, { label: t("item_noeud"), included: true }, { label: t("item_plastron"), included: true }, { label: t("item_boutons"), included: true }, { label: t("item_chaussettes"), included: true }, { label: t("item_chaussures_opt"), price: t("item_chaussures_prix") }] },
      ],
    },
    {
      id: "gnz", surtitle: t("formules_surtitle"), title: t("formule_gnz_titre"), price: t("prix_sur_demande"), priceNote: false, tagline: t("formule2_tagline"), featured: false,
      items: [{ label: t("item_costume"), included: true }, { label: t("item_chemise"), included: true }, { label: t("item_cravate"), included: true }, { label: t("item_chaussettes"), included: true }],
    },
  ];

  return (
    <section ref={node => { ref.current = node; if (refEl) refEl.current = node; }} style={{ background: "#0a0602", padding: "4.5rem 0 5rem" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ padding: "0 1.4rem", marginBottom: "2.4rem", textAlign: "center" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>{t("formules_surtitle")}</p>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem, 10vw, 3rem)", letterSpacing: "0.08em", color: "#faf7f2", margin: 0, lineHeight: 1 }}>{t("formules_title")}</p>
        <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "14px auto 0" }} />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,232,0.4)", marginTop: "10px" }}>{t("formules_sub")}</p>
      </motion.div>
      <div style={{ padding: "0 1.4rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        {formules.map(f => <FormulaCard key={f.id} formula={f} defaultOpen={f.featured} />)}
      </div>
    </section>
  );
};

export default FormulesSection;
