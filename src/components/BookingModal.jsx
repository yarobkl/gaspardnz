import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, TEXT } from "../constants.js";
import { useTr } from "../context.jsx";
import { SvgCalendar, SvgWA, SvgArrow } from "../icons.jsx";
import { useSettings } from "../hooks/useSettings.js";
import { getWhatsappUrl } from "../utils/whatsappUtil.js";

const BoutiqueModal = ({ onClose, onReserver }) => {
  const t = useTr();
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={e => e.stopPropagation()}
      style={{ width: "100%", maxWidth: "480px", background: "#faf7f2", position: "relative" }}>

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: GOLD }} />

      <div style={{ padding: "1.6rem 1.8rem 1.2rem", borderBottom: "1px solid rgba(184,151,62,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.45em", color: GOLD, textTransform: "uppercase", marginBottom: "0.3rem" }}>{t("boutique_soon_badge")}</p>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.1em", color: TEXT, margin: 0, lineHeight: 1 }}>{t("nav_boutique")}</p>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: "rgba(28,18,8,0.62)", fontSize: "22px", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ padding: "2.4rem 1.8rem", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
          style={{ display: "inline-block", border: `1px solid rgba(184,151,62,0.4)`, padding: "0.3rem 1rem", marginBottom: "1.4rem" }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.45em", color: GOLD, textTransform: "uppercase" }}>
            {t("boutique_soon_badge")}
          </span>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.2rem, 5vw, 1.5rem)", fontWeight: 300, fontStyle: "italic", color: "rgba(28,18,8,0.75)", lineHeight: 1.6, marginBottom: "1.2rem" }}>
          {t("boutique_soon_title")}
        </motion.p>

        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", fontWeight: 300, color: "rgba(28,18,8,0.45)", lineHeight: 1.9, letterSpacing: "0.02em", marginBottom: "2rem" }}>
          {t("boutique_soon_desc")}
        </motion.p>

        <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "0 auto 2rem" }} />

        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
          onClick={onReserver}
          style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: GOLD, color: "#1c1208", padding: "0.95rem 2rem", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700 }}>
          <SvgWA />
          {t("boutique_wa_cta")}
        </motion.button>
      </div>
    </motion.div>
  );
};

