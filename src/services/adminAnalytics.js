const EVENTS_KEY = "gnz_admin_events";
const VISITORS_KEY = "gnz_admin_visitors";
const VISITOR_ID_KEY = "gnz_visitor_id";

const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return "visitor_anonymous";
  }
};

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android/i.test(ua);
  return {
    device: isMobile ? "Mobile" : "Desktop",
    browser: getBrowserName(ua),
    os: getOSName(ua),
  };
};

const getBrowserName = (ua) => {
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edge")) return "Edge";
  return "Autre";
};

const getOSName = (ua) => {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Autre";
};

const getCountryFromTimezone = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzMap = {
      "Europe/Paris": "FR",
      "Europe/London": "GB",
      "Europe/Berlin": "DE",
      "Europe/Madrid": "ES",
      "Europe/Brussels": "BE",
      "America/New_York": "US",
      "America/Los_Angeles": "US",
      "America/Toronto": "CA",
      "Asia/Tokyo": "JP",
      "Asia/Shanghai": "CN",
      "Asia/Singapore": "SG",
    };
    return tzMap[tz] || "XX";
  } catch {
    return "XX";
  }
};

export const trackPageView = () => {
  const event = {
    id: "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    type: "page_view",
    page: window.location.pathname,
    referrer: document.referrer || "direct",
    timestamp: new Date().toISOString(),
    visitorId: getVisitorId(),
    ...getDeviceInfo(),
    country: getCountryFromTimezone(),
  };

  recordEvent(event);
  updateVisitor(event);
};

export const trackEvent = (type, label, metadata = {}) => {
  const event = {
    id: "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    type,
    label,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
    visitorId: getVisitorId(),
    ...getDeviceInfo(),
    metadata,
  };

  recordEvent(event);
};

export const trackConversion = (type, details = {}) => {
  const event = {
    id: "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    type: "conversion",
    conversionType: type,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
    visitorId: getVisitorId(),
    ...getDeviceInfo(),
    metadata: details,
  };

  recordEvent(event);
  updateVisitor({ ...event, status: "converted" });
};

const recordEvent = (event) => {
  try {
    const events = localStorage.getItem(EVENTS_KEY);
    const eventsList = events ? JSON.parse(events) : [];
    eventsList.push(event);
    const maxEvents = 10000;
    if (eventsList.length > maxEvents) {
      eventsList.splice(0, eventsList.length - maxEvents);
    }
    localStorage.setItem(EVENTS_KEY, JSON.stringify(eventsList));
  } catch {}
};

const updateVisitor = (event) => {
  try {
    const visitors = localStorage.getItem(VISITORS_KEY);
    const visitorsList = visitors ? JSON.parse(visitors) : [];
    const existingIndex = visitorsList.findIndex((v) => v.id === event.visitorId);

    const visitorData = {
      id: event.visitorId,
      firstSeen: existingIndex >= 0 ? visitorsList[existingIndex].firstSeen : new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      device: event.device,
      browser: event.browser,
      os: event.os,
      country: event.country,
      pages: existingIndex >= 0 ? [...new Set([...visitorsList[existingIndex].pages, event.page])] : [event.page],
      eventCount: existingIndex >= 0 ? visitorsList[existingIndex].eventCount + 1 : 1,
      status: event.status || (existingIndex >= 0 ? visitorsList[existingIndex].status : "visitor"),
    };

    if (existingIndex >= 0) {
      visitorsList[existingIndex] = visitorData;
    } else {
      visitorsList.push(visitorData);
    }

    const maxVisitors = 50000;
    if (visitorsList.length > maxVisitors) {
      visitorsList.splice(0, visitorsList.length - maxVisitors);
    }
    localStorage.setItem(VISITORS_KEY, JSON.stringify(visitorsList));
  } catch {}
};

export const getAnalyticsData = () => {
  try {
    const events = localStorage.getItem(EVENTS_KEY);
    const visitors = localStorage.getItem(VISITORS_KEY);
    const eventsList = events ? JSON.parse(events) : [];
    const visitorsList = visitors ? JSON.parse(visitors) : [];

    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const recentEvents = eventsList.filter((e) => new Date(e.timestamp) > last24h);
    const recentVisitors = visitorsList.filter((v) => new Date(v.lastSeen) > last24h);
    const totalConversions = eventsList.filter((e) => e.type === "conversion").length;
    const recentConversions = recentEvents.filter((e) => e.type === "conversion").length;

    const topPages = {};
    eventsList.forEach((e) => {
      topPages[e.page] = (topPages[e.page] || 0) + 1;
    });

    const topReferrers = {};
    eventsList.filter((e) => e.referrer).forEach((e) => {
      topReferrers[e.referrer] = (topReferrers[e.referrer] || 0) + 1;
    });

    const deviceStats = {};
    visitorsList.forEach((v) => {
      deviceStats[v.device] = (deviceStats[v.device] || 0) + 1;
    });

    const countryStats = {};
    visitorsList.forEach((v) => {
      countryStats[v.country] = (countryStats[v.country] || 0) + 1;
    });

    return {
      overview: {
        totalVisitors: visitorsList.length,
        visitorsToday: recentVisitors.length,
        totalEvents: eventsList.length,
        eventsToday: recentEvents.length,
        totalConversions,
        conversionsToday: recentConversions,
        conversionRate: visitorsList.length > 0 ? ((totalConversions / visitorsList.length) * 100).toFixed(2) : 0,
      },
      topPages: Object.entries(topPages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([page, count]) => ({ page, count })),
      topReferrers: Object.entries(topReferrers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([referrer, count]) => ({ referrer, count })),
      deviceStats,
      countryStats,
      recentVisitors: recentVisitors.slice(-20).reverse(),
      recentEvents: recentEvents.slice(-50).reverse(),
    };
  } catch (e) {
    console.error("Analytics error:", e);
    return { overview: {}, topPages: [], topReferrers: [], deviceStats: {}, countryStats: {}, recentVisitors: [], recentEvents: [] };
  }
};

export const clearAnalytics = () => {
  try {
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(VISITORS_KEY);
  } catch {}
};
