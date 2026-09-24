import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, CREAM } from "../constants.js";
import { LangCtx } from "../context.jsx";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { submitPartnerApplication } from "../services/partnerApplication.js";
import Portal from "./ui/Portal.jsx";

// Formulaire réservé aux professionnels (wedding planner, traiteur, DJ…)
// qui veulent travailler avec Gaspard. Distinct des formulaires clients.
const COPY = {
  FR: {
    title: "Devenir partenaire", intro: "Vous êtes professionnel de l'événementiel ? Présentez-vous, Gaspard vous répondra personnellement.",
    name: "Votre nom", company: "Entreprise", trade: "Métier", email: "Email", phone: "Téléphone", portfolio: "Instagram ou site",
    message: "Message", messagePh: "Votre activité, vos références, ce que vous aimeriez construire ensemble…",
    submit: "Envoyer ma candidature", sending: "Envoi…", successTitle: "Merci !", successMsg: "Votre candidature a bien été envoyée. Gaspard reviendra vers vous rapidement.",
    errorTitle: "Erreur", retry: "Réessayer", close: "Fermer",
  },
  EN: {
    title: "Become a partner", intro: "Are you an event professional? Introduce yourself and Gaspard will get back to you personally.",
    name: "Your name", company: "Company", trade: "Profession", email: "Email", phone: "Phone", portfolio: "Instagram or website",
    message: "Message", messagePh: "Your business, your references, what you would like to build together…",
    submit: "Send my application", sending: "Sending…", successTitle: "Thank you!", successMsg: "Your application has been sent. Gaspard will get back to you shortly.",
    errorTitle: "Error", retry: "Try again", close: "Close",
  },
  ES: {
    title: "Ser socio", intro: "¿Eres profesional de eventos? Preséntate y Gaspard te responderá personalmente.",
    name: "Tu nombre", company: "Empresa", trade: "Profesión", email: "Email", phone: "Teléfono", portfolio: "Instagram o web",
    message: "Mensaje", messagePh: "Tu actividad, tus referencias, lo que te gustaría construir juntos…",
    submit: "Enviar mi candidatura", sending: "Enviando…", successTitle: "¡Gracias!", successMsg: "Tu candidatura se ha enviado. Gaspard te responderá pronto.",
    errorTitle: "Error", retry: "Reintentar", close: "Cerrar",
  },
  ZH: {
    title: "成为合作伙伴", intro: "您是活动行业的专业人士吗？请介绍一下自己，Gaspard 会亲自回复您。",
    name: "您的姓名", company: "公司", trade: "职业", email: "邮箱", phone: "电话", portfolio: "Instagram 或网站",
    message: "留言", messagePh: "您的业务、案例，以及希望共同打造的合作…",
    submit: "发送申请", sending: "发送中…", successTitle: "谢谢！", successMsg: "您的申请已发送，Gaspard 会尽快与您联系。",
    errorTitle: "错误", retry: "重试", close: "关闭",
  },
};

const emptyForm = (trade = "") => ({ name: "", company: "", trade, email: "", phone: "", portfolio: "", message: "" });

const labelStyle = { display: "block", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "12px", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "0.8rem", background: "rgba(245,240,232,0.05)", border: `1px solid ${GOLD}`, color: CREAM, fontFamily: "'Montserrat', sans-serif", borderRadius: "4px", boxSizing: "border-box" };

const PartnerApplicationModal = ({ isOpen, onClose, trade = "" }) => {
  const { lang } = useContext(LangCtx);
  const copy = COPY[lang] || COPY.FR;
  const focusTrapRef = useFocusTrap(isOpen);
  const [formData, setFormData] = useState(() => emptyForm(trade));
  const [website, setWebsite] = useState("");
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Chaque ouverture préremplit le métier de la carte cliquée et repart
  // avec un honeypot vide et un challenge temporel neuf.
  useEffect(() => {
    if (!isOpen) return;
    setFormData((prev) => ({ ...prev, trade }));
    setWebsite("");
    setFormStartedAt(Date.now());
    setSubmitted(false);
    setError(null);
  }, [isOpen, trade]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await submitPartnerApplication({ ...formData, website, formStartedAt });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
    setFormData(emptyForm());
  };

  const field = (name, { type = "text", required = false, maxLength = 150, placeholder } = {}) => (
    <div>
      <label htmlFor={`application-${name}`} style={labelStyle}>{copy[name]}{required ? " *" : ""}</label>
      <input id={`application-${name}`} type={type} name={name} value={formData[name]} onChange={handleChange}
        required={required} maxLength={maxLength} placeholder={placeholder} style={inputStyle} />
    </div>
  );

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.4rem" }}>
            <motion.div
              ref={focusTrapRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="application-modal-title"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#0a0602", border: `1px solid ${GOLD}33`, borderRadius: "8px", padding: "2rem", maxWidth: "500px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 id="application-modal-title" style={{ color: GOLD, fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", margin: 0, letterSpacing: "0.04em" }}>
                  {submitted ? copy.successTitle : copy.title}
                </h2>
                <button type="button" onClick={onClose} aria-label={copy.close}
                  style={{ background: "none", border: "none", color: CREAM, fontSize: "24px", cursor: "pointer", padding: 0 }}>
                  ✕
                </button>
              </div>

              {submitted ? (
                <p style={{ color: CREAM, fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", lineHeight: 1.6, margin: 0 }}>{copy.successMsg}</p>
              ) : error ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#ff6b6b", fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", margin: "0 0 .6rem" }}>{copy.errorTitle}</p>
                  <p style={{ color: "rgba(255,107,107,0.9)", fontFamily: "'Montserrat', sans-serif", fontSize: "14px", marginBottom: "1.5rem" }}>{error}</p>
                  <button type="button" onClick={() => setError(null)}
                    style={{ background: "rgba(255,107,107,0.2)", border: "1px solid rgba(255,107,107,0.5)", color: "#ff6b6b", padding: "0.6rem 1.2rem", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", borderRadius: "4px" }}>
                    {copy.retry}
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ color: "rgba(245,240,232,0.75)", fontFamily: "'Cormorant Garamond', serif", fontSize: "16px", fontStyle: "italic", lineHeight: 1.5, margin: "0 0 1.5rem" }}>{copy.intro}</p>
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: "1px", height: "1px", overflow: "hidden" }}>
                      <label htmlFor="application-website">Ne pas remplir ce champ</label>
                      <input id="application-website" type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
                    </div>

                    {field("trade", { required: true, maxLength: 100 })}
                    {field("name", { required: true, maxLength: 100 })}
                    {field("company", { maxLength: 120 })}
                    {field("email", { type: "email", required: true })}
                    {field("phone", { type: "tel", maxLength: 30, placeholder: "+33 6 12 34 56 78" })}
                    {field("portfolio", { maxLength: 200, placeholder: "@instagram / https://…" })}

                    <div>
                      <label htmlFor="application-message" style={labelStyle}>{copy.message}</label>
                      <textarea id="application-message" name="message" maxLength={2000} rows="4" value={formData.message} onChange={handleChange}
                        placeholder={copy.messagePh} style={{ ...inputStyle, resize: "vertical" }} />
                    </div>

                    <button type="submit" disabled={loading}
                      style={{ background: `rgba(184,151,62,0.14)`, border: `1px solid ${GOLD}`, color: CREAM, padding: "0.9rem", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", borderRadius: "4px", opacity: loading ? 0.6 : 1 }}>
                      {loading ? copy.sending : copy.submit}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  );
};

export default PartnerApplicationModal;
