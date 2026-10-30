import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { GOLD, CREAM } from "../constants.js";
import { LangCtx } from "../context.jsx";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { useEscapeKey } from "../hooks/useEscapeKey.js";
import { normalizeContactName, normalizeContactPhone, submitWhatsappContact } from "../services/whatsappContact.js";
import Portal from "./ui/Portal.jsx";
import { CONTACT_PROJECTS, buildContactMessage } from "../data/contactProjects.js";
import { contactCountries } from "../utils/contactCountries.js";
import { getWhatsappUrl } from "../utils/whatsappUtil.js";
import "./WhatsappContactModal.css";

const COPY = {
  FR: {
    step: "Étape", title: "Parler à Gaspard", firstName: "Votre prénom", phone: "Votre téléphone",
    country: "Pays / indicatif", project: "Votre projet", chooseProject: "Choisissez votre projet", details: "Précisez votre projet", message: "Votre message",
    invalidProject: "Choisissez un projet et précisez votre demande si vous sélectionnez « Autre ».",
    phoneHint: "Saisissez votre numéro local. L’indicatif du pays sélectionné sera ajouté automatiquement.",
    intro: "Laissez vos coordonnées pour que Gaspard puisse vous recontacter, puis poursuivez sur WhatsApp.",
    notice: "En continuant, vous transmettez vos coordonnées et votre projet à GaspardNZ pour être recontacté au sujet de votre projet.",
    privacy: "Confidentialité", continue: "Continuer", saving: "Enregistrement…", close: "Fermer",
    error: "Vos coordonnées n’ont pas pu être enregistrées. Réessayez : votre saisie est conservée.",
    invalidPhone: "Saisissez un numéro valide, avec l’indicatif du pays hors France.", invalidName: "Saisissez votre prénom (80 caractères maximum).",
    success: "Vos coordonnées sont enregistrées.", next: "Vous pouvez maintenant échanger avec Gaspard sur WhatsApp.",
    whatsapp: "Continuer sur WhatsApp", edit: "Modifier mes coordonnées",
  },
  EN: {
    step: "Step", title: "Talk to Gaspard", firstName: "First name", phone: "Phone number",
    country: "Country / calling code", project: "Your project", chooseProject: "Choose your project", details: "Describe your project", message: "Your message",
    invalidProject: "Choose a project and describe your request if you select Other.",
    phoneHint: "Enter your local number. The selected country’s calling code will be added automatically.",
    intro: "Leave your contact details so Gaspard can get back to you, then continue on WhatsApp.",
    notice: "By continuing, you share your contact details and project with GaspardNZ to be contacted about your project.",
    privacy: "Privacy", continue: "Continue", saving: "Saving…", close: "Close",
    error: "We could not save your contact details. Please try again; your entries have been kept.",
    invalidPhone: "Enter a valid number, including the country code outside France.", invalidName: "Enter your first name (up to 80 characters).",
    success: "Your contact details have been saved.", next: "You can now talk to Gaspard on WhatsApp.",
    whatsapp: "Continue on WhatsApp", edit: "Edit my contact details",
  },
  ES: {
    step: "Paso", title: "Hablar con Gaspard", firstName: "Nombre", phone: "Teléfono",
    country: "País / prefijo", project: "Su proyecto", chooseProject: "Elija su proyecto", details: "Describa su proyecto", message: "Su mensaje",
    invalidProject: "Elija un proyecto y describa su solicitud si selecciona Otro.",
    phoneHint: "Introduzca su número local. Se añadirá automáticamente el prefijo del país seleccionado.",
    intro: "Deja tus datos para que Gaspard pueda contactarte y continúa por WhatsApp.",
    notice: "Al continuar, facilitas tus datos de contacto y tu proyecto a GaspardNZ para que te contacte sobre tu proyecto.",
    privacy: "Privacidad", continue: "Continuar", saving: "Guardando…", close: "Cerrar",
    error: "No hemos podido guardar tus datos. Inténtalo de nuevo; se conserva lo que has escrito.",
    invalidPhone: "Introduce un número válido con el prefijo del país fuera de Francia.", invalidName: "Introduce tu nombre (máximo 80 caracteres).",
    success: "Tus datos se han guardado.", next: "Ahora puedes hablar con Gaspard por WhatsApp.",
    whatsapp: "Continuar por WhatsApp", edit: "Modificar mis datos",
  },
  ZH: {
    step: "步骤", title: "联系 Gaspard", firstName: "您的名字", phone: "您的电话号码",
    country: "国家 / 区号", project: "您的项目", chooseProject: "请选择项目", details: "请说明您的项目", message: "您的消息",
    invalidProject: "请选择项目；选择其他时请说明您的需求。",
    phoneHint: "请输入本地号码，系统将自动添加所选国家的区号。",
    intro: "留下联系方式，方便 Gaspard 联系您，然后通过 WhatsApp 继续交流。",
    notice: "继续即表示您将联系方式和项目提供给 GaspardNZ，以便就您的项目与您联系。",
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

export default function WhatsappContactModal({ isOpen, onClose, whatsappNumber }) {
  const { lang } = useContext(LangCtx);
  const copy = COPY[lang] || COPY.FR;
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("FR");
  const [projectType, setProjectType] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const countries = useMemo(() => contactCountries(lang), [lang]);
  const whatsappUrl = getWhatsappUrl(whatsappNumber, savedMessage);
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
    if (!normalizeContactPhone(phone, country)) { setError(copy.invalidPhone); return; }
    if (!projectType || (projectType === "other" && !projectDetails.trim())) { setError(copy.invalidProject); return; }
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      await submitWhatsappContact({ firstName, phone, country, projectType, projectDetails, lang });
      setSavedMessage(buildContactMessage({ firstName: normalizeContactName(firstName), projectType, projectDetails: normalizeContactName(projectDetails), lang }));
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
      <div className="gnz-contact-backdrop" onClick={close} style={{ position: "fixed", inset: 0, zIndex: 750, background: "rgba(0,0,0,.92)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "3.5rem 1rem 1rem", overflowY: "auto" }}>
        <div className="gnz-contact-dialog" ref={focusTrapRef} role="dialog" aria-modal="true" aria-labelledby="whatsapp-contact-title" aria-busy={saving} onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "#0a0602", color: CREAM, borderTop: `2px solid ${GOLD}`, padding: "1.8rem", boxSizing: "border-box", fontFamily: "'Montserrat',sans-serif" }}>
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
              <div style={{ display: "grid", gap: 8 }}>
                <label htmlFor="whatsapp-phone" style={{ fontSize: 12, letterSpacing: ".08em" }}>{copy.phone}</label>
                <div style={{ display: "flex", width: "100%" }}>
                  <select id="whatsapp-country" name="country" aria-label={copy.country} autoComplete="country" required value={country} onChange={e => setCountry(e.target.value)} disabled={saving} style={{ ...inputStyle, width: "45%", maxWidth: 165, flex: "0 0 45%", background: "#0a0602", padding: ".85rem .4rem", fontSize: 13, cursor: "pointer" }}>
                    {countries.map(item => <option key={item.code} value={item.code}>{item.name} ({item.callingCode})</option>)}
                  </select>
                  <input id="whatsapp-phone" name="tel-national" type="tel" inputMode="tel" autoComplete="tel-national" required maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} disabled={saving} aria-describedby="whatsapp-phone-hint" style={{ ...inputStyle, minWidth: 0, flex: 1, borderLeft: 0 }} />
                </div>
              </div>
              <p id="whatsapp-phone-hint" style={{ fontSize: 11, lineHeight: 1.6, margin: "-.6rem 0 0", color: "rgba(245,240,232,.75)" }}>{copy.phoneHint}</p>
              <label style={labelStyle} htmlFor="whatsapp-project">{copy.project}
                <select id="whatsapp-project" name="project" required value={projectType} onChange={e => setProjectType(e.target.value)} disabled={saving} style={{ ...inputStyle, background: "#0a0602" }}>
                  <option value="" disabled>{copy.chooseProject}</option>
                  {CONTACT_PROJECTS.map(project => <option key={project.id} value={project.id}>{project[lang] || project.FR}</option>)}
                </select>
              </label>
              {projectType === "other" && <label style={labelStyle} htmlFor="whatsapp-project-details">{copy.details}
                <textarea id="whatsapp-project-details" name="project-details" required maxLength={300} rows={3} value={projectDetails} onChange={e => setProjectDetails(e.target.value)} disabled={saving} style={{ ...inputStyle, resize: "vertical" }} />
              </label>}
              <p style={{ fontSize: 11, lineHeight: 1.7, margin: 0, color: "rgba(245,240,232,.75)" }}>{copy.notice} <a href="/confidentialite.html" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }}>{copy.privacy}</a></p>
              {error && <p role="alert" style={{ margin: 0, color: "#ffb7ab", fontSize: 13, lineHeight: 1.6 }}>{error}</p>}
              <button type="submit" disabled={saving} style={{ ...primaryStyle, opacity: saving ? .65 : 1 }}>{saving ? copy.saving : copy.continue}</button>
            </form>
          ) : (
            <div style={{ display: "grid", gap: "1.2rem" }}>
              <p role="status" style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{copy.success}</p>
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{copy.next}</p>
              <div style={{ border: "1px solid rgba(184,151,62,.4)", padding: "1rem", fontSize: 13, lineHeight: 1.7 }}><strong>{copy.message}</strong><p style={{ marginBottom: 0, overflowWrap: "anywhere" }}>{savedMessage}</p></div>
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
