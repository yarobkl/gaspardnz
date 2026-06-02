/**
 * Tracking Data Analyzer - generates human-readable reports and insights
 * from the analytics tracking system
 */

import {
  getClicksData,
  getScrollDepthStats,
  getFormInteractionStats,
  getVideoStats,
  getSessionStats,
  getHeatmapData,
  getComprehensiveAnalytics,
  getTrackingDataSize,
} from "./analyticsTracking.js";

// ============================================================================
// HEATMAP REPORT GENERATOR
// ============================================================================

export const generateHeatmapReport = (pageFilter = null) => {
  const heatmapData = getHeatmapData(pageFilter);
  const clicks = getClicksData();
  const filteredClicks = pageFilter ? clicks.filter((c) => c.page === pageFilter) : clicks;

  const elementClicks = {};
  filteredClicks.forEach((click) => {
    const key = click.element.tag + (click.element.id ? `#${click.element.id}` : "") + (click.element.className ? `.${click.element.className.split(" ")[0]}` : "");
    if (!elementClicks[key]) {
      elementClicks[key] = {
        element: key,
        tag: click.element.tag,
        id: click.element.id,
        className: click.element.className,
        count: 0,
        text: click.element.text,
        section: click.section,
      };
    }
    elementClicks[key].count++;
  });

  const sortedElements = Object.values(elementClicks).sort((a, b) => b.count - a.count);

  return {
    totalClicks: heatmapData.totalClicks,
    heatmapGrid: heatmapData.heatGrid,
    topClickedElements: sortedElements.slice(0, 30),
    clicksBySection: getClicksBySection(filteredClicks),
    clickHotspots: generateClickHotspots(heatmapData),
  };
};

const getClicksBySection = (clicks) => {
  const sectionMap = {};
  clicks.forEach((click) => {
    const section = click.section || "unknown";
    sectionMap[section] = (sectionMap[section] || 0) + 1;
  });
  return Object.entries(sectionMap)
    .map(([section, count]) => ({ section, count }))
    .sort((a, b) => b.count - a.count);
};

const generateClickHotspots = (heatmapData) => {
  const hotspots = [];
  const gridData = Object.entries(heatmapData.heatGrid)
    .map(([coords, count]) => {
      const [x, y] = coords.split(",").map(Number);
      return {
        x: x * heatmapData.gridSize,
        y: y * heatmapData.gridSize,
        intensity: count,
      };
    })
    .sort((a, b) => b.intensity - a.intensity);

  return gridData.slice(0, 20);
};

// ============================================================================
// SCROLL DEPTH REPORT
// ============================================================================

export const generateScrollDepthReport = () => {
  const scrollStats = getScrollDepthStats();

  const report = {
    pages: [],
  };

  Object.entries(scrollStats).forEach(([page, stats]) => {
    report.pages.push({
      page,
      maxDepth: stats.maxDepth,
      avgDepth: stats.avgDepth,
      totalScrollEvents: stats.totalEvents,
      depthPercentiles: calculatePercentiles(stats.depths),
    });
  });

  report.pages.sort((a, b) => b.avgDepth - a.avgDepth);

  return report;
};

