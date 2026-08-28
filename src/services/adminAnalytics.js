import { getTrackingContext, trackSiteEvent } from "./siteTracking.js";

const LEGACY_KEYS = ["gnz_admin_events", "gnz_admin_visitors", "gnz_admin_sessions"];

export const trackPageView = (pagePath = window.location.pathname) => {
  return trackSiteEvent("page_view", { pagePath });
};

export const trackEvent = (type, labelOrMetadata = null, metadata = {}) => {
  const merged = labelOrMetadata && typeof labelOrMetadata === "object"
    ? labelOrMetadata
    : { ...(metadata || {}), ...(labelOrMetadata ? { label: String(labelOrMetadata) } : {}) };
  return trackSiteEvent(String(type || "event"), {
    pagePath: typeof window !== "undefined" ? window.location.pathname : "/",
    metadata: merged,
  });
};

export const trackConversion = (type, details = {}) => {
  return trackSiteEvent("conversion", {
    pagePath: typeof window !== "undefined" ? window.location.pathname : "/",
    entityType: "conversion",
    entityId: String(type || "unknown"),
    metadata: { conversion_type: type, ...details },
  });
};

export const getAnalyticsData = () => ({
  overview: {},
  topPages: [],
  topReferrers: [],
  deviceStats: {},
  browserStats: {},
  countryStats: {},
  cityStats: {},
  timeOnPage: {},
  userFlow: [],
  visitorsOverTime: [],
  peakHours: {},
  dayOfWeek: {},
  recentVisitors: [],
  recentEvents: [],
  source: "supabase",
});

export const clearAnalytics = () => {
  try { LEGACY_KEYS.forEach((key) => localStorage.removeItem(key)); return true; }
  catch { return false; }
};

export const getCurrentTrackingContext = () => getTrackingContext();
