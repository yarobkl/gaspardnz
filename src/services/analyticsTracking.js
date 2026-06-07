/**
 * Comprehensive Click and Behavior Tracking System
 * Captures clicks, page views, scroll depth, form interactions, video plays,
 * device/geo data, and generates heatmap/behavior analytics
 */

const TRACKING_CONFIG = {
  clicksKey: "gnz_clicks_tracking",
  behaviorKey: "gnz_behavior_tracking",
  sessionsKey: "gnz_sessions_tracking",
  sessionIdKey: "gnz_session_id",
  sessionStartKey: "gnz_session_start",
  heatmapKey: "gnz_heatmap_data",
  scrollDepthKey: "gnz_scroll_depth",
  maxClicks: 2000, // Reduced from 5000
  maxBehavior: 2000, // Reduced from 5000
  maxHeatmapPoints: 5000, // Reduced from 10000
  maxDataAgeDays: 30, // Auto-cleanup data older than 30 days
  debounceScroll: 500,
  debounceResize: 500,
};

// ============================================================================
// STORAGE CLEANUP & MONITORING
// ============================================================================

export const cleanupTrackingData = () => {
  try {
    const now = Date.now();
    const maxAgeMs = TRACKING_CONFIG.maxDataAgeDays * 24 * 60 * 60 * 1000;

    // Clean up old clicks
    const clicks = JSON.parse(localStorage.getItem(TRACKING_CONFIG.clicksKey) || "[]");
    const cleanedClicks = clicks
      .filter(item => (now - new Date(item.timestamp).getTime()) < maxAgeMs)
      .slice(0, TRACKING_CONFIG.maxClicks);
    localStorage.setItem(TRACKING_CONFIG.clicksKey, JSON.stringify(cleanedClicks));

    // Clean up old behavior
    const behavior = JSON.parse(localStorage.getItem(TRACKING_CONFIG.behaviorKey) || "[]");
    const cleanedBehavior = behavior
      .filter(item => (now - new Date(item.timestamp).getTime()) < maxAgeMs)
      .slice(0, TRACKING_CONFIG.maxBehavior);
    localStorage.setItem(TRACKING_CONFIG.behaviorKey, JSON.stringify(cleanedBehavior));

    // Check total storage size
    const totalSize = Object.keys(localStorage)
      .filter(k => k.startsWith("gnz_"))
      .reduce((sum, k) => sum + (localStorage.getItem(k) || "").length, 0);

    if (totalSize > 3000000) { // 3MB threshold
      console.warn(`⚠️ Tracking storage warning: ${(totalSize / 1024 / 1024).toFixed(2)}MB used`);
      // Aggressive cleanup: keep only 50% of data
      if (cleanedClicks.length > 0) {
        localStorage.setItem(TRACKING_CONFIG.clicksKey, JSON.stringify(cleanedClicks.slice(0, Math.floor(cleanedClicks.length / 2))));
      }
      if (cleanedBehavior.length > 0) {
        localStorage.setItem(TRACKING_CONFIG.behaviorKey, JSON.stringify(cleanedBehavior.slice(0, Math.floor(cleanedBehavior.length / 2))));
      }
    }
  } catch (error) {
    console.error("Error during tracking data cleanup:", error);
  }
};

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

const generateSessionId = () => {
  return "sess_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 12);
};

const getSessionId = () => {
  try {
    let sessionId = sessionStorage.getItem(TRACKING_CONFIG.sessionIdKey);
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(TRACKING_CONFIG.sessionIdKey, sessionId);
      sessionStorage.setItem(TRACKING_CONFIG.sessionStartKey, new Date().toISOString());
    }
    return sessionId;
  } catch {
    return "session_unknown";
  }
};

export const getSessionDuration = () => {
  try {
    const startTime = sessionStorage.getItem(TRACKING_CONFIG.sessionStartKey);
    if (!startTime) return 0;
    return Math.round((Date.now() - new Date(startTime).getTime()) / 1000);
  } catch {
    return 0;
  }
};

