import { trackEvent } from "./adminAnalytics.js";
import { sendPublicEvent } from "./supabaseClient.js";
import { getTrackingContext } from "./siteTracking.js";

export const trackPartnerContact = async (partnerId, clientData) => {
  try {
    trackEvent("partner_contact", {
      partner_id: partnerId,
      event_type: clientData.eventType,
    });

    const context = getTrackingContext();
    const result = await sendPublicEvent("partner_contact", {
      ...context,
      partner_slug: partnerId,
      full_name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      message: [clientData.eventType, clientData.eventDate, clientData.message].filter(Boolean).join(" · "),
      metadata: {
        event_type: clientData.eventType || null,
        event_date: clientData.eventDate || null,
        commission_percentage: 5,
        client_discount_percentage: 5,
      },
    });

    if (!result?.ok) throw new Error("La demande n'a pas pu être enregistrée dans le CRM.");
    return { success: true, id: result.id, leadId: result.lead_id, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error("Partner tracking error:", error);
    return { success: false, error: error?.message || "Erreur CRM" };
  }
};

const cleanLine = (value) =>
  String(value ?? "")
    .split("")
    .filter((ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) !== 127)
    .join("")
    .trim();

export const sendPartnerContactEmail = async (partnerId, partnerEmail, clientData, partnerStatus = null, partnerName = "") => {
  try {
    const gaspardEmail = "gaspardnz.contact@gmail.com";
    const userEmail = "eliebakala@gmail.com";
    const emailData = {
      to: [gaspardEmail],
      cc: [userEmail],
      subject: `Nouvelle demande ${partnerName ? `- ${cleanLine(partnerName)}` : "partenaire"} - ${cleanLine(clientData.name)}`,
      partnerId,
      partnerName: cleanLine(partnerName || partnerId),
      clientName: cleanLine(clientData.name),
      clientEmail: cleanLine(clientData.email),
      clientPhone: cleanLine(clientData.phone),
      eventType: cleanLine(clientData.eventType),
      eventDate: cleanLine(clientData.eventDate),
      message: String(clientData.message || "").slice(0, 2000).trim(),
      timestamp: new Date().toISOString(),
      isComingSoon: partnerStatus === "coming_soon" || partnerId === "palais-groupe",
    };

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || `Email sending returned status: ${response.status}`);
    }

    const context = getTrackingContext();
    await sendPublicEvent("analytics_event", {
      ...context,
      event_name: "partner_email_sent",
      entity_type: "partner",
      entity_id: partnerId,
      page_path: window.location.pathname,
      metadata: { partner_name: partnerName || partnerId },
    });

    return { success: true };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error?.message || "Erreur email" };
  }
};
