const EVENTS_KEY = "gnz_admin_events";
const VISITORS_KEY = "gnz_admin_visitors";
const SESSIONS_KEY = "gnz_admin_sessions";
const VISITOR_ID_KEY = "gnz_visitor_id";
const SESSION_ID_KEY = "gnz_session_id";

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

const getSessionId = () => {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return "session_anonymous";
  }
};

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobi)/i.test(ua);
  let device = "Desktop";
  if (isTablet) device = "Tablet";
  else if (isMobile) device = "Mobile";

  return {
    device,
    browser: getBrowserName(ua),
    os: getOSName(ua),
  };
};

const getBrowserName = (ua) => {
  if (ua.includes("Chrome") && !ua.includes("Chromium")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Opera")) return "Opera";
  return "Other";
};

const getOSName = (ua) => {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
};

const getCountryAndCity = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzMap = {
      "Europe/Paris": { country: "FR", city: "Paris" },
      "Europe/London": { country: "GB", city: "London" },
      "Europe/Berlin": { country: "DE", city: "Berlin" },
      "Europe/Madrid": { country: "ES", city: "Madrid" },
      "Europe/Brussels": { country: "BE", city: "Brussels" },
      "America/New_York": { country: "US", city: "New York" },
      "America/Los_Angeles": { country: "US", city: "Los Angeles" },
      "America/Toronto": { country: "CA", city: "Toronto" },
      "Asia/Tokyo": { country: "JP", city: "Tokyo" },
      "Asia/Shanghai": { country: "CN", city: "Shanghai" },
      "Asia/Singapore": { country: "SG", city: "Singapore" },
      "Australia/Sydney": { country: "AU", city: "Sydney" },
    };
    return tzMap[tz] || { country: "XX", city: "Unknown" };
  } catch {
    return { country: "XX", city: "Unknown" };
  }
};

export const trackPageView = () => {
  const { country, city } = getCountryAndCity();
  const event = {
    id: "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    type: "page_view",
    page: window.location.pathname,
    referrer: document.referrer || "direct",
    timestamp: new Date().toISOString(),
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    ...getDeviceInfo(),
    country,
    city,
  };

  recordEvent(event);
  updateVisitor(event);
  recordSessionView(event);
};

export const trackEvent = (type, label, metadata = {}) => {
  const { country, city } = getCountryAndCity();
  const event = {
    id: "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    type,
    label,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    ...getDeviceInfo(),
    country,
    city,
    metadata,
  };

  recordEvent(event);
  recordSessionEvent(event);
};

