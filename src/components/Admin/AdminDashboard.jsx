import { useEffect, useState } from "react";
import { getAnalyticsData } from "../../services/adminAnalytics.js";
import { getLeadStats } from "../../services/adminCRM.js";
import "../../styles/admin.css";

const StatCard = ({ label, value, subtext }) => (
  <div className="admin-kpi">
    <div className="admin-kpi-label">{label}</div>
    <div className="admin-kpi-value">{value}</div>
    {subtext && <div className="admin-kpi-change">{subtext}</div>}
  </div>
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [crm, setCRM] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let isLoading = false;

    const loadData = () => {
      if (isLoading || !isMounted) return;
      isLoading = true;

      try {
        const analyticsData = getAnalyticsData();
        const crmData = getLeadStats();
        if (isMounted) {
          setAnalytics(analyticsData);
          setCRM(crmData);
          setLoading(false);
        }
      } finally {
        isLoading = false;
      }
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <div className="admin-small">Chargement...</div>;
  }

  const overview = analytics?.overview || {};

  return (
    <div>
      <p className="admin-small">Vue d'ensemble en temps réel</p>

      <div className="admin-grid">
        <StatCard label="Visiteurs Total" value={overview.totalVisitors || 0} />
        <StatCard label="Visiteurs Aujourd'hui" value={overview.visitorsToday || 0} />
        <StatCard label="Total Événements" value={overview.totalEvents || 0} />
        <StatCard label="Événements (24h)" value={overview.eventsToday || 0} />
      </div>

      <div className="admin-grid" style={{ marginTop: "2rem" }}>
        <StatCard label="Conversions Total" value={overview.totalConversions || 0} />
        <StatCard label="Conversions (24h)" value={overview.conversionsToday || 0} />
        <StatCard label="Taux de Conversion" value={`${overview.conversionRate || 0}%`} />
      </div>

      <div className="admin-grid" style={{ marginTop: "2rem" }}>
        <StatCard label="Total Leads" value={crm?.total || 0} />
        <StatCard label="Leads Nouveaux" value={crm?.byStatus?.nouveau || 0} subtext="À contacter" />
        <StatCard label="Leads Convertis" value={crm?.byStatus?.converti || 0} />
      </div>

      <div style={{ marginTop: "3rem" }}>
        <h3 className="admin-h3" style={{ marginBottom: "1.5rem" }}>Pages les plus visitées</h3>
        <div className="admin-card">
          {(analytics?.topPages || []).length > 0 ? (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th style={{ textAlign: "right" }}>Vues</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.topPages || []).map((p) => (
                    <tr key={p.page}>
                      <td>{p.page}</td>
                      <td style={{ textAlign: "right", color: "var(--gnz-gold)" }}>{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
              Pas de données disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
