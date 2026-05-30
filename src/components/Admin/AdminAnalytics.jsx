import { useEffect, useState } from "react";
import { getAnalyticsData, clearAnalytics } from "../../services/adminAnalytics.js";
import "../../styles/admin.css";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState("visiteurs");

  useEffect(() => {
    const loadData = () => {
      const data = getAnalyticsData();
      setAnalytics(data);
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer toutes les données ?")) {
      clearAnalytics();
      setAnalytics({ overview: {}, topPages: [], topReferrers: [], deviceStats: {}, countryStats: {}, recentVisitors: [], recentEvents: [] });
    }
  };

  const renderDeviceStats = () => {
    const stats = analytics?.deviceStats || {};
    return (
      <div style={{ marginTop: "2rem" }}>
        <h3 className="admin-h3" style={{ marginBottom: "1.5rem" }}>Appareils</h3>
        <div className="admin-grid">
          {Object.entries(stats).map(([device, count]) => (
            <div key={device} className="admin-kpi">
              <div className="admin-kpi-label">{device}</div>
              <div className="admin-kpi-value">{count}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCountryStats = () => {
    const stats = analytics?.countryStats || {};
    return (
      <div style={{ marginTop: "2rem" }}>
        <h3 className="admin-h3" style={{ marginBottom: "1.5rem" }}>Pays</h3>
        <div className="admin-card">
          <table className="admin-table">
            <tbody>
              {Object.entries(stats)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => (
                  <tr key={country}>
                    <td>{country}</td>
                    <td style={{ textAlign: "right", color: "var(--gnz-gold)" }}>{count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRecentVisitors = () => {
    const visitors = analytics?.recentVisitors || [];
    return (
      <div style={{ marginTop: "2rem" }}>
        <h3 className="admin-h3" style={{ marginBottom: "1.5rem" }}>Visiteurs Récents</h3>
        <div className="admin-card" style={{ maxHeight: "500px", overflow: "auto" }}>
          {visitors.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Visiteur</th>
                  <th>Device</th>
                  <th>Pays</th>
                  <th style={{ textAlign: "right" }}>Événements</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id.slice(0, 12)}...</td>
                    <td>{v.device}</td>
                    <td>{v.country}</td>
                    <td style={{ textAlign: "right", color: "var(--gnz-gold)" }}>{v.eventCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
              Pas de visiteurs
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRecentEvents = () => {
    const events = analytics?.recentEvents || [];
    return (
      <div style={{ marginTop: "2rem" }}>
        <h3 className="admin-h3" style={{ marginBottom: "1.5rem" }}>Événements Récents</h3>
        <div className="admin-card" style={{ maxHeight: "500px", overflow: "auto" }}>
          {events.length > 0 ? (
            <div>
              {events.map((e) => (
                <div key={e.id} style={{ padding: "1rem", borderBottom: "1px solid var(--gnz-border-light)", fontSize: "0.875rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "var(--gnz-gold)" }}>{e.type}</span>
                    <span style={{ color: "var(--gnz-text-secondary)" }}>
                      {new Date(e.timestamp).toLocaleTimeString("fr-FR")}
                    </span>
                  </div>
                  <div style={{ color: "var(--gnz-text-secondary)" }}>{e.page}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
              Pas d'événements
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {["visiteurs", "stats", "events"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "admin-btn" : "admin-btn-secondary"}
            style={{ fontSize: "0.75rem" }}>
            {tab === "visiteurs" ? "Visiteurs" : tab === "stats" ? "Statistiques" : "Événements"}
          </button>
        ))}
        <button onClick={handleClear} className="admin-btn-danger" style={{ marginLeft: "auto", fontSize: "0.75rem" }}>
          Effacer
        </button>
      </div>

      {activeTab === "visiteurs" && renderRecentVisitors()}
      {activeTab === "stats" && (
        <>
          {renderDeviceStats()}
          {renderCountryStats()}
        </>
      )}
      {activeTab === "events" && renderRecentEvents()}
    </div>
  );
};

export default AdminAnalytics;
