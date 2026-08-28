import { useEffect, useState } from "react";
import { getDashboardData } from "../../services/adminData.js";
import { getReportingData } from "../../services/adminReporting.js";
import "../../styles/admin-v2.css";

const fmt = new Intl.NumberFormat("fr-FR");
const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const Funnel = ({ data }) => {
  const steps = [
    ["Visiteurs", data?.visitors || 0],
    ["Formules consultées", data?.packages_viewed || 0],
    ["Clics réservation", data?.booking_clicks || 0],
    ["Formulaires commencés", data?.form_starts || 0],
    ["Prospects", data?.leads || 0],
    ["RDV confirmés", data?.bookings || 0],
    ["Clients", data?.customers || 0],
  ];
  const max = Math.max(1, ...steps.map(([, value]) => Number(value)));
  return <div className="gnz-funnel">{steps.map(([label, value]) => (
    <div className="gnz-funnel-step" key={label}><span>{label}</span><div className="gnz-funnel-track"><div className="gnz-funnel-fill" style={{ width: `${Math.max(1, Number(value) / max * 100)}%` }} /></div><strong>{fmt.format(value)}</strong></div>
  ))}</div>;
};

const AdminAnalytics = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getDashboardData(days), getReportingData(days)])
      .then(([dashboard, reporting]) => { if (active) { setData(dashboard); setReport(reporting); setError(""); } })
      .catch((err) => active && setError(err?.message || "Impossible de charger les analytics."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [days]);

  const k = data?.current || {};
  return (
    <div>
      <div className="gnz-page-heading">
        <div><h1>Analytics</h1><p>Mesure du comportement réellement capté sur GaspardNZ, sans statistiques simulées.</p></div>
        <div className="gnz-page-actions">
          <span className="gnz-live-pill"><span className="gnz-live-dot" />{fmt.format(data?.activeVisitors || 0)} actif{data?.activeVisitors === 1 ? "" : "s"}</span>
          <select className="gnz-select" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value="7">7 jours</option><option value="30">30 jours</option><option value="90">90 jours</option></select>
        </div>
      </div>
      {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
      {loading && !data ? <div className="gnz-empty-state">Chargement…</div> : <>
        <section className="gnz-kpi-grid">
          <article className="gnz-kpi-card"><span className="gnz-kpi-label">Visiteurs uniques</span><div className="gnz-kpi-value">{fmt.format(k.visitors || 0)}</div><div className="gnz-kpi-sub">Identifiants visiteurs distincts</div></article>
          <article className="gnz-kpi-card"><span className="gnz-kpi-label">Sessions</span><div className="gnz-kpi-value">{fmt.format(k.sessions || 0)}</div><div className="gnz-kpi-sub">Sessions enregistrées</div></article>
          <article className="gnz-kpi-card"><span className="gnz-kpi-label">Conversion site</span><div className="gnz-kpi-value">{Number(k.site_conversion_rate || 0).toFixed(2)}%</div><div className="gnz-kpi-sub">Prospects / visiteurs uniques</div></article>
          <article className="gnz-kpi-card"><span className="gnz-kpi-label">Conversion commerciale</span><div className="gnz-kpi-value">{Number(k.sales_conversion_rate || 0).toFixed(2)}%</div><div className="gnz-kpi-sub">Clients / prospects</div></article>
        </section>

        <section className="gnz-section-grid">
          <article className="gnz-card gnz-col-7"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Tunnel de conversion</strong><span>Chaque étape provient d'un événement ou d'une entité réelle</span></div></header><div className="gnz-card-body"><Funnel data={report?.funnel || {}} /></div></article>
          <article className="gnz-card gnz-col-5"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Indicateurs d'intention</strong><span>Actions à forte valeur</span></div></header><div className="gnz-card-body"><div className="gnz-metric-mini-grid"><div className="gnz-metric-mini"><span>Clics WhatsApp</span><strong>{fmt.format(k.whatsapp_clicks || 0)}</strong></div><div className="gnz-metric-mini"><span>Clics promo</span><strong>{fmt.format(k.promo_clicks || 0)}</strong></div><div className="gnz-metric-mini"><span>Prospects</span><strong>{fmt.format(k.leads || 0)}</strong></div><div className="gnz-metric-mini"><span>Valeur clients</span><strong>{money.format(Number(k.revenue || 0))}</strong></div></div></div></article>
        </section>

        <section className="gnz-section-grid">
          <article className="gnz-card gnz-col-7"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Acquisition → business</strong><span>Sources enregistrées et valeur commerciale attribuée</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Source</th><th>Visiteurs</th><th>Prospects</th><th>Clients</th><th>Valeur</th><th>Conv. visite→lead</th></tr></thead><tbody>{(report?.acquisition || []).length ? report.acquisition.map((row) => <tr key={row.source}><td><strong>{row.source}</strong></td><td>{fmt.format(row.visitors || 0)}</td><td>{fmt.format(row.leads || 0)}</td><td>{fmt.format(row.customers || 0)}</td><td>{money.format(Number(row.revenue || 0))}</td><td>{Number(row.visitors || 0) ? `${(Number(row.leads || 0) / Number(row.visitors) * 100).toFixed(2)}%` : "0%"}</td></tr>) : <tr><td colSpan="6"><div className="gnz-empty-state">Aucune attribution disponible pour le moment.</div></td></tr>}</tbody></table></div></article>
          <article className="gnz-card gnz-col-5"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Pages les plus vues</strong><span>Événements page_view enregistrés</span></div></header><div className="gnz-table-wrap"><table className="gnz-table" style={{ minWidth: 420 }}><thead><tr><th>Page</th><th>Vues</th><th>Visiteurs</th></tr></thead><tbody>{(report?.topPages || []).length ? report.topPages.map((row) => <tr key={row.page_path}><td><strong>{row.page_path}</strong></td><td>{fmt.format(row.views || 0)}</td><td>{fmt.format(row.visitors || 0)}</td></tr>) : <tr><td colSpan="3"><div className="gnz-empty-state">Les pages apparaîtront dès que le nouveau tracking sera déployé.</div></td></tr>}</tbody></table></div></article>
        </section>
      </>}
    </div>
  );
};

export default AdminAnalytics;