// ============================================================================
// DEVICE & GEO DATA
// ============================================================================

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isMobile = /Mobi|Android/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobi)/i.test(ua);

  return {
    deviceType: isTablet ? "tablet" : isMobile ? "mobile" : "desktop",
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    browserName: getBrowserName(ua),
    osName: getOSName(ua),
    userAgent: ua.substring(0, 100),
  };
};

const getBrowserName = (ua) => {
  if (ua.includes("Chrome") && !ua.includes("Chromium")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
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
      "America/Toronto": "CA",
      "America/Mexico_City": "MX",
      "America/Buenos_Aires": "AR",
      "Asia/Tokyo": "JP",
      "Asia/Shanghai": "CN",
      "Asia/Singapore": "SG",
      "Asia/Dubai": "AE",
      "Asia/Bangkok": "TH",
      "Australia/Sydney": "AU",
      "Europe/Amsterdam": "NL",
      "Europe/Rome": "IT",
    };
    return tzMap[tz] || "XX";
  } catch {
    return "XX";
  }
};

export const getGeoData = () => {
  return {
    country: getCountryFromTimezone(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
    timestamp: new Date().toISOString(),
  };
};

// ============================================================================
// CLICK TRACKING
// ============================================================================

export const trackClick = (event) => {
  try {
    const clickData = {
      id: "click_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      x: event.clientX,
      y: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      element: {
        tag: event.target.tagName,
        id: event.target.id || null,
        className: event.target.className || null,
        text: event.target.textContent?.substring(0, 100) || null,
        ariaLabel: event.target.getAttribute("aria-label"),
      },
      page: window.location.pathname,
      section: getSectionFromElement(event.target),
      ...getDeviceInfo(),
      ...getGeoData(),
    };

    recordClickData(clickData);
    updateHeatmapData(event.clientX, event.clientY);
  } catch (error) {
    console.error("Click tracking error:", error);
  }
};

const getSectionFromElement = (el) => {
  let current = el;
  while (current && current.tagName !== "BODY") {
    if (current.getAttribute("data-section")) {
      return current.getAttribute("data-section");
    }
    if (current.id && current.id.includes("section")) {
      return current.id;
    }
    current = current.parentElement;
  }
  return "unknown";
};

const recordClickData = (clickData) => {
  try {
    const clicks = localStorage.getItem(TRACKING_CONFIG.clicksKey);
    const clicksList = clicks ? JSON.parse(clicks) : [];
    clicksList.push(clickData);

    if (clicksList.length > TRACKING_CONFIG.maxClicks) {
      clicksList.splice(0, clicksList.length - TRACKING_CONFIG.maxClicks);
    }
    localStorage.setItem(TRACKING_CONFIG.clicksKey, JSON.stringify(clicksList));
  } catch (error) {
    console.error("Failed to record click data:", error);
  }
};

// ============================================================================
// HEATMAP DATA
// ============================================================================

const updateHeatmapData = (x, y) => {
  try {
    const heatmap = localStorage.getItem(TRACKING_CONFIG.heatmapKey);
    const heatmapList = heatmap ? JSON.parse(heatmap) : [];

    const point = {
      id: "heat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      x,
      y,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    heatmapList.push(point);

    if (heatmapList.length > TRACKING_CONFIG.maxHeatmapPoints) {
      heatmapList.splice(0, heatmapList.length - TRACKING_CONFIG.maxHeatmapPoints);
    }
    localStorage.setItem(TRACKING_CONFIG.heatmapKey, JSON.stringify(heatmapList));
  } catch (error) {
    console.error("Failed to update heatmap:", error);
  }
};

export const getHeatmapData = (pageFilter = null) => {
  try {
    const heatmap = localStorage.getItem(TRACKING_CONFIG.heatmapKey);
    const heatmapList = heatmap ? JSON.parse(heatmap) : [];

    let filtered = heatmapList;
    if (pageFilter) {
      filtered = heatmapList.filter((p) => p.page === pageFilter);
    }

    const gridSize = 50;
    const grid = {};

    filtered.forEach((point) => {
      const gridX = Math.floor(point.x / gridSize);
      const gridY = Math.floor(point.y / gridSize);
      const key = `${gridX},${gridY}`;
      grid[key] = (grid[key] || 0) + 1;
    });

    return {
      rawPoints: filtered,
      heatGrid: grid,
      totalClicks: filtered.length,
      gridSize,
    };
  } catch (error) {
    console.error("Failed to get heatmap data:", error);
    return { rawPoints: [], heatGrid: {}, totalClicks: 0 };
  }
};

// ============================================================================
// SCROLL TRACKING
// ============================================================================

let scrollTrackingTimeout = null;
const scrollDepthPerPage = {};

export const initScrollTracking = () => {
  const trackScroll = () => {
    if (scrollTrackingTimeout) clearTimeout(scrollTrackingTimeout);

    scrollTrackingTimeout = setTimeout(() => {
      const page = window.location.pathname;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const scrollDepth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;

      scrollDepthPerPage[page] = Math.max(scrollDepthPerPage[page] || 0, scrollDepth);

      recordBehaviorEvent({
        type: "scroll",
        scrollDepth,
        page,
        scrollPosition: scrollTop,
      });
    }, TRACKING_CONFIG.debounceScroll);
  };

  window.addEventListener("scroll", trackScroll, { passive: true });
  return () => window.removeEventListener("scroll", trackScroll);
};

// ============================================================================
// FORM INTERACTIONS
// ============================================================================

export const initFormTracking = () => {
  const handleFormEvent = (event) => {
    const form = event.target.closest("form");
    if (!form) return;

    const eventType = event.type === "focus" ? "form_focus" : event.type === "blur" ? "form_blur" : "form_input";

    recordBehaviorEvent({
      type: eventType,
      formName: form.name || form.id || "unnamed",
      fieldName: event.target.name,
      fieldType: event.target.type,
      page: window.location.pathname,
    });
  };

  document.addEventListener("focus", handleFormEvent, { capture: true, passive: true });
  document.addEventListener("blur", handleFormEvent, { capture: true, passive: true });
  document.addEventListener("input", handleFormEvent, { capture: true, passive: true });

  return () => {
    document.removeEventListener("focus", handleFormEvent);
    document.removeEventListener("blur", handleFormEvent);
    document.removeEventListener("input", handleFormEvent);
  };
};

export const trackFormSubmit = (formElement, metadata = {}) => {
  try {
    recordBehaviorEvent({
      type: "form_submit",
      formName: formElement.name || formElement.id || "unnamed",
      page: window.location.pathname,
      metadata,
    });
  } catch (error) {
    console.error("Form submit tracking error:", error);
  }
};

// ============================================================================
// VIDEO TRACKING
// ============================================================================

export const trackVideoPlay = (videoElement, metadata = {}) => {
  try {
    recordBehaviorEvent({
      type: "video_play",
      videoSrc: videoElement.src || "unknown",
      videoTitle: videoElement.title || metadata.title || "unknown",
      page: window.location.pathname,
      metadata,
    });
  } catch (error) {
    console.error("Video play tracking error:", error);
  }
};

export const trackVideoPause = (videoElement, metadata = {}) => {
  try {
    recordBehaviorEvent({
      type: "video_pause",
      videoSrc: videoElement.src || "unknown",
      currentTime: videoElement.currentTime || 0,
      duration: videoElement.duration || 0,
      page: window.location.pathname,
      metadata,
    });
  } catch (error) {
    console.error("Video pause tracking error:", error);
  }
};

export const initVideoTracking = (videoElement, metadata = {}) => {
  if (!videoElement) return () => {};

  const handlePlay = () => trackVideoPlay(videoElement, metadata);
  const handlePause = () => trackVideoPause(videoElement, metadata);

  videoElement.addEventListener("play", handlePlay);
  videoElement.addEventListener("pause", handlePause);

  return () => {
    videoElement.removeEventListener("play", handlePlay);
    videoElement.removeEventListener("pause", handlePause);
  };
};

// ============================================================================
// BEHAVIOR EVENTS
// ============================================================================

const recordBehaviorEvent = (event) => {
  try {
    const behaviorEvent = {
      id: "behavior_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      ...event,
      ...getDeviceInfo(),
      ...getGeoData(),
    };

    const behavior = localStorage.getItem(TRACKING_CONFIG.behaviorKey);
    const behaviorList = behavior ? JSON.parse(behavior) : [];
    behaviorList.push(behaviorEvent);

    if (behaviorList.length > TRACKING_CONFIG.maxBehavior) {
      behaviorList.splice(0, behaviorList.length - TRACKING_CONFIG.maxBehavior);
    }
    localStorage.setItem(TRACKING_CONFIG.behaviorKey, JSON.stringify(behaviorList));
  } catch (error) {
    console.error("Failed to record behavior event:", error);
  }
};

export const trackExit = () => {
  try {
    recordBehaviorEvent({
      type: "page_exit",
      page: window.location.pathname,
      timeOnPage: getSessionDuration(),
    });
  } catch (error) {
    console.error("Exit tracking error:", error);
  }
};

// ============================================================================
// PAGE VIEW TRACKING
// ============================================================================

export const trackPageView = (pagePath) => {
  try {
    recordBehaviorEvent({
      type: "page_view",
      page: pagePath,
      referrer: document.referrer || "direct",
    });
  } catch (error) {
    console.error("Page view tracking error:", error);
  }
};

// ============================================================================
// ANALYTICS INITIALIZATION
// ============================================================================

let isTrackingInitialized = false;

export const initializeTracking = () => {
  if (isTrackingInitialized) return;
  isTrackingInitialized = true;

  try {
    getSessionId();

    // Run cleanup once on startup and every 12 hours
    cleanupTrackingData();
    const cleanupInterval = setInterval(cleanupTrackingData, 12 * 60 * 60 * 1000);

    document.addEventListener("click", trackClick, { passive: true });

    const scrollCleanup = initScrollTracking();
    const formCleanup = initFormTracking();

    window.addEventListener("beforeunload", trackExit);

    return () => {
      document.removeEventListener("click", trackClick);
      clearInterval(cleanupInterval);
      scrollCleanup();
      formCleanup();
      window.removeEventListener("beforeunload", trackExit);
    };
  } catch (error) {
    console.error("Failed to initialize tracking:", error);
  }
};

// ============================================================================
// DATA EXPORT & ANALYTICS
// ============================================================================

export const getClicksData = () => {
  try {
    const clicks = localStorage.getItem(TRACKING_CONFIG.clicksKey);
    return clicks ? JSON.parse(clicks) : [];
  } catch {
    return [];
  }
};

export const getScrollDepthStats = () => {
  try {
    const behavior = localStorage.getItem(TRACKING_CONFIG.behaviorKey);
    const behaviorList = behavior ? JSON.parse(behavior) : [];
    const scrollEvents = behaviorList.filter((e) => e.type === "scroll");

    const depthByPage = {};
    scrollEvents.forEach((event) => {
      if (!depthByPage[event.page]) {
        depthByPage[event.page] = {
          maxDepth: 0,
          avgDepth: 0,
          totalEvents: 0,
          depths: [],
        };
      }
      depthByPage[event.page].depths.push(event.scrollDepth);
      depthByPage[event.page].maxDepth = Math.max(depthByPage[event.page].maxDepth, event.scrollDepth);
      depthByPage[event.page].totalEvents++;
    });

    Object.keys(depthByPage).forEach((page) => {
      const depths = depthByPage[page].depths;
      depthByPage[page].avgDepth = Math.round(depths.reduce((a, b) => a + b, 0) / depths.length);
    });

    return depthByPage;
  } catch {
    return {};
  }
};

export const getFormInteractionStats = () => {
  try {
    const behavior = localStorage.getItem(TRACKING_CONFIG.behaviorKey);
    const behaviorList = behavior ? JSON.parse(behavior) : [];
    const formEvents = behaviorList.filter(
      (e) => e.type === "form_focus" || e.type === "form_blur" || e.type === "form_input" || e.type === "form_submit"
    );

    const statsByForm = {};
    formEvents.forEach((event) => {
      if (!statsByForm[event.formName]) {
        statsByForm[event.formName] = {
          focuses: 0,
          blurs: 0,
          inputs: 0,
          submits: 0,
          fields: {},
        };
      }

      if (event.type === "form_focus") statsByForm[event.formName].focuses++;
      if (event.type === "form_blur") statsByForm[event.formName].blurs++;
      if (event.type === "form_input") statsByForm[event.formName].inputs++;
      if (event.type === "form_submit") statsByForm[event.formName].submits++;

      if (event.fieldName) {
        if (!statsByForm[event.formName].fields[event.fieldName]) {
          statsByForm[event.formName].fields[event.fieldName] = {
            type: event.fieldType,
            interactions: 0,
          };
        }
        statsByForm[event.formName].fields[event.fieldName].interactions++;
      }
    });

    return statsByForm;
  } catch {
    return {};
  }
};

export const getVideoStats = () => {
  try {
    const behavior = localStorage.getItem(TRACKING_CONFIG.behaviorKey);
    const behaviorList = behavior ? JSON.parse(behavior) : [];
    const videoEvents = behaviorList.filter((e) => e.type === "video_play" || e.type === "video_pause");

    const statsByVideo = {};
    videoEvents.forEach((event) => {
      const key = event.videoSrc || event.videoTitle;
      if (!statsByVideo[key]) {
        statsByVideo[key] = {
          plays: 0,
          pauses: 0,
          lastPlayTime: null,
        };
      }
      if (event.type === "video_play") {
        statsByVideo[key].plays++;
        statsByVideo[key].lastPlayTime = event.timestamp;
      }
      if (event.type === "video_pause") statsByVideo[key].pauses++;
    });

    return statsByVideo;
  } catch {
    return {};
  }
};

export const getSessionStats = () => {
  try {
    const behavior = localStorage.getItem(TRACKING_CONFIG.behaviorKey);
    const behaviorList = behavior ? JSON.parse(behavior) : [];

    const sessionMap = {};
    behaviorList.forEach((event) => {
      if (!sessionMap[event.sessionId]) {
        sessionMap[event.sessionId] = {
          sessionId: event.sessionId,
          startTime: event.timestamp,
          endTime: event.timestamp,
          eventCount: 0,
          pageViews: new Set(),
          events: [],
        };
      }
      sessionMap[event.sessionId].endTime = event.timestamp;
      sessionMap[event.sessionId].eventCount++;
      sessionMap[event.sessionId].pageViews.add(event.page);
      sessionMap[event.sessionId].events.push(event.type);
    });

    return Object.values(sessionMap).map((session) => ({
      sessionId: session.sessionId,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000),
      eventCount: session.eventCount,
      pageCount: session.pageViews.size,
      pages: Array.from(session.pageViews),
      eventTypes: [...new Set(session.events)],
    }));
  } catch {
    return [];
  }
};

export const getComprehensiveAnalytics = () => {
  try {
    const clicks = getClicksData();
    const heatmap = getHeatmapData();
    const scrollDepth = getScrollDepthStats();
    const formStats = getFormInteractionStats();
    const videoStats = getVideoStats();
    const sessions = getSessionStats();

    const behavior = localStorage.getItem(TRACKING_CONFIG.behaviorKey);
    const behaviorList = behavior ? JSON.parse(behavior) : [];

    const topClickedElements = {};
    clicks.forEach((click) => {
      const key = `${click.element.tag}${click.element.id ? "#" + click.element.id : ""}${click.element.className ? "." + click.element.className.split(" ")[0] : ""}`;
      topClickedElements[key] = (topClickedElements[key] || 0) + 1;
    });

    const topPages = {};
    behaviorList.forEach((event) => {
      topPages[event.page] = (topPages[event.page] || 0) + 1;
    });

    const pageExits = behaviorList.filter((e) => e.type === "page_exit");
    const exitPoints = {};
    pageExits.forEach((exit) => {
      exitPoints[exit.page] = (exitPoints[exit.page] || 0) + 1;
    });

    return {
      overview: {
        totalClicks: clicks.length,
        totalBehaviorEvents: behaviorList.length,
        totalSessions: sessions.length,
        totalPageViews: behaviorList.filter((e) => e.type === "page_view").length,
        avgSessionDuration:
          sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length) : 0,
      },
      clicks: {
        total: clicks.length,
        topElements: Object.entries(topClickedElements)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20),
      },
      heatmap: {
        pages: Object.keys(
          clicks.reduce((acc, c) => {
            acc[c.page] = true;
            return acc;
          }, {})
        ),
        data: heatmap,
      },
      scrollDepth,
      formInteractions: formStats,
      videoStats,
      sessions: sessions.slice(-50),
      topPages: Object.entries(topPages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15),
      exitPoints: Object.entries(exitPoints)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      deviceBreakdown: getDeviceBreakdown(behaviorList),
      geoBreakdown: getGeoBreakdown(behaviorList),
    };
  } catch (error) {
    console.error("Failed to get comprehensive analytics:", error);
    return {
      overview: {},
      clicks: { total: 0, topElements: [] },
      heatmap: { pages: [], data: {} },
      scrollDepth: {},
      formInteractions: {},
      videoStats: {},
      sessions: [],
      topPages: [],
      exitPoints: [],
      deviceBreakdown: {},
      geoBreakdown: {},
    };
  }
};

