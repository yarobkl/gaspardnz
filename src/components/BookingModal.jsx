import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, GOLD_LIGHT, CREAM } from "../constants.js";
import { useTr } from "../context.jsx";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { useEscapeKey } from "../hooks/useEscapeKey.js";
import { SvgWA, SvgArrow } from "../icons.jsx";
import Portal from "./ui/Portal.jsx";
import { listBookingAvailability, requestBooking } from "../services/bookingAvailability.js";

const BoutiqueModal = ({ onClose, onReserver }) => {
  const t = useTr();
  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={e => e.stopPropagation()}
      style={{ width: "100%", maxWidth: "480px", background: "#0a0602", position: "relative" }}>

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: GOLD }} />

      <div style={{ padding: "1.6rem 1.8rem 1.2rem", borderBottom: "1px solid rgba(184,151,62,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.45em", color: GOLD, textTransform: "uppercase", marginBottom: "0.3rem" }}>{t("boutique_soon_badge")}</p>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.1em", color: CREAM, margin: 0, lineHeight: 1 }}>{t("nav_boutique")}</p>
        </div>
        <button onClick={onClose} aria-label={t("close")} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: "rgba(245,240,232,0.62)", fontSize: "22px", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ padding: "2.4rem 1.8rem", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
          style={{ display: "inline-block", border: `1px solid rgba(184,151,62,0.4)`, padding: "0.3rem 1rem", marginBottom: "1.4rem" }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.45em", color: GOLD, textTransform: "uppercase" }}>
            {t("boutique_soon_badge")}
          </span>
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.2rem, 5vw, 1.5rem)", fontWeight: 300, fontStyle: "italic", color: "rgba(245,240,232,0.75)", lineHeight: 1.6, marginBottom: "1.2rem" }}>
          {t("boutique_soon_title")}
        </motion.p>

        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", fontWeight: 300, color: "rgba(245,240,232,0.45)", lineHeight: 1.9, letterSpacing: "0.02em", marginBottom: "2rem" }}>
          {t("boutique_soon_desc")}
        </motion.p>

        <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: "0 auto 2rem" }} />

        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
          onClick={onReserver}
          style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: GOLD, color: "#1c1208", padding: "0.95rem 2rem", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700 }}>
          <SvgWA />
          {t("boutique_wa_cta")}
        </motion.button>
      </div>
    </motion.div>
  );
};

