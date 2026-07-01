import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, CREAM } from "../constants.js";
import { useTr } from "../context.jsx";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { trackPartnerContact, sendPartnerContactEmail } from "../services/partnerTracking.js";

// Retire les sauts de ligne et caractères de contrôle des champs courts
// (protection contre l'injection d'en-têtes email côté futur backend)
const cleanLine = (value) =>
  String(value)
    .split("")
    .filter((ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) !== 127)
    .join("")
    .trim();

const PartnersContactModal = ({ isOpen, onClose, partner }) => {
  const t = useTr();
  const focusTrapRef = useFocusTrap(isOpen);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Nettoie les champs courts (anti-injection d'en-têtes) avant envoi
      const safeData = {
        ...formData,
        name: cleanLine(formData.name),
        email: cleanLine(formData.email),
        phone: cleanLine(formData.phone),
        eventType: cleanLine(formData.eventType),
        eventDate: cleanLine(formData.eventDate),
        message: String(formData.message).slice(0, 2000).trim(),
      };

      // Tracker le contact
      const trackResult = await trackPartnerContact(partner.id, safeData);
      if (!trackResult.success) {
        throw new Error("Failed to track contact");
      }

      // Envoyer emails (avec status du partenaire pour router correctement)
      const emailResult = await sendPartnerContactEmail(partner.id, partner.email || "", safeData, partner.status, partner.name);
      if (!emailResult.success) {
        throw new Error(emailResult.error || "Failed to send email");
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", eventType: "", eventDate: "", message: "" });

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Form submission error:", err);
      setError(err.message || "Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1.4rem",
          }}>
          <motion.div
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-modal-title"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0a0602",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center" }}>
                <h2 style={{ color: GOLD, fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", margin: "0 0 1rem 0" }}>
                  {t("partners_form_success") || "Merci!"}
                </h2>
                <p style={{ color: CREAM, fontFamily: "'Cormorant Garamond', serif", fontSize: "16px" }}>
                  {t("partners_form_success_msg") || "Vous recevrez une réponse sous 24h"}
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center" }}>
                <h2 style={{ color: "#ff6b6b", fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", margin: "0 0 1rem 0" }}>
                  Erreur
                </h2>
                <p style={{ color: "rgba(255,107,107,0.9)", fontFamily: "'Montserrat', sans-serif", fontSize: "14px", marginBottom: "1.5rem" }}>
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  style={{
                    background: "rgba(255,107,107,0.2)",
                    border: "1px solid rgba(255,107,107,0.5)",
                    color: "#ff6b6b",
                    padding: "0.6rem 1.2rem",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "12px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}>
                  Réessayer
                </button>
              </motion.div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                  <h2 id="partner-modal-title" style={{ color: GOLD, fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", margin: 0 }}>
                    {t("partners_form_title") || "Contactez ce partenaire"}
                  </h2>
                  <button
                    onClick={onClose}
                    aria-label="Close dialog"
                    style={{
                      background: "none",
                      border: "none",
                      color: CREAM,
                      fontSize: "24px",
                      cursor: "pointer",
                      padding: 0,
                    }}>
                    ✕
                  </button>
                </div>

                <p style={{ color: "rgba(245,240,232,0.7)", fontFamily: "'Montserrat', sans-serif", fontSize: "13px", marginBottom: "1.5rem" }}>
                  {partner.name}
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <div>
                    <label htmlFor="partner-name" style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_name") || "Nom"}
                    </label>
                    <input
                      id="partner-name"
                      type="text"
                      name="name"
                      maxLength={100}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        background: "rgba(245,240,232,0.05)",
                        border: `1px solid ${GOLD}`,
                        color: CREAM,
                        fontFamily: "'Montserrat', sans-serif",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                      }}
                      placeholder={t("partners_form_name_ph") || "Votre nom"}
                    />
                  </div>

                  <div>
                    <label htmlFor="partner-email" style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_email") || "Email"}
                    </label>
                    <input
                      id="partner-email"
                      type="email"
                      name="email"
                      maxLength={150}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        background: "rgba(245,240,232,0.05)",
                        border: `1px solid ${GOLD}`,
                        color: CREAM,
                        fontFamily: "'Montserrat', sans-serif",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                      }}
                      placeholder={t("partners_form_email_ph") || "votre@email.com"}
                    />
                  </div>

                  <div>
                    <label htmlFor="partner-phone" style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_phone") || "Téléphone"}
                    </label>
                    <input
                      id="partner-phone"
                      type="tel"
                      name="phone"
                      maxLength={30}
                      value={formData.phone}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        background: "rgba(245,240,232,0.05)",
                        border: `1px solid ${GOLD}`,
                        color: CREAM,
                        fontFamily: "'Montserrat', sans-serif",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                      }}
                      placeholder={t("partners_form_phone_ph") || "+33 6 12 34 56 78"}
                    />
                  </div>

                  <div>
                    <label htmlFor="partner-eventType" style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_event") || "Type d'événement"}
                    </label>
                    <input
                      id="partner-eventType"
                      type="text"
                      name="eventType"
                      maxLength={100}
                      value={formData.eventType}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        background: "rgba(245,240,232,0.05)",
                        border: `1px solid ${GOLD}`,
                        color: CREAM,
                        fontFamily: "'Montserrat', sans-serif",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                      }}
                      placeholder={t("partners_form_event_ph") || "Mariage, gala, etc."}
                    />
                  </div>

                  <div>
                    <label htmlFor="partner-eventDate" style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_date") || "Date prévue"}
                    </label>
                    <input
                      id="partner-eventDate"
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        background: "rgba(245,240,232,0.05)",
                        border: `1px solid ${GOLD}`,
                        color: CREAM,
                        fontFamily: "'Montserrat', sans-serif",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="partner-message" style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_message") || "Message"}
                    </label>
                    <textarea
                      id="partner-message"
                      name="message"
                      maxLength={2000}
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      style={{
                        width: "100%",
                        padding: "0.8rem",
                        background: "rgba(245,240,232,0.05)",
                        border: `1px solid ${GOLD}`,
                        color: CREAM,
                        fontFamily: "'Montserrat', sans-serif",
                        borderRadius: "4px",
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                      placeholder={t("partners_form_message_ph") || "Décrivez votre projet..."}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ background: `${GOLD}20` }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      background: `rgba(184,151,62,0.1)`,
                      border: `1px solid ${GOLD}`,
                      color: CREAM,
                      padding: "0.8rem",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "13px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: loading ? "not-allowed" : "pointer",
                      borderRadius: "4px",
                      opacity: loading ? 0.6 : 1,
                    }}>
                    {loading ? (t("partners_form_sending") || "Envoi...") : (t("partners_form_submit") || "Envoyer")}
                  </motion.button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PartnersContactModal;
