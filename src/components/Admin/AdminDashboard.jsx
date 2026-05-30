import { useEffect, useState } from "react";
import { getAnalyticsData } from "../../services/adminAnalytics.js";
import { getLeadStats } from "../../services/adminCRM.js";

const StatCard = ({ label, value, subtext, color = "#b8973e" }) => (
  <div
    style={{
      background: "rgba(0,0,0,0.3)",
      border: `1px solid rgba(${color.match(/\d+/g).join(",")},.2)`,
      borderRadius: "8px",
      padding: "1.6rem",
      marginBottom: "1rem",
    }}>
    <p
      style={{
        fontSize: "11px",
        color: "rgba(250,247,242,0.6)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        margin: "0 0 0.8rem 0",
      }}>
      {label}
    </p>
    <p
      style={{
        fontSize: "2.2rem",
        fontWeight: "700",
        color,
        margin: "0.5rem 0 0 0",
        fontFamily: "'Bebas Neue', sans-serif",
        letterSpacing: "0.05em",
      }}>
      {value}
    </p>
    {subtext && (
      <p style={{ fontSize: "12px", color: "rgba(250,247,242,0.4)", margin: "0.5rem 0 0 0" }}>
        {subtext}
      </p>
    )}
  </div>
);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [crm, setCRM] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const analyticsData = getAnalyticsData();
      const crmData = getLeadStats();
      setAnalytics(analyticsData);
      setCRM(crmData);
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div style={{ fontSize: "14px", color: "rgba(250,247,242,0.6)" }}>Chargement...</div>;
  }

  const overview = analytics?.overview || {};

  return (
    <div>
      <p style={{ color: "rgba(250,247,242,0.6)", marginTop: 0, fontSize: "13px" }}>
        Vue d'ensemble en temps réel
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}>
        <StatCard label="Visiteurs Total" value={overview.totalVisitors || 0} color="#b8973e" />
        <StatCard label="Visiteurs Aujourd'hui" value={overview.visitorsToday || 0} color="#d4ae5a" />
        <StatCard label="Total Événements" value={overview.totalEvents || 0} color="#9d7e3d" />
        <StatCard label="Événements (24h)" value={overview.eventsToday || 0} color="#8b7534" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}>
        <StatCard label="Conversions Total" value={overview.totalConversions || 0} color="#5caf2d" />
        <StatCard label="Conversions (24h)" value={overview.conversionsToday || 0} color="#7ac649" />
        <StatCard label="Taux de Conversion" value={`${overview.conversionRate || 0}%`} color="#4d9924" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}>
        <StatCard label="Total Leads" value={crm?.total || 0} color="#3498db" />
        <StatCard
          label="Leads Nouveaux"
          value={crm?.byStatus?.nouveau || 0}
          subtext="À contacter"
          color="#2980b9"
        />
        <StatCard label="Leads Convertis" value={crm?.byStatus?.converti || 0} color="#27ae60" />
      </div>

      {/* Pages les plus visitées */}
      <div style={{ marginTop: "2.4rem" }}>
        <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
          Pages les plus visitées
        </h3>
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(184,151,62,0.2)",
            borderRadius: "8px",
            overflow: "hidden",
          }}>
          {(analytics?.topPages || []).length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(184,151,62,0.1)" }}>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>
                    Page
                  </th>
                  <th style={{ padding: "1rem", textAlign: "right", fontSize: "12px", color: "#b8973e" }}>
                    Vues
                  </th>
                </tr>
              </thead>
              <tbody>
                {(analytics?.topPages || []).map((p) => (
                  <tr key={p.page} style={{ borderBottom: "1px solid rgba(184,151,62,0.1)" }}>
                    <td style={{ padding: "1rem", fontSize: "13px" }}>{p.page}</td>
                    <td style={{ padding: "1rem", textAlign: "right", fontSize: "13px", color: "#b8973e" }}>
                      {p.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(250,247,242,0.4)" }}>
              Pas de données disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
