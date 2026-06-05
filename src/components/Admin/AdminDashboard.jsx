import { useEffect, useState } from "react";
import { getAnalyticsData } from "../../services/adminAnalytics.js";
import { getLeadStats } from "../../services/adminCRM.js";
import { useTr } from "../../context.jsx";
import "../../styles/admin.css";

const StatCard = ({ label, value, subtext }) => (
  <div className="admin-kpi">
    <div className="admin-kpi-label">{label}</div>
    <div className="admin-kpi-value">{value}</div>
    {subtext && <div className="admin-kpi-change">{subtext}</div>}
  </div>
);

const AdminDashboard = () => {
  const t = useTr();
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
    return <div className="admin-small">{t("admin_loading")}</div>;
  }

  const overview = analytics?.overview || {};

  return (
    <div>
      <p className="admin-small">{t("admin_realtime_overview")}</p>

      <div className="admin-grid">
        <StatCard label={t("admin_total_visitors")} value={overview.totalVisitors || 0} />
        <StatCard label={t("admin_visitors_today")} value={overview.visitorsToday || 0} />
        <StatCard label={t("admin_total_events")} value={overview.totalEvents || 0} />
        <StatCard label={t("admin_events_24h")} value={overview.eventsToday || 0} />
      </div>

      <div className="admin-grid" style={{ marginTop: "2rem" }}>
        <StatCard label={t("admin_total_conversions")} value={overview.totalConversions || 0} />
        <StatCard label={t("admin_conversions_24h")} value={overview.conversionsToday || 0} />
        <StatCard label={t("admin_conversion_rate")} value={`${overview.conversionRate || 0}%`} />
      </div>

      <div className="admin-grid" style={{ marginTop: "2rem" }}>
        <StatCard label={t("admin_total_leads")} value={crm?.total || 0} />
        <StatCard label={t("admin_new_leads")} value={crm?.byStatus?.nouveau || 0} subtext={t("admin_to_contact")} />
        <StatCard label={t("admin_converted_leads")} value={crm?.byStatus?.converti || 0} />
      </div>

      <div style={{ marginTop: "3rem" }}>
        <h3 className="admin-h3" style={{ marginBottom: "1.5rem" }}>{t("admin_top_pages")}</h3>
        <div className="admin-card">
          {(analytics?.topPages || []).length > 0 ? (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t("admin_page")}</th>
                    <th style={{ textAlign: "right" }}>{t("admin_views")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.topPages || []).map((p) => (
                    <tr key={p.page}>
                      <td data-label={t("admin_page")}>{p.page}</td>
                      <td data-label={t("admin_views")} style={{ textAlign: "right", color: "var(--gnz-gold)" }}>{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
              {t("admin_no_data")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
