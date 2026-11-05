import { sendPublicEvent } from "./supabaseClient.js";
import { Capacitor } from "@capacitor/core";
import { SITE_URL } from "../constants.js";
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
export function normalizeContactEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.slice(0, 320) : "";
}

const submissions = new Map();

async function notifyContact(leadId) {
  try {
    const endpoint = Capacitor.getPlatform() === "ios" ? `${SITE_URL}/api/notify-whatsapp-contact` : "/api/notify-whatsapp-contact";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId }),
      keepalive: true,
    });
    if (!response.ok) return false;
    return (await response.json())?.success === true;
  } catch { return false; }
}

export async function submitWhatsappContact({ firstName, email = "", phone, country = "FR", projectType, projectDetails = "", lang = "FR" }) {
  const name = normalizeContactName(firstName);
  const normalizedPhone = normalizeContactPhone(phone, country);
  if (!name || name.length > 80 || !normalizedPhone) throw new Error("invalid_contact");
  const details = normalizeContactName(projectDetails);
  const normalizedEmail = email ? normalizeContactEmail(email) : "";
  if (email && !normalizedEmail) throw new Error("invalid_email");
  if (!getContactProject(projectType) || details.length > 300 || (projectType === "other" && !details)) throw new Error("invalid_project");
  const projectLabel = contactProjectLabel(projectType);
  const relevantDetails = details;
  const whatsappMessage = buildContactMessage({ firstName: name, projectType, projectDetails: relevantDetails, lang, source: Capacitor.getPlatform() === "ios" ? "app" : "site" });
  const key = JSON.stringify([name.toLocaleLowerCase(), normalizedEmail, normalizedPhone, country, projectType, relevantDetails]);
  if (submissions.has(key)) return submissions.get(key);

  const save = (async () => {
    const context = getTrackingContext();
    const isIosApp = Capacitor.getPlatform() === "ios";
    const leadPayload = {
      ...context,
      full_name: name,
      phone: normalizedPhone,
      request_type: "whatsapp_contact",
      source: isIosApp ? "Application GaspardNZ iOS" : "Site GaspardNZ",
      channel: normalizedEmail ? "contact_form" : "whatsapp",
      message: relevantDetails && projectType !== "other" ? `${whatsappMessage}\nDétails du projet / créneau souhaité : ${relevantDetails}` : whatsappMessage,
      metadata: {
        entry_point: isIosApp ? "parler_a_gaspard_ios" : "parler_a_gaspard",
        country_code: country,
        calling_code: `+${getCountryCallingCode(country)}`,
        project_type: projectType,
        project_label: projectLabel,
        project_details: relevantDetails || null,
        appointment_requested: relevantDetails.startsWith("Créneau souhaité :"),
        acquisition_source: context.source || null,
        page_path: window.location.pathname,
        contact_notice_version: CONTACT_NOTICE_VERSION,
        contact_requested_at: new Date().toISOString(),
        whatsapp_message_status: "unknown",
      },
    };
    if (normalizedEmail) leadPayload.email = normalizedEmail;
    const result = await sendPublicEvent("lead", leadPayload);
    if (!result?.ok || !result?.id) throw new Error("contact_save_failed");
    const notificationSent = await notifyContact(result.id);
    return { ...result, notificationSent };
  })();
  submissions.set(key, save);
  try { return await save; } catch (error) { submissions.delete(key); throw error; }
}
