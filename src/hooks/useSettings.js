import { useSyncExternalStore } from "react";
import { getSettings, subscribeToSettingsChanges } from "../services/settingsService.js";
import { supabase } from "../services/supabaseClient.js";

const normalizeWhatsapp = (value, fallback) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `+${digits}` : fallback;
};

const packageKey = (row) => {
  const legacy = row?.metadata?.legacy_key;
  if (legacy) return legacy;
  if (row?.slug === "prestige") return "formule1";
  if (row?.slug === "gnz-signature") return "formule2";
  if (row?.slug === "sur-mesure") return "formule3";
  return null;
};

async function loadRemoteSettings(base) {
  const [settingsRes, packagesRes, vipRes, weddingRes] = await Promise.all([
    supabase.from("site_settings").select("key,value").eq("is_public", true),
    supabase.from("packages").select("slug,price,metadata,published").eq("published", true).order("sort_order"),
    supabase.from("vip_clients").select("name,city,event_label,photo_url,album,sort_order").eq("published", true).order("sort_order"),
    supabase.from("wedding_inspirations").select("title,description,color_label,style_label,occasion_label,cover_url,album,sort_order").eq("published", true).order("sort_order"),
  ]);
  const firstError = [settingsRes, packagesRes, vipRes, weddingRes].find((r) => r.error)?.error;
  if (firstError) throw firstError;

  const map = Object.fromEntries((settingsRes.data || []).map((row) => [row.key, row.value || {}]));
  const contact = map.contact || {};
  const social = map.social_links || {};
  const payment = map.payment || {};
  const brand = map.brand || {};
  const lookbook = map.lookbook || {};
  const formulaPrices = { ...(base.formulaPrices || {}) };
  for (const row of packagesRes.data || []) {
    const key = packageKey(row);
    if (key && row.price !== null && row.price !== undefined) formulaPrices[key] = Number(row.price);
  }

  const vipClients = (vipRes.data || []).map((row) => ({
    name: row.name,
    city: row.city || "",
    event: row.event_label || "",
    photo: row.photo_url || "",
    album: Array.isArray(row.album) ? row.album : [],
  }));
  const weddingInspirations = (weddingRes.data || []).map((row) => ({
    title: row.title,
    desc: row.description || "",
    color: row.color_label || "",
    style: row.style_label || "",
    occasion: row.occasion_label || "",
    src: row.cover_url || row.album?.[0]?.src || "",
    album: Array.isArray(row.album) ? row.album : [],
  }));

  return {
    ...base,
    siteTitle: brand.name || base.siteTitle,
    maisonAddress: brand.city ? `${brand.city}, France` : base.maisonAddress,
    whatsappNumber: normalizeWhatsapp(contact.whatsapp, base.whatsappNumber),
    calendlyUrl: contact.calendly || base.calendlyUrl,
    contactEmail: contact.email || base.contactEmail,
    instagramUrl: social.instagram || base.instagramUrl,
    tiktokUrl: social.tiktok || base.tiktokUrl,
    facebookUrl: social.facebook || base.facebookUrl,
    youtubeUrl: social.youtube || base.youtubeUrl,
    // Groupe communautaire, pas le numéro de contact 1:1 (déjà utilisé
    // ailleurs) : un lien discret différent de tout ce qui existe déjà.
    whatsappCommunityUrl: social.whatsapp_community || base.whatsappCommunityUrl || "",
    loginBackgroundUrl: brand.login_background_url || base.loginBackgroundUrl || "",
    stripePaymentUrl: payment.stripe_payment_url || base.stripePaymentUrl || "",
    paymentLabel: payment.payment_label || base.paymentLabel || "Payer le lookbook",
    // Bascule manuelle, indépendante du lien Stripe : Gaspard peut retirer le
    // bouton de vente sans effacer le lien enregistré.
    lookbookHidden: Boolean(payment.lookbook_hidden),
    lookbookHiddenMessage: payment.lookbook_hidden_message || base.lookbookHiddenMessage || "",
    lookbookPdfUrl: lookbook.pdf_url || base.lookbookPdfUrl || "",
    lookbookFilename: lookbook.pdf_filename || base.lookbookFilename || "",
    formulaPrices,
    // Un vrai résultat Supabase vide (plus rien de publié) doit rester vide :
    // retomber sur `base` ici resterait bloqué sur les VIP/inspirations mis en
    // cache AVANT qu'ils soient masqués — même bug que celui déjà corrigé
    // dans usePublicCollection(), ici garanti à chaque fois que le dernier
    // élément publié est masqué, pas seulement lors d'une vraie panne (une
    // vraie panne fait déjà échouer toute la fonction plus haut, gérée par
    // le try/catch de l'appelant).
    vipClients,
    weddingInspirations,
  };
}

// Environ une douzaine de composants publics appellent useSettings()
// indépendamment (nav, footer, sections...). Sans magasin partagé, chacun
// relançait son propre fetch Supabase et ouvrait son propre canal realtime
// au montage — jusqu'à ~45 requêtes et ~20 canaux redondants par page. Un
// seul magasin module-level, partagé via useSyncExternalStore, ne fait le
// travail qu'une fois : le premier composant qui monte l'amorce, le dernier
// qui démonte le referme.
let currentSettings = getSettings();
const listeners = new Set();
let subscriberCount = 0;
let refreshTimer = null;
let localUnsubscribe = null;
let channel = null;

const notify = (next) => {
  currentSettings = next;
  listeners.forEach((listener) => listener());
};

const refresh = async () => {
  try {
    const remote = await loadRemoteSettings(getSettings());
    notify(remote);
    try {
      localStorage.setItem("gaspardnz_settings", JSON.stringify(remote));
      window.dispatchEvent(new CustomEvent("settingsUpdated", { detail: remote }));
    } catch {}
  } catch (error) {
    console.warn("Remote site settings unavailable, using fallback:", error?.message || error);
  }
};

const scheduleRefresh = () => {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(refresh, 80);
};

const startSubscription = () => {
  refresh();
  localUnsubscribe = subscribeToSettingsChanges((newSettings) => notify(newSettings));
  channel = supabase
    // Un simple suffixe pour distinguer les canaux, pas un identifiant :
    // crypto.randomUUID() n'existe pas avant Safari 15.4 et faisait
    // planter cet effet sur les iPhone plus anciens. Même solution déjà
    // utilisée par usePublicCollection.js pour le même besoin.
    .channel(`gnz-public-settings-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, scheduleRefresh)
    .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, scheduleRefresh)
    .on("postgres_changes", { event: "*", schema: "public", table: "vip_clients" }, scheduleRefresh)
    .on("postgres_changes", { event: "*", schema: "public", table: "wedding_inspirations" }, scheduleRefresh)
    .subscribe();
};

const stopSubscription = () => {
  clearTimeout(refreshTimer);
  localUnsubscribe?.();
  localUnsubscribe = null;
  if (channel) { supabase.removeChannel(channel); channel = null; }
};

const subscribe = (listener) => {
  listeners.add(listener);
  subscriberCount += 1;
  if (subscriberCount === 1) startSubscription();
  return () => {
    listeners.delete(listener);
    subscriberCount -= 1;
    if (subscriberCount === 0) stopSubscription();
  };
};

const getSnapshot = () => currentSettings;

export const useSettings = () => useSyncExternalStore(subscribe, getSnapshot);
