import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, CREAM } from "../constants.js";
import { useTr } from "../context.jsx";
import { trackPartnerContact, sendPartnerContactEmail } from "../services/partnerTracking.js";

const PartnersContactModal = ({ isOpen, onClose, partner }) => {
  const t = useTr();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tracker le contact
      await trackPartnerContact(partner.id, formData);

      // Envoyer emails
      if (partner.email) {
        await sendPartnerContactEmail(partner.id, partner.email, formData);
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", eventType: "", eventDate: "", message: "" });

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Form submission error:", error);
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
                <h3 style={{ color: GOLD, fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", margin: "0 0 1rem 0" }}>
                  {t("partners_form_success") || "Merci!"}
                </h3>
                <p style={{ color: CREAM, fontFamily: "'Cormorant Garamond', serif", fontSize: "16px" }}>
                  {t("partners_form_success_msg") || "Vous recevrez une réponse sous 24h"}
                </p>
              </motion.div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                  <h2 style={{ color: GOLD, fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", margin: 0 }}>
                    {t("partners_form_title") || "Contactez ce partenaire"}
                  </h2>
                  <button
                    onClick={onClose}
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
                    <label style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_name") || "Nom"}
                    </label>
                    <input
                      type="text"
                      name="name"
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
                    <label style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_email") || "Email"}
                    </label>
                    <input
                      type="email"
                      name="email"
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
                    <label style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_phone") || "Téléphone"}
                    </label>
                    <input
                      type="tel"
                      name="phone"
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
                    <label style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_event") || "Type d'événement"}
                    </label>
                    <input
                      type="text"
                      name="eventType"
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
                    <label style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_date") || "Date prévue"}
                    </label>
                    <input
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
                    <label style={{ display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {t("partners_form_message") || "Message"}
                    </label>
                    <textarea
                      name="message"
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
