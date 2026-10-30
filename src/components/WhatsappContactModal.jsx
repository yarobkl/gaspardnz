import { useContext, useEffect, useRef, useState } from "react";
import { GOLD, CREAM } from "../constants.js";
import { LangCtx } from "../context.jsx";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { useEscapeKey } from "../hooks/useEscapeKey.js";
import { normalizeContactName, normalizeContactPhone, submitWhatsappContact } from "../services/whatsappContact.js";
import Portal from "./ui/Portal.jsx";

const COPY = {
  FR: {
    step: "Étape", title: "Parler à Gaspard", firstName: "Votre prénom", phone: "Votre téléphone",
    phoneHint: "Ex. 06 12 34 56 78 · hors France, ajoutez l’indicatif du pays (+…).",
    intro: "Laissez vos coordonnées pour que Gaspard puisse vous recontacter, puis poursuivez sur WhatsApp.",
    notice: "En continuant, vous transmettez votre prénom et votre téléphone à GaspardNZ pour être recontacté au sujet de votre projet.",
    privacy: "Confidentialité", continue: "Continuer", saving: "Enregistrement…", close: "Fermer",
    error: "Vos coordonnées n’ont pas pu être enregistrées. Réessayez : votre saisie est conservée.",
    invalidPhone: "Saisissez un numéro valide, avec l’indicatif du pays hors France.", invalidName: "Saisissez votre prénom (80 caractères maximum).",
    success: "Vos coordonnées sont enregistrées.", next: "Vous pouvez maintenant échanger avec Gaspard sur WhatsApp.",
    whatsapp: "Continuer sur WhatsApp", edit: "Modifier mes coordonnées",
  },
  EN: {
    step: "Step", title: "Talk to Gaspard", firstName: "First name", phone: "Phone number",
    phoneHint: "E.g. +44 7700 900000 · include your country code outside France.",
    intro: "Leave your contact details so Gaspard can get back to you, then continue on WhatsApp.",
    notice: "By continuing, you share your first name and phone number with GaspardNZ to be contacted about your project.",
    privacy: "Privacy", continue: "Continue", saving: "Saving…", close: "Close",
    error: "We could not save your contact details. Please try again; your entries have been kept.",
    invalidPhone: "Enter a valid number, including the country code outside France.", invalidName: "Enter your first name (up to 80 characters).",
    success: "Your contact details have been saved.", next: "You can now talk to Gaspard on WhatsApp.",
    whatsapp: "Continue on WhatsApp", edit: "Edit my contact details",
  },
  ES: {
    step: "Paso", title: "Hablar con Gaspard", firstName: "Nombre", phone: "Teléfono",
    phoneHint: "Ej. +34 612 345 678 · fuera de Francia, incluye el prefijo del país.",
    intro: "Deja tus datos para que Gaspard pueda contactarte y continúa por WhatsApp.",
    notice: "Al continuar, facilitas tu nombre y teléfono a GaspardNZ para que te contacte sobre tu proyecto.",
    privacy: "Privacidad", continue: "Continuar", saving: "Guardando…", close: "Cerrar",
    error: "No hemos podido guardar tus datos. Inténtalo de nuevo; se conserva lo que has escrito.",
    invalidPhone: "Introduce un número válido con el prefijo del país fuera de Francia.", invalidName: "Introduce tu nombre (máximo 80 caracteres).",
    success: "Tus datos se han guardado.", next: "Ahora puedes hablar con Gaspard por WhatsApp.",
    whatsapp: "Continuar por WhatsApp", edit: "Modificar mis datos",
  },
  ZH: {
    step: "步骤", title: "联系 Gaspard", firstName: "您的名字", phone: "您的电话号码",
    phoneHint: "法国以外的号码请加上国家区号，例如 +86。",
    intro: "留下联系方式，方便 Gaspard 联系您，然后通过 WhatsApp 继续交流。",
    notice: "继续即表示您将名字和电话号码提供给 GaspardNZ，以便就您的项目与您联系。",
    privacy: "隐私政策", continue: "继续", saving: "正在保存…", close: "关闭",
    error: "无法保存您的联系方式。请重试，已保留您填写的内容。",
    invalidPhone: "请输入有效号码；法国以外的号码请加国家区号。", invalidName: "请输入名字（最多80个字符）。",
    success: "您的联系方式已保存。", next: "现在可以通过 WhatsApp 与 Gaspard 交流。",
    whatsapp: "通过 WhatsApp 继续", edit: "修改联系方式",
  },
};

