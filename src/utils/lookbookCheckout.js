import { getWhatsappUrl } from "./whatsappUtil.js";

export const LOOKBOOK_PRICE_EUR = 5;
const STORAGE_KEY = "gnz_lookbook_stripe_url";

export const getLookbookCheckoutUrl = (stripePaymentUrl = "") => {
  if (stripePaymentUrl) return String(stripePaymentUrl).trim();
  const envUrl = import.meta.env.VITE_LOOKBOOK_STRIPE_URL;
  if (envUrl) return envUrl;
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
};

export const setLookbookCheckoutUrl = (url) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(url || "").trim());
};

export const openLookbookCheckout = (settingsOrWhatsapp = "33664826920") => {
  const settings = typeof settingsOrWhatsapp === "object" && settingsOrWhatsapp ? settingsOrWhatsapp : {};
  const whatsappNumber = settings.whatsappNumber || settingsOrWhatsapp || "33664826920";
  const checkoutUrl = getLookbookCheckoutUrl(settings.stripePaymentUrl);
  if (checkoutUrl) {
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    return { ready: true };
  }

  const message = `Bonjour Gaspard, je souhaite acheter le lookbook Gaspard NZ à ${LOOKBOOK_PRICE_EUR} €. Pouvez-vous m'envoyer le lien de paiement ?`;
  window.open(getWhatsappUrl(whatsappNumber, message), "_blank", "noopener,noreferrer");
  return { ready: false };
};
