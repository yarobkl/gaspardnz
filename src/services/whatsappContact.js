import { sendPublicEvent } from "./supabaseClient.js";
import { getTrackingContext } from "./siteTracking.js";
import { getCountryCallingCode, isSupportedCountry, parsePhoneNumberFromString } from "libphonenumber-js/min";
import { buildContactMessage, contactProjectLabel, getContactProject } from "../data/contactProjects.js";

export const CONTACT_NOTICE_VERSION = "2026-10-30";

export function normalizeContactPhone(value, country) {
  const raw = String(value || "").trim();
  if (!/^[+\d\s().-]+$/.test(raw)) return "";
  let phone = raw.replace(/[\s().-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (country && !isSupportedCountry(country)) return "";
  const parsed = parsePhoneNumberFromString(phone, { defaultCountry: country || "FR", extract: false });
  if (!parsed?.isPossible() || parsed.ext) return "";
  if (country && parsed.countryCallingCode !== getCountryCallingCode(country)) return "";
  return parsed.number;
}

export function normalizeContactName(value) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, "").trim().replace(/\s+/g, " ");
}

// Kept in memory only: no contact details in localStorage or analytics.
// Coalesces double submissions and reuses a successful save on reopening.
const submissions = new Map();

async function notifyContact(leadId) {
  try {
    const response = await fetch("/api/notify-whatsapp-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
      keepalive: true,
    });
    if (!response.ok) return false;
    return (await response.json())?.success === true;
  } catch { return false; }
}

export async function submitWhatsappContact({ firstName, phone, country = "FR", projectType, projectDetails = "", lang = "FR" }) {
  const name = normalizeContactName(firstName);
  const normalizedPhone = normalizeContactPhone(phone, country);
  if (!name || name.length > 80 || !normalizedPhone) {
    throw new Error("invalid_contact");
  }
  const details = normalizeContactName(projectDetails);
  if (!getContactProject(projectType) || (projectType === "other" && (!details || details.length > 300))) throw new Error("invalid_project");
  const projectLabel = contactProjectLabel(projectType);
  const relevantDetails = projectType === "other" ? details : "";
  const whatsappMessage = buildContactMessage({ firstName: name, projectType, projectDetails: relevantDetails, lang });
  const key = JSON.stringify([name.toLocaleLowerCase(), normalizedPhone, country, projectType, relevantDetails]);
  if (submissions.has(key)) return submissions.get(key);

  const save = (async () => {
    const context = getTrackingContext();
    const result = await sendPublicEvent("lead", {
      ...context,
      full_name: name,
      phone: normalizedPhone,
      request_type: "whatsapp_contact",
      source: "Site GaspardNZ",
      channel: "whatsapp",
      message: whatsappMessage,
      metadata: {
        entry_point: "parler_a_gaspard",
        country_code: country,
        calling_code: `+${getCountryCallingCode(country)}`,
        project_type: projectType,
        project_label: projectLabel,
        project_details: relevantDetails || null,
        acquisition_source: context.source || null,
        page_path: window.location.pathname,
        contact_notice_version: CONTACT_NOTICE_VERSION,
        contact_requested_at: new Date().toISOString(),
        // A submitted contact is a prospect, never proof of a WhatsApp
        // message sent, a confirmed appointment or a converted customer.
        whatsapp_message_status: "unknown",
      },
    });
    if (!result?.ok || !result?.id) throw new Error("contact_save_failed");
    // The lead stays saved even if SMTP is unavailable. The server logs
    // each recipient's result; no client acknowledgement is sent, because
    // this form deliberately collects no email address.
    const notificationSent = await notifyContact(result.id);
    return { ...result, notificationSent };
  })();
  submissions.set(key, save);
  try {
    return await save;
  } catch (error) {
    submissions.delete(key);
    throw error;
  }
}