const calculatePercentiles = (values) => {
  if (values.length === 0) return { p25: 0, p50: 0, p75: 0, p90: 0, p95: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const len = sorted.length;

  return {
    p25: sorted[Math.floor(len * 0.25)],
    p50: sorted[Math.floor(len * 0.5)],
    p75: sorted[Math.floor(len * 0.75)],
    p90: sorted[Math.floor(len * 0.9)],
    p95: sorted[Math.floor(len * 0.95)],
  };
};

// ============================================================================
// FORM INTERACTION REPORT
// ============================================================================

export const generateFormInteractionReport = () => {
  const formStats = getFormInteractionStats();

  const report = {
    forms: [],
    summary: {
      totalForms: Object.keys(formStats).length,
      totalSubmissions: 0,
      totalInteractions: 0,
    },
  };

  Object.entries(formStats).forEach(([formName, stats]) => {
    const totalInteractions = stats.focuses + stats.blurs + stats.inputs + stats.submits;
    const submissionRate = stats.focuses > 0 ? ((stats.submits / stats.focuses) * 100).toFixed(2) : 0;
    const abandonment = 100 - submissionRate;

    report.forms.push({
      formName,
      interactions: {
        focuses: stats.focuses,
        blurs: stats.blurs,
        inputs: stats.inputs,
        submits: stats.submits,
        total: totalInteractions,
      },
      conversionMetrics: {
        submissionRate: parseFloat(submissionRate),
        abandonmentRate: parseFloat(abandonment),
      },
      fields: Object.entries(stats.fields)
        .map(([fieldName, fieldStats]) => ({
          fieldName,
          fieldType: fieldStats.type,
          interactions: fieldStats.interactions,
        }))
        .sort((a, b) => b.interactions - a.interactions),
    });

    report.summary.totalSubmissions += stats.submits;
    report.summary.totalInteractions += totalInteractions;
  });

  report.forms.sort((a, b) => b.interactions.total - a.interactions.total);

  return report;
};

// ============================================================================
// SESSION FLOW REPORT
// ============================================================================

export const generateSessionFlowReport = () => {
  const sessions = getSessionStats();

  const report = {
    totalSessions: sessions.length,
    avgSessionDuration: 0,
    sessions: [],
    flowPaths: [],
  };

  let totalDuration = 0;
  const pathMap = {};

  sessions.forEach((session) => {
    totalDuration += session.duration;
    report.sessions.push({
      sessionId: session.sessionId,
      duration: session.duration,
      durationFormatted: formatDuration(session.duration),
      startTime: session.startTime,
      endTime: session.endTime,
      pageCount: session.pageCount,
      pages: session.pages,
      eventTypes: session.eventTypes,
      eventCount: session.eventCount,
    });

    const pathKey = session.pages.join(" -> ");
    pathMap[pathKey] = (pathMap[pathKey] || 0) + 1;
  });

  report.avgSessionDuration = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0;

  report.flowPaths = Object.entries(pathMap)
    .map(([path, count]) => ({
      path,
      count,
      percentage: ((count / sessions.length) * 100).toFixed(2),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  report.sessions.sort((a, b) => b.duration - a.duration);

  return report;
};

// ============================================================================
// DEVICE & GEO REPORT
// ============================================================================

export const generateDeviceGeoReport = () => {
  const analytics = getComprehensiveAnalytics();

  return {
    devices: analytics.deviceBreakdown,
    geography: analytics.geoBreakdown,
    topCountries: Object.entries(analytics.geoBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15),
    topDevices: Object.entries(analytics.deviceBreakdown)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10),
  };
};

// ============================================================================
// EXIT POINT ANALYSIS
// ============================================================================

export const generateExitPointAnalysis = () => {
  const analytics = getComprehensiveAnalytics();

  return {
    totalExits: analytics.exitPoints.reduce((sum, [_, count]) => sum + count, 0),
    exitPoints: analytics.exitPoints.map(([page, count]) => ({
      page,
      exitCount: count,
    })),
  };
};

// ============================================================================
// TIME-ON-PAGE REPORT
// ============================================================================

export const generateTimeOnPageReport = () => {
  const sessions = getSessionStats();
  const pageTimeMap = {};

  sessions.forEach((session) => {
    session.pages.forEach((page) => {
      if (!pageTimeMap[page]) {
        pageTimeMap[page] = {
          page,
          totalTime: 0,
          visits: 0,
          times: [],
        };
      }
      pageTimeMap[page].visits++;
      pageTimeMap[page].times.push(session.duration);
    });
  });

  const report = {
    pages: [],
  };

  Object.values(pageTimeMap).forEach((pageData) => {
    const avgTime = pageData.times.length > 0 ? Math.round(pageData.times.reduce((a, b) => a + b, 0) / pageData.times.length) : 0;
    pageData.avgTime = avgTime;
    pageData.maxTime = Math.max(...pageData.times);
    pageData.minTime = Math.min(...pageData.times);
    delete pageData.times;
    report.pages.push(pageData);
  });

  report.pages.sort((a, b) => b.avgTime - a.avgTime);

  return report;
};

// ============================================================================
// BOUNCE RATE & ENGAGEMENT
// ============================================================================

export const generateEngagementReport = () => {
  const sessions = getSessionStats();

  let bounceCount = 0;
  let totalPageViews = 0;
  let highEngagementCount = 0;

  sessions.forEach((session) => {
    if (session.pageCount === 1) {
      bounceCount++;
    }
    totalPageViews += session.pageCount;
    if (session.duration > 60 && session.pageCount > 2) {
      highEngagementCount++;
    }
  });

  const bounceRate = sessions.length > 0 ? ((bounceCount / sessions.length) * 100).toFixed(2) : 0;
  const engagementRate = sessions.length > 0 ? ((highEngagementCount / sessions.length) * 100).toFixed(2) : 0;
  const avgPagesPerSession = sessions.length > 0 ? (totalPageViews / sessions.length).toFixed(2) : 0;

  return {
    totalSessions: sessions.length,
    bounceCount,
    bounceRate: parseFloat(bounceRate),
    highEngagementSessions: highEngagementCount,
    engagementRate: parseFloat(engagementRate),
    avgPagesPerSession: parseFloat(avgPagesPerSession),
    totalPageViews,
  };
};

// ============================================================================
// EXECUTIVE SUMMARY
// ============================================================================

export const generateExecutiveSummary = () => {
  const analytics = getComprehensiveAnalytics();
  const engagement = generateEngagementReport();
  const scrollDepth = generateScrollDepthReport();
  const timeOnPage = generateTimeOnPageReport();
  const dataSize = getTrackingDataSize();

  const avgScrollDepth = scrollDepth.pages.length > 0 ? Math.round(scrollDepth.pages.reduce((sum, p) => sum + p.avgDepth, 0) / scrollDepth.pages.length) : 0;

  return {
    timestamp: new Date().toISOString(),
    period: "Current Session",
    overview: {
      totalClicks: analytics.overview.totalClicks,
      totalEvents: analytics.overview.totalBehaviorEvents,
      totalSessions: analytics.overview.totalSessions,
      totalPageViews: analytics.overview.totalPageViews,
      avgSessionDuration: formatDuration(analytics.overview.avgSessionDuration),
    },
    engagement: {
      bounceRate: `${engagement.bounceRate}%`,
      engagementRate: `${engagement.engagementRate}%`,
      avgPagesPerSession: engagement.avgPagesPerSession,
      avgScrollDepth: `${avgScrollDepth}%`,
    },
    topContent: {
      topPages: analytics.topPages.slice(0, 5),
      topClickedElements: analytics.clicks.topElements.slice(0, 5),
      topExitPoints: analytics.exitPoints.slice(0, 5),
    },
    audience: {
      topDevices: Object.entries(analytics.deviceBreakdown)
        .slice(0, 3)
        .map(([device, stats]) => ({
          device,
          count: stats.count,
        })),
      topCountries: analytics.geoBreakdown,
    },
    dataHealth: {
      totalDataSize: `${(dataSize.totalSize / 1024).toFixed(2)} KB`,
      itemCounts: dataSize.itemCounts,
    },
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const getPercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return (((current - previous) / previous) * 100).toFixed(2);
};

export const generateFullReport = () => {
  return {
    exportDate: new Date().toISOString(),
    executiveSummary: generateExecutiveSummary(),
    heatmap: generateHeatmapReport(),
    scrollDepth: generateScrollDepthReport(),
    formInteractions: generateFormInteractionReport(),
    sessionFlow: generateSessionFlowReport(),
    deviceGeo: generateDeviceGeoReport(),
    exitPoints: generateExitPointAnalysis(),
    timeOnPage: generateTimeOnPageReport(),
    engagement: generateEngagementReport(),
  };
};
