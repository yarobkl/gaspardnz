import { useEffect, useState } from "react";
import { getAnalyticsData, clearAnalytics } from "../../services/adminAnalytics.js";

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
        <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
          Appareils
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
          {Object.entries(stats).map(([device, count]) => (
            <div
              key={device}
              style={{
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "8px",
                padding: "1rem",
              }}>
              <p style={{ fontSize: "12px", color: "rgba(250,247,242,0.6)", margin: 0 }}>{device}</p>
              <p style={{ fontSize: "1.8rem", color: "#b8973e", margin: "0.5rem 0 0 0" }}>{count}</p>
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
        <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
          Pays
        </h3>
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(184,151,62,0.2)",
            borderRadius: "8px",
            overflow: "hidden",
          }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(stats)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => (
                  <tr key={country} style={{ borderBottom: "1px solid rgba(184,151,62,0.1)" }}>
                    <td style={{ padding: "1rem", fontSize: "13px" }}>{country}</td>
                    <td style={{ padding: "1rem", textAlign: "right", fontSize: "13px", color: "#b8973e" }}>
                      {count}
                    </td>
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
        <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
          Visiteurs Récents
        </h3>
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(184,151,62,0.2)",
            borderRadius: "8px",
            maxHeight: "500px",
            overflow: "auto",
          }}>
          {visitors.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(184,151,62,0.1)", position: "sticky", top: 0, background: "rgba(0,0,0,0.5)" }}>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>
                    Visiteur
                  </th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>
                    Device
                  </th>
                  <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>
                    Pays
                  </th>
                  <th style={{ padding: "1rem", textAlign: "right", fontSize: "12px", color: "#b8973e" }}>
                    Événements
                  </th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid rgba(184,151,62,0.1)" }}>
                    <td style={{ padding: "1rem", fontSize: "12px", color: "rgba(250,247,242,0.8)" }}>
                      {v.id.slice(0, 12)}...
                    </td>
                    <td style={{ padding: "1rem", fontSize: "12px" }}>{v.device}</td>
                    <td style={{ padding: "1rem", fontSize: "12px" }}>{v.country}</td>
                    <td style={{ padding: "1rem", fontSize: "12px", textAlign: "right", color: "#b8973e" }}>
                      {v.eventCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(250,247,242,0.4)" }}>
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
        <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>
          Événements Récents
        </h3>
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(184,151,62,0.2)",
            borderRadius: "8px",
            maxHeight: "500px",
            overflow: "auto",
          }}>
          {events.length > 0 ? (
            <div>
              {events.map((e) => (
                <div
                  key={e.id}
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid rgba(184,151,62,0.1)",
                    fontSize: "12px",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ color: "#b8973e" }}>{e.type}</span>
                    <span style={{ color: "rgba(250,247,242,0.4)" }}>
                      {new Date(e.timestamp).toLocaleTimeString("fr-FR")}
                    </span>
                  </div>
                  <div style={{ color: "rgba(250,247,242,0.6)" }}>{e.page}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(250,247,242,0.4)" }}>
              Pas d'événements
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
        {["visiteurs", "stats", "events"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.6rem 1.2rem",
              background: activeTab === tab ? "#b8973e" : "rgba(184,151,62,0.1)",
              border: "1px solid rgba(184,151,62,0.3)",
              color: activeTab === tab ? "#0a0602" : "#b8973e",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
            {tab === "visiteurs"
              ? "Visiteurs"
              : tab === "stats"
                ? "Statistiques"
                : "Événements"}
          </button>
        ))}
        <button
          onClick={handleClear}
          style={{
            marginLeft: "auto",
            padding: "0.6rem 1.2rem",
            background: "rgba(200,50,50,0.1)",
            border: "1px solid rgba(200,50,50,0.3)",
            color: "#ff6b6b",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
          }}>
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