const getDeviceBreakdown = (behaviorList) => {
  const breakdown = {};
  behaviorList.forEach((event) => {
    const device = event.deviceType || "unknown";
    if (!breakdown[device]) {
      breakdown[device] = { count: 0, browsers: {}, os: {} };
    }
    breakdown[device].count++;
    breakdown[device].browsers[event.browserName] = (breakdown[device].browsers[event.browserName] || 0) + 1;
    breakdown[device].os[event.osName] = (breakdown[device].os[event.osName] || 0) + 1;
  });
  return breakdown;
};

const getGeoBreakdown = (behaviorList) => {
  const breakdown = {};
  behaviorList.forEach((event) => {
    const country = event.country || "unknown";
    breakdown[country] = (breakdown[country] || 0) + 1;
  });
  return breakdown;
};

// ============================================================================
// DATA CLEANUP & MANAGEMENT
// ============================================================================

export const clearAllTrackingData = () => {
  try {
    localStorage.removeItem(TRACKING_CONFIG.clicksKey);
    localStorage.removeItem(TRACKING_CONFIG.behaviorKey);
    localStorage.removeItem(TRACKING_CONFIG.heatmapKey);
    sessionStorage.removeItem(TRACKING_CONFIG.sessionIdKey);
    sessionStorage.removeItem(TRACKING_CONFIG.sessionStartKey);
    return true;
  } catch {
    return false;
  }
};

