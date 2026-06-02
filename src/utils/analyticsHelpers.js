/**
 * Analytics Utility Helpers
 * Formatting and calculation functions for analytics display
 */

export const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  const n = parseInt(num);
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
};

export const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "0s";
  const num = parseInt(seconds);
  if (num < 60) return `${num}s`;
  if (num < 3600) {
    const mins = Math.floor(num / 60);
    const secs = num % 60;
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(num / 3600);
  const mins = Math.floor((num % 3600) / 60);
  return `${hours}h ${mins}m`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatPercent = (value, decimals = 1) => {
  const num = parseFloat(value);
  return `${num.toFixed(decimals)}%`;
};

export const getDateRange = (range) => {
  const now = new Date();
  let startDate;

  switch (range) {
    case "7d":
      startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
      break;
    case "6m":
      startDate = new Date(now - 180 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(0);
  }

  return { startDate, endDate: now };
};

export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(1);
};

export const groupByDate = (data, dateKey = "timestamp") => {
  const grouped = {};
  data.forEach((item) => {
    const date = formatDate(item[dateKey]);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  });
  return grouped;
};

export const aggregateByProperty = (data, property) => {
  const aggregated = {};
  data.forEach((item) => {
    const key = item[property];
    aggregated[key] = (aggregated[key] || 0) + 1;
  });
  return aggregated;
};

export const getTopN = (obj, n = 10) => {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, value]) => ({ key, value }));
};

export const calculateAverageSessionDuration = (visitors) => {
  if (!visitors || visitors.length === 0) return 0;
  const total = visitors.reduce((sum, v) => {
    const firstSeen = new Date(v.firstSeen);
    const lastSeen = new Date(v.lastSeen);
    return sum + (lastSeen - firstSeen) / 1000;
  }, 0);
  return Math.round(total / visitors.length);
};

export const calculateBounceRate = (visitors) => {
  if (!visitors || visitors.length === 0) return 0;
  const bounces = visitors.filter((v) => v.pageCount === 1).length;
  return ((bounces / visitors.length) * 100).toFixed(2);
};

export const calculateConversionRate = (totalVisitors, conversions) => {
  if (!totalVisitors || totalVisitors === 0) return 0;
  return ((conversions / totalVisitors) * 100).toFixed(2);
};

export const getDeviceBreakdown = (visitors) => {
  const breakdown = {};
  visitors.forEach((v) => {
    breakdown[v.device] = (breakdown[v.device] || 0) + 1;
  });
  return breakdown;
};

export const getBrowserBreakdown = (visitors) => {
  const breakdown = {};
  visitors.forEach((v) => {
    breakdown[v.browser] = (breakdown[v.browser] || 0) + 1;
  });
  return breakdown;
};

export const getGeographicBreakdown = (visitors) => {
  const countries = {};
  const cities = {};

  visitors.forEach((v) => {
    countries[v.country] = (countries[v.country] || 0) + 1;
    const cityKey = `${v.city}, ${v.country}`;
    cities[cityKey] = (cities[cityKey] || 0) + 1;
  });

  return { countries, cities };
};

export const getHourlyActivity = (events) => {
  const hourly = {};
  for (let i = 0; i < 24; i++) {
    hourly[i] = 0;
  }

  events.forEach((e) => {
    const hour = new Date(e.timestamp).getHours();
    hourly[hour]++;
  });

  return hourly;
};

export const getDayOfWeekActivity = (events) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const activity = {};

  days.forEach((day) => {
    activity[day] = 0;
  });

  events.forEach((e) => {
    const dayIndex = new Date(e.timestamp).getDay();
    activity[days[dayIndex]]++;
  });

  return activity;
};