const inputStyle = { width: "100%", boxSizing: "border-box", background: "none", border: "1px solid rgba(184,151,62,.4)", padding: ".85rem 1rem", fontFamily: "'Montserrat',sans-serif", fontSize: 16, color: CREAM, borderRadius: 0 };
const labelStyle = { display: "grid", gap: 8, fontSize: 12, letterSpacing: ".08em" };
const primaryStyle = { display: "block", boxSizing: "border-box", width: "100%", border: `1px solid ${GOLD}`, padding: "1rem", minHeight: 50, background: GOLD, color: "#1c1208", textAlign: "center", textDecoration: "none", fontFamily: "'Montserrat',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" };

export default function WhatsappContactModal({ isOpen, onClose, whatsappUrl }) {
  const { lang } = useContext(LangCtx);
  const copy = COPY[lang] || COPY.FR;
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const heading = useRef(null);
  const focusTrapRef = useFocusTrap(isOpen);
  const close = () => { if (!busy.current) { setStep(1); onClose(); } };
  useEscapeKey(isOpen, close);
  useEffect(() => { if (isOpen && step === 2) heading.current?.focus(); }, [step, isOpen]);

  const submit = async (event) => {
    event.preventDefault();
    if (busy.current) return;
    if (!normalizeContactName(firstName) || normalizeContactName(firstName).length > 80) { setError(copy.invalidName); return; }
    if (!normalizeContactPhone(phone)) { setError(copy.invalidPhone); return; }
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      await submitWhatsappContact({ firstName, phone });
      setStep(2);
    } catch {
      setError(copy.error);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <Portal>
      <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 750, background: "rgba(0,0,0,.92)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "3.5rem 1rem 1rem", overflowY: "auto" }}>
        <div ref={focusTrapRef} role="dialog" aria-modal="true" aria-labelledby="whatsapp-contact-title" aria-busy={saving} onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "#0a0602", color: CREAM, borderTop: `2px solid ${GOLD}`, padding: "1.8rem", boxSizing: "border-box", fontFamily: "'Montserrat',sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: ".3em", color: GOLD, textTransform: "uppercase" }}>{copy.step} {step} / 2</p>
              <h2 id="whatsapp-contact-title" ref={heading} tabIndex={-1} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, fontWeight: 400, margin: ".5rem 0 1.5rem" }}>{copy.title}</h2>
            </div>
            <button type="button" aria-label={copy.close} disabled={saving} onClick={close} style={{ color: CREAM, background: "none", border: 0, fontSize: 24, minWidth: 44, minHeight: 44, cursor: "pointer" }}>×</button>
          </div>
          {step === 1 ? (
            <form onSubmit={submit} style={{ display: "grid", gap: "1.2rem" }}>
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{copy.intro}</p>
              <label style={labelStyle} htmlFor="whatsapp-first-name">{copy.firstName}
                <input id="whatsapp-first-name" name="given-name" autoComplete="given-name" required maxLength={80} value={firstName} onChange={e => setFirstName(e.target.value)} disabled={saving} style={inputStyle} />
              </label>
              <label style={labelStyle} htmlFor="whatsapp-phone">{copy.phone}
                <input id="whatsapp-phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" required maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} disabled={saving} aria-describedby="whatsapp-phone-hint" style={inputStyle} />
              </label>
              <p id="whatsapp-phone-hint" style={{ fontSize: 11, lineHeight: 1.6, margin: "-.6rem 0 0", color: "rgba(245,240,232,.75)" }}>{copy.phoneHint}</p>
              <p style={{ fontSize: 11, lineHeight: 1.7, margin: 0, color: "rgba(245,240,232,.75)" }}>{copy.notice} <a href="/confidentialite.html" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>{copy.privacy}</a></p>
              {error && <p role="alert" style={{ margin: 0, color: "#ffb7ab", fontSize: 13, lineHeight: 1.6 }}>{error}</p>}
              <button type="submit" disabled={saving} style={{ ...primaryStyle, opacity: saving ? .65 : 1 }}>{saving ? copy.saving : copy.continue}</button>
            </form>
          ) : (
            <div style={{ display: "grid", gap: "1.2rem" }}>
              <p role="status" style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{copy.success}</p>
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{copy.next}</p>
              {/* A real link on a separate click avoids mobile popup blocking
                  after an asynchronous CRM request. Sending stays voluntary. */}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={primaryStyle}>{copy.whatsapp}</a>
              <button type="button" onClick={() => { setError(""); setStep(1); }} style={{ border: 0, color: CREAM, background: "none", minHeight: 44, cursor: "pointer" }}>{copy.edit}</button>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