export const getTrackingDataSize = () => {
  try {
    const clicks = localStorage.getItem(TRACKING_CONFIG.clicksKey) || "[]";
    const behavior = localStorage.getItem(TRACKING_CONFIG.behaviorKey) || "[]";
    const heatmap = localStorage.getItem(TRACKING_CONFIG.heatmapKey) || "[]";

    return {
      clicksSize: new Blob([clicks]).size,
      behaviorSize: new Blob([behavior]).size,
      heatmapSize: new Blob([heatmap]).size,
      totalSize: new Blob([clicks + behavior + heatmap]).size,
      itemCounts: {
        clicks: JSON.parse(clicks).length,
        behavior: JSON.parse(behavior).length,
        heatmap: JSON.parse(heatmap).length,
      },
    };
  } catch {
    return { clicksSize: 0, behaviorSize: 0, heatmapSize: 0, totalSize: 0, itemCounts: {} };
  }
};

export const exportTrackingDataAsJSON = () => {
  try {
    const data = {
      exportDate: new Date().toISOString(),
      analytics: getComprehensiveAnalytics(),
      clicks: getClicksData(),
      behavior: localStorage.getItem(TRACKING_CONFIG.behaviorKey) ? JSON.parse(localStorage.getItem(TRACKING_CONFIG.behaviorKey)) : [],
      heatmap: localStorage.getItem(TRACKING_CONFIG.heatmapKey) ? JSON.parse(localStorage.getItem(TRACKING_CONFIG.heatmapKey)) : [],
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error("Failed to export tracking data:", error);
    return null;
  }
};

export const downloadTrackingDataAsJSON = () => {
  try {
    const jsonData = exportTrackingDataAsJSON();
    if (!jsonData) return false;

    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gaspardnz-tracking-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Failed to download tracking data:", error);
    return false;
  }
};
