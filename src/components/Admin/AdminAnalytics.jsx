import { useEffect, useState, useMemo } from "react";
import { getAnalyticsData, clearAnalytics } from "../../services/adminAnalytics.js";
import { formatNumber, formatDuration, getDateRange } from "../../utils/analyticsHelpers.js";
import KPICard from "./components/KPICard.jsx";
import AnalyticsChart from "./components/AnalyticsChart.jsx";
import AnalyticsTable from "./components/AnalyticsTable.jsx";
import DateRangeSelector from "./components/DateRangeSelector.jsx";
import "../../styles/admin.css";
import "../../styles/analytics.css";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("kpi");
  const [dateRange, setDateRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = () => {
      setRefreshing(true);
      const data = getAnalyticsData(dateRange);
      setAnalytics(data);
      setRefreshing(false);
    };

    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const handleClear = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer toutes les données d'analytics ?")) {
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
        <p>Chargement des analytics...</p>
      </div>
    );
  }

  const overview = analytics?.overview || {};

  return (
    <div className="analytics-container">
      {/* Header avec titre et contrôles */}
      <div className="analytics-header">
        <div>
          <h1 className="admin-h1">Tableau de Bord Analytics</h1>
          <p className="admin-small">Suivi en temps réel de vos visiteurs et engagements</p>
        </div>
        <div className="analytics-controls">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <button onClick={handleClear} className="admin-btn-danger" title="Effacer toutes les données">
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Tabs de navigation */}
      <div className="analytics-tabs">
        {[
          { id: "kpi", label: "KPIs", icon: "📊" },
          { id: "geo", label: "Géographie", icon: "🌍" },
          { id: "time", label: "Temps", icon: "⏱️" },
          { id: "behavior", label: "Comportement", icon: "👥" },
          { id: "sessions", label: "Sessions", icon: "💼" },
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
          {refreshing ? "Mise à jour en cours..." : "En temps réel"}
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
                title="Visiteurs Total"
                value={formatNumber(overview.totalVisitors)}
                secondary={`${formatNumber(overview.visitorsToday)} aujourd'hui`}
                trend={overview.visitorsToday > 0 ? "up" : "neutral"}
                color="gold"
              />
              <KPICard
                title="Pages Vues"
                value={formatNumber(overview.totalPageViews)}
                secondary={`${formatNumber(overview.pageViewsToday)} aujourd'hui`}
                trend="up"
                color="cream"
              />
              <KPICard
                title="Taux de Conversion"
                value={`${overview.conversionRate}%`}
                secondary={`${formatNumber(overview.totalConversions)} conversions`}
                trend={overview.conversionRate > 0 ? "up" : "neutral"}
                color="gold"
              />
              <KPICard
                title="Taux de Rebond"
                value={`${overview.bounceRate}%`}
                secondary="En baisse = mieux"
                trend={overview.bounceRate < 50 ? "up" : "down"}
                color="cream"
              />
            </div>

            {/* Deuxième rang - KPIs secondaires */}
            <div className="kpi-grid-md">
              <KPICard
                title="Durée Moyenne"
                value={formatDuration(overview.avgSessionDuration)}
                secondary="Par session"
                color="gold"
              />
              <KPICard
                title="Sources Principales"
                value={analytics?.topReferrers?.[0]?.referrer || "Accès direct"}
                secondary={`${formatNumber(analytics?.topReferrers?.[0]?.count || 0)} visites`}
                color="cream"
              />
            </div>

            {/* Graphiques */}
            <div className="analytics-charts-grid">
              {/* Visiteurs au fil du temps */}
              <div className="chart-card">
                <h3 className="chart-title">Visiteurs - Derniers {dateRange === "7d" ? "7 jours" : dateRange === "30d" ? "30 jours" : "6 mois"}</h3>
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
                <h3 className="chart-title">Pages Populaires</h3>
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
                <h3 className="chart-title">Activité par Heure</h3>
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
                <h3 className="chart-title">Activité par Jour</h3>
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
                <h3 className="chart-title">Répartition Appareils</h3>
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
                <h3 className="chart-title">Navigateurs</h3>
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
              <h3 className="chart-title">Top 10 Villes</h3>
              <AnalyticsTable
                columns={[
                  { key: "city", label: "Ville", width: "70%" },
                  { key: "count", label: "Visites", width: "30%", align: "right" },
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
              <h3 className="chart-title">Visiteurs par Pays</h3>
              <AnalyticsTable
                columns={[
                  { key: "country", label: "Pays", width: "70%" },
                  { key: "count", label: "Visites", width: "30%", align: "right" },
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
                <h3 className="chart-title">Évolution des Visiteurs</h3>
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
                <h3 className="chart-title">Heures de Pointe</h3>
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
                <h3 className="chart-title">Activité Hebdomadaire</h3>
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
              <h3 className="chart-title">Pages les Plus Engageantes</h3>
              <AnalyticsTable
                columns={[
                  { key: "page", label: "Page", width: "60%" },
                  { key: "avgTime", label: "Temps Moyen", width: "40%", align: "right" },
                ]}
                data={analytics?.timeOnPage || []}
                maxHeight="400px"
              />
            </div>

            {/* Top pages by views */}
            <div className="analytics-table-section">
              <h3 className="chart-title">Pages Populaires</h3>
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
              <h3 className="chart-title">Flux Utilisateur</h3>
              <AnalyticsTable
                columns={[
                  { key: "flow", label: "Flux", width: "70%" },
                  { key: "count", label: "Transitions", width: "30%", align: "right" },
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
              <h3 className="chart-title">Sessions Récentes</h3>
              <AnalyticsTable
                columns={[
                  { key: "id", label: "Visiteur ID", width: "25%" },
                  { key: "device", label: "Appareil", width: "15%" },
                  { key: "city", label: "Ville", width: "20%" },
                  { key: "pageCount", label: "Pages", width: "10%", align: "center" },
                  { key: "eventCount", label: "Événements", width: "15%", align: "center" },
                  { key: "status", label: "Statut", width: "15%" },
                ]}
                data={(analytics?.recentVisitors || []).map((v) => ({
                  ...v,
                  id: v.id.slice(0, 16) + "...",
                  status: v.status === "converted" ? "✓ Converti" : "Visiteur",
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