const BookingModal = ({ isOpen, onClose, boutiqueMode = false, onSwitchToBooking }) => {
  const t = useTr();
  const settings = useSettings();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nom: "", projet: "", besoin: "" });

  const ok = form.nom.trim() && form.projet.trim() && form.besoin.trim();

  const nom = form.nom.trim();
  const projet = form.projet.trim();
  const besoin = form.besoin.trim();
  const waMsg = t("bk_wa", nom, projet, besoin);
  const waUrl = getWhatsappUrl(settings.whatsappNumber, waMsg);

  const reset = () => { setStep(1); setForm({ nom: "", projet: "", besoin: "" }); onClose(); };

  const inputStyle = {
    width: "100%", background: "none", border: "1px solid rgba(184,151,62,0.2)",
    padding: "0.85rem 1rem", fontFamily: "'Montserrat', sans-serif",
    fontSize: "16px", color: TEXT, outline: "none", borderRadius: 0,
    transition: "border-color 0.3s",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={reset}
          style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", paddingTop: "calc(env(safe-area-inset-top) + 3.5rem)", overflowY: "auto" }}>

          {boutiqueMode ? (
            <BoutiqueModal onClose={reset} onReserver={onSwitchToBooking} />
          ) : (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "480px", background: "#faf7f2", position: "relative", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "rgba(184,151,62,0.12)", zIndex: 2 }}>
              <motion.div
                animate={{ width: step === 1 ? "50%" : "100%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: "100%", background: GOLD }} />
            </div>

            <div style={{ padding: "2rem 1.8rem 1.2rem", borderBottom: "1px solid rgba(184,151,62,0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
              <div>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  {step === 1 ? t("bk_step1") : t("bk_step2")}
                </p>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.08em", color: TEXT, lineHeight: 1 }}>
                  {step === 1 ? t("bk_title1") : t("bk_title2")}
                </p>
              </div>
              <button onClick={reset} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: "rgba(28,18,8,0.62)", fontSize: "22px", lineHeight: 1, marginTop: "-4px" }}>×</button>
            </div>

            <div style={{ padding: "1.8rem", overflowY: "auto", flex: 1 }}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="step1"
                    initial={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                      {[
                        { k: "nom",    lbl: t("bk_lbl_nom"), ph: t("bk_ph_nom") },
                        { k: "projet", lbl: t("bk_lbl_projet"), ph: t("bk_ph_projet") },
                        { k: "besoin", lbl: t("bk_lbl_besoin"), ph: t("bk_ph_besoin") },
                      ].map(({ k, lbl, ph }) => (
                        <div key={k}>
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.35em", color: "rgba(28,18,8,0.72)", textTransform: "uppercase", marginBottom: "0.5rem" }}>{lbl}</p>
                          {k === "besoin" ? (
                            <textarea value={form[k]} rows={3} placeholder={ph} maxLength={1000}
                              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                              onFocus={e => e.target.style.borderColor = GOLD}
                              onBlur={e => e.target.style.borderColor = "rgba(184,151,62,0.2)"}
                              style={{ ...inputStyle, resize: "none", display: "block" }} />
                          ) : (
                            <input type="text" value={form[k]} placeholder={ph} maxLength={100}
                              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                              onFocus={e => e.target.style.borderColor = GOLD}
                              onBlur={e => e.target.style.borderColor = "rgba(184,151,62,0.2)"}
                              style={inputStyle} />
                          )}
                        </div>
                      ))}
                    </div>
                    <motion.button
                      onClick={() => ok && setStep(2)}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        marginTop: "1.8rem", width: "100%", border: "none",
                        background: ok ? GOLD : "rgba(184,151,62,0.15)",
                        color: ok ? "#1c1208" : "rgba(28,18,8,0.25)",
                        padding: "1rem", fontFamily: "'Montserrat', sans-serif",
                        fontSize: "8px", letterSpacing: "0.4em", textTransform: "uppercase",
                        cursor: ok ? "pointer" : "not-allowed", transition: "all 0.4s",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      }}>
                      {t("bk_continue")} <SvgArrow size={12} />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div key="step2"
                    initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "rgba(28,18,8,0.78)", fontStyle: "italic", textAlign: "center", marginBottom: "1.6rem", lineHeight: 1.65 }}>
                      {t("bk_q", form.nom)}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                      <a href={settings.calendlyUrl || "https://calendly.com/gaspardnz"} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: "1.1rem", border: "1px solid rgba(184,151,62,0.22)", padding: "1.3rem 1.4rem", textDecoration: "none", transition: "border-color 0.3s, background 0.3s" }}
                        onTouchStart={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = "rgba(184,151,62,0.04)"; }}
                        onTouchEnd={e => { e.currentTarget.style.borderColor = "rgba(184,151,62,0.22)"; e.currentTarget.style.background = "none"; }}>
                        <div style={{ width: "38px", height: "38px", border: `1px solid rgba(184,151,62,0.35)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <SvgCalendar />
                        </div>
                        <div>
                          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.15rem", letterSpacing: "0.07em", color: TEXT, marginBottom: "0.15rem" }}>{t("bk_cal_title")}</p>
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.2em", color: "rgba(28,18,8,0.68)", textTransform: "uppercase" }}>{t("bk_cal_sub")}</p>
                        </div>
                      </a>

                      <a href={waUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: "1.1rem", border: `1px solid ${GOLD}`, background: "rgba(184,151,62,0.04)", padding: "1.3rem 1.4rem", textDecoration: "none", transition: "background 0.3s" }}
                        onTouchStart={e => e.currentTarget.style.background = "rgba(184,151,62,0.12)"}
                        onTouchEnd={e => e.currentTarget.style.background = "rgba(184,151,62,0.04)"}>
                        <div style={{ width: "38px", height: "38px", border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <SvgWA />
                        </div>
                        <div>
                          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.15rem", letterSpacing: "0.07em", color: TEXT, marginBottom: "0.15rem" }}>{t("bk_wa_title")}</p>
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.2em", color: "rgba(28,18,8,0.68)", textTransform: "uppercase" }}>{t("bk_wa_sub")}</p>
                        </div>
                      </a>
                    </div>

                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.28em", color: "rgba(28,18,8,0.6)", textTransform: "uppercase", textAlign: "center", marginTop: "1.5rem" }}>
                      {t("bk_guarantee")}
                    </p>

                    <button onClick={() => setStep(1)}
                      style={{ display: "block", background: "none", border: "none", margin: "1.1rem auto 0", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.22em", color: "rgba(28,18,8,0.58)", textTransform: "uppercase" }}>
                      {t("bk_back")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