const BookingModal = ({ isOpen, onClose, boutiqueMode = false, onSwitchToBooking }) => {
  const t = useTr();
  const focusTrapRef = useFocusTrap(isOpen);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nom: "", projet: "", besoin: "" });
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requestState, setRequestState] = useState({ loading: false, error: "", success: "" });

  const ok = form.nom.trim() && form.projet.trim() && form.besoin.trim();

  const nom = form.nom.trim();
  const projet = form.projet.trim();
  const besoin = form.besoin.trim();

  useEffect(() => {
    if (!isOpen || !availability.length) {
      if (!isOpen) return;
      listBookingAvailability().then((items) => {
        setAvailability(items);
        if (!selectedDate && items[0]) setSelectedDate(items[0].service_date);
      }).catch((error) => setRequestState((state) => ({ ...state, error: error.message })));
    }
  }, [isOpen]);

  const selectedAvailability = availability.find((item) => item.service_date === selectedDate);
  const submitRequest = async (event) => {
    event.preventDefault();
    setRequestState({ loading: true, error: "", success: "" });
    try {
      const result = await requestBooking({ full_name: nom, email, phone, project: projet, need: besoin, service_date: selectedDate, slot: selectedSlot });
      setRequestState({ loading: false, error: "", success: result.message });
    } catch (error) {
      setRequestState({ loading: false, error: error.message, success: "" });
      const fresh = await listBookingAvailability().catch(() => []);
      if (fresh.length) setAvailability(fresh);
    }
  };

  // Fermer (fond cliqué, "×" ou Échap) ne doit PAS effacer une saisie en
  // cours : un clic accidentel sur le fond perdait les trois champs déjà
  // remplis. Seule l'étape revient à 1, pour ne pas rouvrir sur l'étape 2
  // sans repère ; le texte tapé reste si le visiteur rouvre la fenêtre.
  const close = () => { setStep(1); onClose(); };
  useEscapeKey(isOpen, close);

  const inputStyle = {
    width: "100%", background: "none", border: "1px solid rgba(184,151,62,0.2)",
    padding: "0.85rem 1rem", fontFamily: "'Montserrat', sans-serif",
    fontSize: "16px", color: CREAM, borderRadius: 0,
    transition: "border-color 0.3s", outline: "3px solid transparent", outlineOffset: "2px",
  };
  const labelStyle = {
    display: "flex", flexDirection: "column", gap: "0.45rem",
    fontFamily: "'Montserrat', sans-serif", fontSize: "10px",
    letterSpacing: "0.2em", color: "rgba(245,240,232,0.72)",
    textTransform: "uppercase",
  };

  return (
    <Portal>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={close}
          // 750 : au-dessus du chatbot (600), de la bannière cookies (640) et
          // de la barre de navigation (700) — avant cette correction, le
          // bouton du chatbot restait visible et cliquable par-dessus cette
          // fenêtre, et son en-tête passait sous la barre de navigation.
          style={{ position: "fixed", inset: 0, zIndex: 750, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "1rem", paddingTop: "calc(env(safe-area-inset-top) + 3.5rem)", overflowY: "auto" }}>

          {boutiqueMode ? (
            <BoutiqueModal onClose={close} onReserver={onSwitchToBooking} />
          ) : (
          <motion.div
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: "480px", background: "#0a0602", position: "relative", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>

            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "rgba(184,151,62,0.12)", zIndex: 2 }}>
              <motion.div
                animate={{ width: step === 1 ? "50%" : "100%" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: "100%", background: GOLD }} />
            </div>

            <div style={{ padding: "2rem 1.8rem 1.2rem", borderBottom: "1px solid rgba(184,151,62,0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexShrink: 0 }}>
              <div>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  {step === 1 ? t("bk_step1") : t("bk_step2")}
                </p>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.6rem", letterSpacing: "0.08em", color: CREAM, lineHeight: 1 }}>
                  {step === 1 ? t("bk_title1") : t("bk_title2")}
                </p>
              </div>
              <button onClick={close} aria-label={t("close")} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 8px", color: "rgba(245,240,232,0.62)", fontSize: "22px", lineHeight: 1, marginTop: "-4px" }}>×</button>
            </div>

            <div style={{ padding: "1.8rem", overflowY: "auto", flex: 1 }}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div key="step1"
                    initial={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                    <form style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }} onSubmit={e => { e.preventDefault(); ok && setStep(2); }}>
                      {[
                        { k: "nom",    lbl: t("bk_lbl_nom"), ph: t("bk_ph_nom") },
                        { k: "projet", lbl: t("bk_lbl_projet"), ph: t("bk_ph_projet") },
                        { k: "besoin", lbl: t("bk_lbl_besoin"), ph: t("bk_ph_besoin") },
                      ].map(({ k, lbl, ph }) => (
                        <div key={k}>
                          <label htmlFor={`booking-${k}`} style={{ display: "block", fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.35em", color: "rgba(245,240,232,0.72)", textTransform: "uppercase", marginBottom: "0.5rem", cursor: "pointer" }}>
                            {lbl}
                          </label>
                          {k === "besoin" ? (
                            <textarea
                              id={`booking-${k}`}
                              value={form[k]}
                              rows={3}
                              placeholder={ph}
                              maxLength={1000}
                              required
                              aria-required="true"
                              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                              onFocus={e => e.target.style.borderColor = GOLD}
                              onBlur={e => e.target.style.borderColor = "rgba(184,151,62,0.2)"}
                              style={{ ...inputStyle, resize: "none", display: "block" }} />
                          ) : (
                            <input
                              id={`booking-${k}`}
                              type="text"
                              value={form[k]}
                              placeholder={ph}
                              maxLength={100}
                              required
                              aria-required="true"
                              onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                              onFocus={e => e.target.style.borderColor = GOLD}
                              onBlur={e => e.target.style.borderColor = "rgba(184,151,62,0.2)"}
                              style={inputStyle} />
                          )}
                        </div>
                      ))}
                      {/* Dans le <form> (et type="submit", pas un simple
                          onClick) : un clic avec des champs vides déclenche
                          la validation native du navigateur (message et
                          focus sur le premier champ invalide) au lieu de ne
                          rien faire silencieusement. */}
                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        style={{
                          marginTop: "0.6rem", width: "100%", border: "none",
                          background: ok ? GOLD : "rgba(184,151,62,0.15)",
                          color: ok ? "#1c1208" : "rgba(245,240,232,0.4)",
                          padding: "1rem", fontFamily: "'Montserrat', sans-serif",
                          fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase",
                          cursor: ok ? "pointer" : "not-allowed", transition: "all 0.4s",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        }}>
                        {t("bk_continue")} <SvgArrow size={12} />
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div key="step2"
                    initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "rgba(245,240,232,0.78)", fontStyle: "italic", textAlign: "center", marginBottom: "1.2rem", lineHeight: 1.65 }}>
                      Choisissez un créneau disponible. Votre demande sera confirmée personnellement par Gaspard.
                    </p>
                    {availability.length ? <form onSubmit={submitRequest} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                      <label style={{ ...labelStyle }}>Date du rendez-vous<select required value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(""); }} style={inputStyle}><option value="">Choisir une date</option>{availability.map((item) => <option key={item.service_date} value={item.service_date}>{new Date(`${item.service_date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · {item.max_clients} place{item.max_clients > 1 ? "s" : ""}</option>)}</select></label>
                      <label style={{ ...labelStyle }}>Horaire<select required value={selectedSlot} onChange={(e) => setSelectedSlot(e.target.value)} style={inputStyle}><option value="">Choisir un horaire</option>{(selectedAvailability?.slots || []).map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label>
                      <label style={{ ...labelStyle }}>Votre email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="vous@exemple.fr" /></label>
                      <label style={{ ...labelStyle }}>Téléphone<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="06…" /></label>
                      {requestState.error && <p role="alert" style={{ color: "#e7a0a0", fontFamily: "'Montserrat', sans-serif", fontSize: "11px" }}>{requestState.error}</p>}
                      {requestState.success && <div role="status" style={{ border: `1px solid rgba(184,151,62,0.45)`, padding: "1.15rem 1rem", textAlign: "center", color: GOLD_LIGHT, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.55 }}>
                        <strong style={{ display: "block", fontSize: "13px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.55rem" }}>Demande envoyée avec succès</strong>
                        <span style={{ display: "block", fontSize: "11px" }}>Merci pour votre demande. GaspardNZ vous recontactera personnellement pour confirmer votre rendez-vous.</span>
                      </div>}
                      {!requestState.success && <motion.button type="submit" disabled={requestState.loading} whileTap={{ scale: 0.97 }} style={{ marginTop: "0.4rem", width: "100%", border: "none", background: GOLD, color: "#1c1208", padding: "1rem", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: requestState.loading ? "wait" : "pointer" }}>{requestState.loading ? "Envoi…" : "Envoyer ma demande"}</motion.button>}
                    </form> : <p style={{ color: "rgba(245,240,232,0.6)", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textAlign: "center" }}>Les disponibilités seront bientôt mises à jour.</p>}

                    <button onClick={() => setStep(1)}
                      style={{ display: "block", background: "none", border: "none", margin: "1.1rem auto 0", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.22em", color: "rgba(245,240,232,0.58)", textTransform: "uppercase" }}>
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
    </Portal>
  );
};

export default BookingModal;
