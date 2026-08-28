import { useEffect, useState } from "react";
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
  const brand = map.brand || {};
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
    formulaPrices,
    vipClients: vipClients.length ? vipClients : base.vipClients,
    weddingInspirations: weddingInspirations.length ? weddingInspirations : base.weddingInspirations,
  };
}

export const useSettings = () => {
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    let mounted = true;
    let refreshTimer = null;
    const refresh = async () => {
      try {
        const remote = await loadRemoteSettings(getSettings());
        if (!mounted) return;
        setSettings(remote);
        try {
          localStorage.setItem("gaspardnz_settings", JSON.stringify(remote));
          window.dispatchEvent(new CustomEvent("settingsUpdated", { detail: remote }));
        } catch {}
      } catch (error) {
        console.warn("Remote site settings unavailable, using fallback:", error?.message || error);
      }
    };

    refresh();
    const localUnsubscribe = subscribeToSettingsChanges((newSettings) => setSettings(newSettings));
    const channel = supabase
      .channel(`gnz-public-settings-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh, 80); })
      .on("postgres_changes", { event: "*", schema: "public", table: "packages" }, () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh, 80); })
      .on("postgres_changes", { event: "*", schema: "public", table: "vip_clients" }, () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh, 80); })
      .on("postgres_changes", { event: "*", schema: "public", table: "wedding_inspirations" }, () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(refresh, 80); })
      .subscribe();

    return () => {
      mounted = false;
      clearTimeout(refreshTimer);
      localUnsubscribe?.();
      supabase.removeChannel(channel);
    };
  }, []);

  return settings;
};
