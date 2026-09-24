import { trackEvent } from "./adminAnalytics.js";
import { sendPublicEvent } from "./supabaseClient.js";
import { getTrackingContext } from "./siteTracking.js";
import { EMAIL_NOTIFICATIONS_ENABLED } from "../constants.js";

// Candidature d'un professionnel qui veut devenir partenaire de Gaspard.
// Enregistrée dans le CRM (leads, type "partner_application") puis envoyée
// par email à Gaspard, avec accusé de réception au professionnel.

const cleanLine = (value, max = 200) =>
  String(value ?? "")
    .split("")
    .filter((ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) !== 127)
    .join("")
    .trim()
    .slice(0, max);

export const submitPartnerApplication = async (data) => {
  const application = {
    name: cleanLine(data.name, 100),
    company: cleanLine(data.company, 120),
    trade: cleanLine(data.trade, 100),
    email: cleanLine(data.email, 150),
    phone: cleanLine(data.phone, 30),
    portfolio: cleanLine(data.portfolio, 200),
    message: String(data.message || "").slice(0, 2000).trim(),
  };

  try {
    const leadPayload = {
      ...getTrackingContext(),
      full_name: application.name,
      email: application.email,
      phone: application.phone,
      request_type: "partner_application",
      channel: "partner_application",
      message: [application.trade, application.company, application.message].filter(Boolean).join(" · "),
      metadata: { trade: application.trade, company: application.company || null, portfolio: application.portfolio || null },
    };
    // Sur mobile (4G), le premier appel peut se perdre en route : on
    // réessaie une fois avant d'afficher une erreur.
    let crm = await sendPublicEvent("lead", leadPayload);
    if (!crm?.ok && (!crm?.status || crm.status >= 500)) crm = await sendPublicEvent("lead", leadPayload);
    if (!crm?.ok) throw new Error("La candidature n'a pas pu être enregistrée.");
  } catch (error) {
    console.error("Partner application error:", error);
    return { success: false, error: error?.message || "Erreur lors de l'envoi" };
  }

  // La candidature est enregistrée dans le CRM : c'est un succès pour le
  // professionnel, même si l'email échoue (l'échec est journalisé côté
  // serveur et visible dans l'admin). Afficher une erreur ici ferait
  // renvoyer le formulaire et créerait des doublons.
  if (!EMAIL_NOTIFICATIONS_ENABLED) return { success: true, emailSent: false };
  try {

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "partner_application",
        to: ["gaspardnz.contact@gmail.com"],
        cc: ["eliebakala@gmail.com"],
        clientName: application.name,
        clientEmail: application.email,
        clientPhone: application.phone,
        company: application.company,
        trade: application.trade,
        portfolio: application.portfolio,
        message: application.message,
        timestamp: new Date().toISOString(),
        website: String(data.website || "").slice(0, 200),
        formStartedAt: Number(data.formStartedAt) || null,
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || `Email sending returned status: ${response.status}`);
    }

    trackEvent("partner_application_sent", { trade: application.trade });
    return { success: true, emailSent: true };
  } catch (error) {
    console.warn("Partner application email failed:", error);
    return { success: true, emailSent: false };
  }
};
