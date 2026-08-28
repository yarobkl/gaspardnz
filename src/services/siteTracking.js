import { sendPublicEvent } from "./supabaseClient.js";

const VISITOR_KEY = "gnz_vid_v2";
const SESSION_KEY = "gnz_sid_v2";
const SESSION_STARTED_KEY = "gnz_sid_started_v2";
const ATTRIBUTION_KEY = "gnz_attribution_v2";
const SESSION_TTL = 30 * 60 * 1000;

const safeStorage = (storage, method, ...args) => {
  try { return storage?.[method]?.(...args); } catch { return null; }
};
const ensureUuid = (value) => {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return re.test(value || "") ? value : crypto.randomUUID();
};
const deviceType = () => {
  const width = window.innerWidth || 1024;
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua) || (width >= 700 && width <= 1100)) return "tablet";
  if (/Mobi|iPhone|Android/i.test(ua) || width < 700) return "mobile";
  return "desktop";
};

function parseAttribution() {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const referrer = document.referrer || "";
  let inferredSource = "Direct";
  if (utmSource) inferredSource = utmSource;
  else if (referrer) {
    try {
      const host = new URL(referrer).hostname.toLowerCase();
      if (host.includes("google.")) inferredSource = "Google";
      else if (host.includes("instagram.")) inferredSource = "Instagram";
      else if (host.includes("facebook.") || host.includes("fb.")) inferredSource = "Facebook";
      else if (host.includes("tiktok.")) inferredSource = "TikTok";
      else if (host.includes("youtube.")) inferredSource = "YouTube";
      else if (!host.includes(window.location.hostname)) inferredSource = host.replace(/^www\./, "");
    } catch {}
  }
  return {
    source: inferredSource,
    medium: utmMedium || (utmSource ? "campaign" : referrer ? "referral" : "direct"),
    campaign: utmCampaign || null,
    referrer: referrer || null,
    landing_page: `${window.location.pathname}${window.location.search}`.slice(0, 500),
  };
}

function getAttribution() {
  const saved = safeStorage(localStorage, "getItem", ATTRIBUTION_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  const parsed = parseAttribution();
  safeStorage(localStorage, "setItem", ATTRIBUTION_KEY, JSON.stringify(parsed));
  return parsed;
}

function getVisitorId() {
  const existing = safeStorage(localStorage, "getItem", VISITOR_KEY);
  const id = ensureUuid(existing);
  if (existing !== id) safeStorage(localStorage, "setItem", VISITOR_KEY, id);
  return id;
}

function getSessionId() {
  const previousStarted = Number(safeStorage(sessionStorage, "getItem", SESSION_STARTED_KEY) || 0);
  const previousId = safeStorage(sessionStorage, "getItem", SESSION_KEY);
  if (previousId && previousStarted && Date.now() - previousStarted < SESSION_TTL) {
    safeStorage(sessionStorage, "setItem", SESSION_STARTED_KEY, String(Date.now()));
    return ensureUuid(previousId);
  }
  const id = crypto.randomUUID();
  safeStorage(sessionStorage, "setItem", SESSION_KEY, id);
  safeStorage(sessionStorage, "setItem", SESSION_STARTED_KEY, String(Date.now()));
  return id;
}

export function getTrackingContext() {
  if (typeof window === "undefined") return {};
  return {
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    ...getAttribution(),
    device_type: deviceType(),
  };
}

export async function trackSiteEvent(eventName, options = {}) {
  if (typeof window === "undefined") return;
  const consent = safeStorage(localStorage, "getItem", "gnz-cookies");
  if (options.essential !== true && consent !== "accepted") return;
  return sendPublicEvent("analytics_event", {
    ...getTrackingContext(),
    event_name: eventName,
    page_path: options.pagePath || window.location.pathname,
    entity_type: options.entityType || null,
    entity_id: options.entityId || null,
    metadata: options.metadata || {},
  });
}

export function trackPageViewToSupabase(path = window.location.pathname) {
  return trackSiteEvent("page_view", { pagePath: path });
}

export function initializeSupabaseTracking() {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/admin")) return () => {};
  let lastPath = `${window.location.pathname}${window.location.search}`;

  const clickHandler = (event) => {
    const target = event.target?.closest?.("a,button,[data-track]");
    if (!target) return;
    const explicit = target.getAttribute?.("data-track");
    const label = (target.getAttribute?.("aria-label") || target.textContent || "").trim().replace(/\s+/g, " ").slice(0, 120);
    const href = target.getAttribute?.("href") || "";
    let eventName = explicit;
    if (!eventName && /wa\.me|whatsapp/i.test(href)) eventName = "whatsapp_click";
    if (!eventName && /calendly/i.test(href)) eventName = "booking_click";
    if (!eventName && /réserver|reservation|rendez-vous|appointment/i.test(label)) eventName = "booking_click";
    if (!eventName && /formule|package/i.test(label)) eventName = "packages_click";
    if (!eventName && /promotion|offre|promo/i.test(label)) eventName = "promo_click";
    if (!eventName) return;
    trackSiteEvent(eventName, { metadata: { label: label || null, href: href ? href.slice(0, 300) : null } });
  };

  const routeCheck = () => {
    const next = `${window.location.pathname}${window.location.search}`;
    if (next !== lastPath) {
      lastPath = next;
      trackPageViewToSupabase(next);
    }
  };

  document.addEventListener("click", clickHandler, { capture: true, passive: true });
  window.addEventListener("popstate", routeCheck);
  const interval = window.setInterval(routeCheck, 2500);
  return () => {
    document.removeEventListener("click", clickHandler, { capture: true });
    window.removeEventListener("popstate", routeCheck);
    window.clearInterval(interval);
  };
}

if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin")) {
  queueMicrotask(() => {
    if (!window.__GNZ_SUPABASE_TRACKING_CLEANUP__) {
      window.__GNZ_SUPABASE_TRACKING_CLEANUP__ = initializeSupabaseTracking();
    }
  });
}