export const trackConversion = (type, details = {}) => {
  const { country, city } = getCountryAndCity();
  const event = {
    id: "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    type: "conversion",
    conversionType: type,
    page: window.location.pathname,
    timestamp: new Date().toISOString(),
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
    ...getDeviceInfo(),
    country,
    city,
    metadata: details,
  };

  recordEvent(event);
  updateVisitor({ ...event, status: "converted" });
  recordSessionConversion(event);
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

const recordSessionView = (event) => {
  try {
    const sessions = sessionStorage.getItem(SESSIONS_KEY);
    const sessionsList = sessions ? JSON.parse(sessions) : [];
    let session = sessionsList.find((s) => s.id === event.sessionId);

    if (!session) {
      session = {
        id: event.sessionId,
        visitorId: event.visitorId,
        startTime: event.timestamp,
        pages: [event.page],
        events: [{ type: "page_view", page: event.page, time: event.timestamp }],
      };
      sessionsList.push(session);
    } else {
      if (!session.pages.includes(event.page)) {
        session.pages.push(event.page);
      }
      session.events.push({ type: "page_view", page: event.page, time: event.timestamp });
    }

    sessionStorage.setItem(SESSIONS_KEY, JSON.stringify(sessionsList));
  } catch {}
};

const recordSessionEvent = (event) => {
  try {
    const sessions = sessionStorage.getItem(SESSIONS_KEY);
    const sessionsList = sessions ? JSON.parse(sessions) : [];
    let session = sessionsList.find((s) => s.id === event.sessionId);

    if (!session) {
      session = {
        id: event.sessionId,
        visitorId: event.visitorId,
        startTime: event.timestamp,
        pages: [event.page],
        events: [{ type: event.type, label: event.label, time: event.timestamp }],
      };
      sessionsList.push(session);
    } else {
      session.events.push({ type: event.type, label: event.label, time: event.timestamp });
    }

    sessionStorage.setItem(SESSIONS_KEY, JSON.stringify(sessionsList));
  } catch {}
};

const recordSessionConversion = (event) => {
  try {
    const sessions = sessionStorage.getItem(SESSIONS_KEY);
    const sessionsList = sessions ? JSON.parse(sessions) : [];
    let session = sessionsList.find((s) => s.id === event.sessionId);

    if (session) {
      session.converted = true;
      session.conversionType = event.conversionType;
    }

    sessionStorage.setItem(SESSIONS_KEY, JSON.stringify(sessionsList));
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
      city: event.city,
      pages: existingIndex >= 0 ? [...new Set([...visitorsList[existingIndex].pages, event.page])] : [event.page],
      pageCount: existingIndex >= 0 ? visitorsList[existingIndex].pageCount + 1 : 1,
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

export const getAnalyticsData = (dateRange = "all") => {
  try {
    const events = localStorage.getItem(EVENTS_KEY);
    const visitors = localStorage.getItem(VISITORS_KEY);
    const eventsList = events ? JSON.parse(events) : [];
    const visitorsList = visitors ? JSON.parse(visitors) : [];

    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const last180d = new Date(now - 180 * 24 * 60 * 60 * 1000);

    let filterDate = last24h;
    if (dateRange === "7d") filterDate = last7d;
    else if (dateRange === "30d") filterDate = last30d;
    else if (dateRange === "6m") filterDate = last180d;
    else if (dateRange === "all") filterDate = new Date(0);

    const filteredEvents = eventsList.filter((e) => new Date(e.timestamp) > filterDate);
    const filteredVisitors = visitorsList.filter((v) => new Date(v.lastSeen) > filterDate);

    const recentEvents = eventsList.filter((e) => new Date(e.timestamp) > last24h);
    const recentVisitors = visitorsList.filter((v) => new Date(v.lastSeen) > last24h);
    const totalConversions = filteredEvents.filter((e) => e.type === "conversion").length;
    const recentConversions = recentEvents.filter((e) => e.type === "conversion").length;

    // Calculate bounce rate
    const visitsWithPageView = filteredVisitors.filter((v) => v.pageCount >= 1).length;
    const bounceCount = filteredVisitors.filter((v) => v.pageCount === 1).length;
    const bounceRate = visitsWithPageView > 0 ? ((bounceCount / visitsWithPageView) * 100).toFixed(2) : 0;

    // Calculate average session duration
    const totalSessionDuration = filteredVisitors.reduce((sum, v) => {
      const firstSeen = new Date(v.firstSeen);
      const lastSeen = new Date(v.lastSeen);
      return sum + (lastSeen - firstSeen) / 1000; // in seconds
    }, 0);
    const avgSessionDuration = filteredVisitors.length > 0 ? (totalSessionDuration / filteredVisitors.length).toFixed(0) : 0;

    // Top pages
    const topPages = {};
    filteredEvents.filter((e) => e.type === "page_view").forEach((e) => {
      topPages[e.page] = (topPages[e.page] || 0) + 1;
    });

    // Top referrers
    const topReferrers = {};
    filteredEvents.filter((e) => e.referrer).forEach((e) => {
      topReferrers[e.referrer] = (topReferrers[e.referrer] || 0) + 1;
    });

    // Device stats
    const deviceStats = {};
    filteredVisitors.forEach((v) => {
      deviceStats[v.device] = (deviceStats[v.device] || 0) + 1;
    });

    // Browser stats
    const browserStats = {};
    filteredVisitors.forEach((v) => {
      browserStats[v.browser] = (browserStats[v.browser] || 0) + 1;
    });

    // Country/City stats
    const countryStats = {};
    const cityStats = {};
    filteredVisitors.forEach((v) => {
      countryStats[v.country] = (countryStats[v.country] || 0) + 1;
      const cityKey = `${v.city}, ${v.country}`;
      cityStats[cityKey] = (cityStats[cityKey] || 0) + 1;
    });

    // Visitors over time
    const visitorsOverTime = buildVisitorsOverTime(filteredEvents, dateRange);

    // Peak hours
    const peakHours = buildPeakHours(filteredEvents);

    // Day of week
    const dayOfWeek = buildDayOfWeekStats(filteredEvents);

    // Time on page
    const timeOnPage = calculateTimeOnPage(filteredVisitors);

    // User flow
    const userFlow = calculateUserFlow(filteredEvents);

    return {
      overview: {
        totalVisitors: visitorsList.length,
        visitorsToday: recentVisitors.length,
        totalPageViews: eventsList.filter((e) => e.type === "page_view").length,
        pageViewsToday: recentEvents.filter((e) => e.type === "page_view").length,
        bounceRate: parseFloat(bounceRate),
        avgSessionDuration: parseInt(avgSessionDuration),
        totalConversions,
        conversionsToday: recentConversions,
        conversionRate: filteredVisitors.length > 0 ? ((totalConversions / filteredVisitors.length) * 100).toFixed(2) : 0,
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
      browserStats,
      countryStats,
      cityStats,
      timeOnPage,
      userFlow,
      visitorsOverTime,
      peakHours,
      dayOfWeek,
      recentVisitors: filteredVisitors.slice(-20).reverse(),
      recentEvents: filteredEvents.slice(-50).reverse(),
    };
  } catch (e) {
    console.error("Analytics error:", e);
    return {
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
    };
  }
};

const buildVisitorsOverTime = (events, dateRange) => {
  const result = {};
  events.filter((e) => e.type === "page_view").forEach((e) => {
    const date = new Date(e.timestamp);
    let key;

    if (dateRange === "7d" || dateRange === "30d") {
      key = date.toISOString().split("T")[0];
    } else {
      key = `${date.getDate()}/${date.getMonth() + 1}`;
    }

    if (!result[key]) {
      result[key] = { visitors: new Set(), pageViews: 0 };
    }
    result[key].visitors.add(e.visitorId);
    result[key].pageViews += 1;
  });

  return Object.entries(result)
    .map(([date, data]) => ({
      date,
      visitors: data.visitors.size,
      pageViews: data.pageViews,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const buildPeakHours = (events) => {
  const result = {};
  for (let i = 0; i < 24; i++) {
    result[i] = 0;
  }

  events.forEach((e) => {
    const hour = new Date(e.timestamp).getHours();
    result[hour] += 1;
  });

  return result;
};

const buildDayOfWeekStats = (events) => {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const result = {};
  dayNames.forEach((day) => {
    result[day] = 0;
  });

  events.forEach((e) => {
    const dayIndex = new Date(e.timestamp).getDay();
    result[dayNames[dayIndex]] += 1;
  });

  return result;
};

const calculateTimeOnPage = (visitors) => {
  const result = {};
  visitors.forEach((v) => {
    v.pages.forEach((page) => {
      if (!result[page]) {
        result[page] = { totalTime: 0, count: 0 };
      }
      const firstSeen = new Date(v.firstSeen);
      const lastSeen = new Date(v.lastSeen);
      const duration = (lastSeen - firstSeen) / 1000 / (v.pages.length || 1);
      result[page].totalTime += duration;
      result[page].count += 1;
    });
  });

  return Object.entries(result)
    .map(([page, data]) => ({
      page,
      avgTime: (data.totalTime / data.count).toFixed(0),
    }))
    .sort((a, b) => parseInt(b.avgTime) - parseInt(a.avgTime))
    .slice(0, 10);
};

const calculateUserFlow = (events) => {
  const flows = {};
  let previousPage = null;

  events
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .forEach((e) => {
      if (previousPage && e.page !== previousPage) {
        const key = `${previousPage} → ${e.page}`;
        flows[key] = (flows[key] || 0) + 1;
      }
      previousPage = e.page;
    });

  return Object.entries(flows)
    .map(([flow, count]) => ({ flow, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const clearAnalytics = () => {
  try {
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(VISITORS_KEY);
    sessionStorage.removeItem(SESSIONS_KEY);
  } catch {}
};
