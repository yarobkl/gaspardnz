import { useEffect, useState, useMemo, useCallback } from "react";
import { getAnalyticsData, clearAnalytics } from "../../services/adminAnalytics.js";
import { formatNumber, formatDuration, getDateRange } from "../../utils/analyticsHelpers.js";
import { useTr } from "../../context.jsx";
import KPICard from "./components/KPICard.jsx";
import AnalyticsChart from "./components/AnalyticsChart.jsx";
import AnalyticsTable from "./components/AnalyticsTable.jsx";
import DateRangeSelector from "./components/DateRangeSelector.jsx";
import "../../styles/admin.css";
import "../../styles/analytics.css";

const AdminAnalytics = () => {
  const t = useTr();
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("kpi");
  const [dateRange, setDateRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);

  const loadData = useCallback(() => {
    const now = Date.now();
    // Debounce: don't reload more frequently than every 5 seconds
    if (now - lastLoadTime < 5000) return;

    setLastLoadTime(now);
    setRefreshing(true);
    const data = getAnalyticsData(dateRange);
    setAnalytics(data);
    setRefreshing(false);
  }, [dateRange, lastLoadTime]);

  useEffect(() => {
    loadData();

    // Only poll if page is visible (reduce battery drain)
    const handleVisibilityChange = () => {
      if (document.hidden === false) {
        loadData();
      }
    };

    // Poll every 30s instead of 4s (much less aggressive)
    const interval = setInterval(() => {
      if (document.hidden === false) {
        loadData();
      }
    }, 30000);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadData]);

  const handleClear = () => {
    if (window.confirm(t("admin_confirm_clear_analytics"))) {
      clearAnalytics();
      setAnalytics(null);
      setTimeout(() => {
        const data = getAnalyticsData(dateRange);
        setAnalytics(data);
      }, 100);
    }
  };

  if (!analytics) {
    return (
      <div className="analytics-loading">
        <div className="analytics-spinner"></div>
        <p>{t("admin_loading_analytics")}</p>
      </div>
    );
  }

  const overview = analytics?.overview || {};

  return (
    <div className="analytics-container">
      {/* Header avec titre et contrôles */}
      <div className="analytics-header">
        <div>
          <h1 className="admin-h1">{t("admin_analytics_title")}</h1>
          <p className="admin-small">{t("admin_analytics_subtitle")}</p>
        </div>
        <div className="analytics-controls">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <button onClick={handleClear} className="admin-btn-danger" title={t("admin_clear_analytics_title")}>
            {t("admin_reset")}
          </button>
        </div>
      </div>

      {/* Tabs de navigation */}
      <div className="analytics-tabs">
        {[
          { id: "kpi", label: t("admin_tab_kpis"), icon: "KPI" },
          { id: "geo", label: t("admin_tab_geo"), icon: "GEO" },
          { id: "time", label: t("admin_tab_time"), icon: "TPS" },
          { id: "behavior", label: t("admin_tab_behavior"), icon: "UX" },
          { id: "sessions", label: t("admin_tab_sessions"), icon: "CRM" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`analytics-tab ${activeTab === tab.id ? "active" : ""}`}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Barre de statut */}
      <div className={`analytics-refresh-status ${refreshing ? "refreshing" : ""}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {refreshing ? t("admin_refreshing") : t("admin_realtime")}
        </span>
      </div>

      {/* Contenu principal */}
      <div className="analytics-content">
        {/* ========== KPIs Dashboard ========== */}
        {activeTab === "kpi" && (
          <div className="analytics-section">
            {/* Premier rang - KPIs principaux */}
            <div className="kpi-grid-lg">
              <KPICard
                title={t("admin_total_visitors")}
                value={formatNumber(overview.totalVisitors)}
                secondary={`${formatNumber(overview.visitorsToday)} ${t("admin_today")}`}
                trend={overview.visitorsToday > 0 ? "up" : "neutral"}
                color="gold"
              />
              <KPICard
                title={t("admin_page_views")}
                value={formatNumber(overview.totalPageViews)}
                secondary={`${formatNumber(overview.pageViewsToday)} ${t("admin_today")}`}
                trend="up"
                color="cream"
              />
              <KPICard
                title={t("admin_conversion_rate")}
                value={`${overview.conversionRate}%`}
                secondary={`${formatNumber(overview.totalConversions)} ${t("admin_conversions")}`}
                trend={overview.conversionRate > 0 ? "up" : "neutral"}
                color="gold"
              />
              <KPICard
                title={t("admin_bounce_rate")}
                value={`${overview.bounceRate}%`}
                secondary={t("admin_bounce_hint")}
                trend={overview.bounceRate < 50 ? "up" : "down"}
                color="cream"
              />
            </div>

            {/* Deuxième rang - KPIs secondaires */}
            <div className="kpi-grid-md">
              <KPICard
                title={t("admin_avg_duration")}
                value={formatDuration(overview.avgSessionDuration)}
                secondary={t("admin_per_session")}
                color="gold"
              />
              <KPICard
                title={t("admin_top_sources")}
                value={analytics?.topReferrers?.[0]?.referrer || t("admin_direct_access")}
                secondary={`${formatNumber(analytics?.topReferrers?.[0]?.count || 0)} ${t("admin_visits")}`}
                color="cream"
              />
            </div>

            {/* Graphiques */}
            <div className="analytics-charts-grid">
              {/* Visiteurs au fil du temps */}
              <div className="chart-card">
                <h3 className="chart-title">{t("admin_visitors_last", dateRange === "7d" ? t("admin_range_7d") : dateRange === "30d" ? t("admin_range_30d") : t("admin_range_6m"))}</h3>
                <AnalyticsChart
                  type="line"
                  data={analytics?.visitorsOverTime || []}
                  dataKey="visitors"
                  xKey="date"
                  color="#b8973e"
                />
              </div>

              {/* Pages les plus visitées */}
              <div className="chart-card">
                <h3 className="chart-title">{t("admin_popular_pages")}</h3>
                <AnalyticsChart
                  type="bar"
                  data={analytics?.topPages?.slice(0, 5) || []}
                  dataKey="count"
                  labelKey="page"
                  color="#b8973e"
                />
              </div>

              {/* Heures de pointe */}
              <div className="chart-card">
                <h3 className="chart-title">{t("admin_activity_by_hour")}</h3>
                <AnalyticsChart
                  type="bar"
                  data={Object.entries(analytics?.peakHours || {}).map(([hour, count]) => ({
                    hour: `${hour}h`,
                    count,
                  }))}
                  dataKey="count"
                  labelKey="hour"
                  color="#d4ae5a"
                />
              </div>

              {/* Jour de la semaine */}
              <div className="chart-card">
                <h3 className="chart-title">{t("admin_activity_by_day")}</h3>
                <AnalyticsChart
                  type="bar"
                  data={Object.entries(analytics?.dayOfWeek || {}).map(([day, count]) => ({
                    day: day.substring(0, 3),
                    count,
                  }))}
                  dataKey="count"
                  labelKey="day"
                  color="#d4ae5a"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========== Geographic Analytics ========== */}
        {activeTab === "geo" && (
          <div className="analytics-section">
            <div className="analytics-charts-grid">
              {/* Device Breakdown */}
              <div className="chart-card">
                <h3 className="chart-title">{t("admin_device_breakdown")}</h3>
                <AnalyticsChart
                  type="pie"
                  data={Object.entries(analytics?.deviceStats || {}).map(([device, count]) => ({
                    name: device,
                    value: count,
                  }))}
                  color="#b8973e"
                />
              </div>

              {/* Browser Breakdown */}
              <div className="chart-card">
                <h3 className="chart-title">{t("admin_browsers")}</h3>
                <AnalyticsChart
                  type="pie"
                  data={Object.entries(analytics?.browserStats || {}).map(([browser, count]) => ({
                    name: browser,
                    value: count,
                  }))}
                  color="#b8973e"
                />
              </div>
            </div>

            {/* Villes avec la plupart des visites */}
            <div className="analytics-table-section">
              <h3 className="chart-title">{t("admin_top_cities")}</h3>
              <AnalyticsTable
                columns={[
                  { key: "city", label: t("admin_city"), width: "70%" },
                  { key: "count", label: t("admin_visits"), width: "30%", align: "right" },
                ]}
                data={Object.entries(analytics?.cityStats || {})
                  .map(([city, count]) => ({ city, count }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10)}
                maxHeight="400px"
              />
            </div>

            {/* Pays */}
            <div className="analytics-table-section">
              <h3 className="chart-title">{t("admin_visitors_by_country")}</h3>
              <AnalyticsTable
                columns={[
                  { key: "country", label: t("admin_country"), width: "70%" },
                  { key: "count", label: t("admin_visits"), width: "30%", align: "right" },
                ]}
                data={Object.entries(analytics?.countryStats || {})
                  .map(([country, count]) => ({ country, count }))
                  .sort((a, b) => b.count - a.count)}
                maxHeight="500px"
              />
            </div>
          </div>
        )}

        {/* ========== Time-based Analytics ========== */}
        {activeTab === "time" && (
          <div className="analytics-section">
            <div className="analytics-charts-grid">
              {/* Full timeline */}
              <div className="chart-card full-width">
                <h3 className="chart-title">{t("admin_visitors_evolution")}</h3>
                <AnalyticsChart
                  type="line"
                  data={analytics?.visitorsOverTime || []}
                  dataKey="visitors"
                  xKey="date"
                  color="#b8973e"
                  height={300}
                />
              </div>

              {/* Peak Hours Heatmap visualization */}
              <div className="chart-card">
                <h3 className="chart-title">{t("admin_peak_hours")}</h3>
                <AnalyticsChart
                  type="bar"
                  data={Object.entries(analytics?.peakHours || {}).map(([hour, count]) => ({
                    hour: `${String(hour).padStart(2, "0")}:00`,
                    count,
                  }))}
                  dataKey="count"
                  labelKey="hour"
                  color="#b8973e"
                  horizontal={false}
                />
              </div>

              {/* Day of Week */}
              <div className="chart-card">
                <h3 className="chart-title">{t("admin_weekly_activity")}</h3>
                <AnalyticsChart
                  type="bar"
                  data={Object.entries(analytics?.dayOfWeek || {}).map(([day, count]) => ({
                    day,
                    count,
                  }))}
                  dataKey="count"
                  labelKey="day"
                  color="#b8973e"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========== User Behavior Analytics ========== */}
        {activeTab === "behavior" && (
          <div className="analytics-section">
            {/* Pages avec plus d'engagement */}
            <div className="analytics-table-section">
              <h3 className="chart-title">{t("admin_engaging_pages")}</h3>
              <AnalyticsTable
                columns={[
                  { key: "page", label: t("admin_page"), width: "60%" },
                  { key: "avgTime", label: t("admin_avg_time"), width: "40%", align: "right" },
                ]}
                data={analytics?.timeOnPage || []}
                maxHeight="400px"
              />
            </div>

            {/* Top pages by views */}
            <div className="analytics-table-section">
              <h3 className="chart-title">{t("admin_popular_pages")}</h3>
              <AnalyticsChart
                type="bar"
                data={analytics?.topPages?.slice(0, 8) || []}
                dataKey="count"
                labelKey="page"
                color="#b8973e"
              />
            </div>

            {/* User flow */}
            <div className="analytics-table-section">
              <h3 className="chart-title">{t("admin_user_flow")}</h3>
              <AnalyticsTable
                columns={[
                  { key: "flow", label: t("admin_flow"), width: "70%" },
                  { key: "count", label: t("admin_transitions"), width: "30%", align: "right" },
                ]}
                data={analytics?.userFlow || []}
                maxHeight="400px"
              />
            </div>
          </div>
        )}

        {/* ========== Recent Sessions ========== */}
        {activeTab === "sessions" && (
          <div className="analytics-section">
            {/* Recent Visitors */}
            <div className="analytics-table-section">
              <h3 className="chart-title">{t("admin_recent_sessions")}</h3>
              <AnalyticsTable
                columns={[
                  { key: "id", label: t("admin_visitor_id"), width: "25%" },
                  { key: "device", label: t("admin_device"), width: "15%" },
                  { key: "city", label: t("admin_city"), width: "20%" },
                  { key: "pageCount", label: t("admin_pages"), width: "10%", align: "center" },
                  { key: "eventCount", label: t("admin_total_events"), width: "15%", align: "center" },
                  { key: "status", label: t("admin_status"), width: "15%" },
                ]}
                data={(analytics?.recentVisitors || []).map((v) => ({
                  ...v,
                  id: v.id.slice(0, 16) + "...",
                  status: v.status === "converted" ? `✓ ${t("admin_converted")}` : t("admin_visitor"),
                }))}
                maxHeight="600px"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
