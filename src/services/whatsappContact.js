import { sendPublicEvent } from "./supabaseClient.js";
import { getTrackingContext } from "./siteTracking.js";

export const CONTACT_NOTICE_VERSION = "2026-10-30";

export function normalizeContactPhone(value) {
  const raw = String(value || "").trim();
  if (!/^[+\d\s().-]+$/.test(raw)) return "";
  let phone = raw.replace(/[\s().-]/g, "");
  if (phone.startsWith("00")) phone = `+${phone.slice(2)}`;
  if (/^0[1-9]\d{8}$/.test(phone)) phone = `+33${phone.slice(1)}`;
  // International numbers must include their country code. No guessed
  // country code for an ambiguous number.
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : "";
}

export function normalizeContactName(value) {
  return String(value || "").replace(/[\u0000-\u001f\u007f]/g, "").trim().replace(/\s+/g, " ");
}

// Kept in memory only: no contact details in localStorage or analytics.
// Coalesces double submissions and reuses a successful save on reopening.
const submissions = new Map();

export async function submitWhatsappContact({ firstName, phone }) {
  const name = normalizeContactName(firstName);
  const normalizedPhone = normalizeContactPhone(phone);
  if (!name || name.length > 80 || !normalizedPhone) {
    throw new Error("invalid_contact");
  }
  const key = `${name.toLocaleLowerCase()}:${normalizedPhone}`;
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
      message: "Demande de contact depuis le bouton « Parler à Gaspard » du site.",
      metadata: {
        entry_point: "parler_a_gaspard",
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
    return result;
  })();
  submissions.set(key, save);
  try {
    return await save;
  } catch (error) {
    submissions.delete(key);
    throw error;
  }
}
