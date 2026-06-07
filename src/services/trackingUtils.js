/**
 * Shared tracking utility functions
 * Used by both analyticsTracking.js and adminAnalytics.js
 */

export const getDeviceInfo = () => {
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

export const getBrowserName = (ua = navigator.userAgent) => {
  if (ua.includes("Chrome") && !ua.includes("Chromium")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Other";
};

export const getOSName = (ua = navigator.userAgent) => {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Other";
};

export const TIMEZONE_TO_COUNTRY = {
  "Europe/Paris": "FR",
  "Europe/London": "GB",
  "Europe/Berlin": "DE",
  "Europe/Madrid": "ES",
  "Europe/Brussels": "BE",
  "Europe/Amsterdam": "NL",
  "Europe/Rome": "IT",
  "Europe/Vienna": "AT",
  "Europe/Prague": "CZ",
  "Europe/Budapest": "HU",
  "Europe/Warsaw": "PL",
  "Europe/Athens": "GR",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Zurich": "CH",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Los_Angeles": "US",
  "America/Toronto": "CA",
  "America/Mexico_City": "MX",
  "America/Sao_Paulo": "BR",
  "Asia/Tokyo": "JP",
  "Asia/Hong_Kong": "HK",
  "Asia/Shanghai": "CN",
  "Asia/Singapore": "SG",
  "Asia/Bangkok": "TH",
  "Asia/Dubai": "AE",
  "Asia/Kolkata": "IN",
  "Australia/Sydney": "AU",
  "Pacific/Auckland": "NZ",
};

export const getCountryFromTimezone = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_TO_COUNTRY[tz] || "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
};
