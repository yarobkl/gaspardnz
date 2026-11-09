// Le canal de contact (WhatsApp, booking, formulaire) n'est pas l'origine.
// On privilégie donc le champ source avant de consulter channel.
export function leadOrigin(lead = {}) {
  const source = String(lead.source || "").toLowerCase();
  const channel = String(lead.channel || "").toLowerCase();
  if (/ios|iphone|application|app_mobile|mobile_app|app-ios/.test(source)) return "app";
  if (/web|site|website/.test(source)) return "web";
  if (/ios|iphone|mobile_app|app-ios/.test(channel)) return "app";
  if (/web|website/.test(channel)) return "web";
  return "unknown";
}
