import { useCallback, useEffect, useMemo, useState } from "react";
import { getDashboardData, subscribeDashboard } from "../../services/adminData.js";
import { getEmailSummary, getReportingData } from "../../services/adminReporting.js";
import "../../styles/admin-v2.css";

const fmt = new Intl.NumberFormat("fr-FR");
const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function Trend({ value }) {
  if (value === null || value === undefined) return <span className="gnz-trend">nouvelle donnée</span>;
  const positive = value > 0;
  const negative = value < 0;
  return <span className={`gnz-trend ${positive ? "positive" : negative ? "negative" : ""}`}>{positive ? "+" : ""}{value}%</span>;
}

function Kpi({ label, value, trend, sub, onClick }) {
  return (
    <article className="gnz-kpi-card" data-clickable={Boolean(onClick)} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="gnz-kpi-top"><span className="gnz-kpi-label">{label}</span><Trend value={trend} /></div>
      <div className="gnz-kpi-value">{value}</div>
      <div className="gnz-kpi-sub">{sub}</div>
    </article>
  );
}

function LineChart({ rows }) {
  const points = useMemo(() => {
    if (!rows?.length) return [];
    const values = rows.map((r) => Number(r.visitors || 0));
    const max = Math.max(1, ...values);
    return rows.map((row, index) => ({
      x: rows.length === 1 ? 50 : (index / (rows.length - 1)) * 100,
      y: 92 - (Number(row.visitors || 0) / max) * 78,
      value: Number(row.visitors || 0),
      label: new Date(`${row.day}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    }));
  }, [rows]);
  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = points.length ? `M ${points[0].x} 96 L ${points.map((p) => `${p.x} ${p.y}`).join(" L ")} L ${points.at(-1).x} 96 Z` : "";
  if (!points.length) return <div className="gnz-empty-state">Aucune donnée de trafic sur cette période.</div>;
  return (
    <>
      <div className="gnz-chart-wrap">
        <svg className="gnz-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Évolution des visiteurs">
          <defs><linearGradient id="gnzArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#cdaa4f" stopOpacity=".22"/><stop offset="100%" stopColor="#cdaa4f" stopOpacity="0"/></linearGradient></defs>
          {[20,40,60,80].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} className="gnz-chart-grid-line" />)}
          <path d={area} className="gnz-chart-area" />
          <polyline points={line} className="gnz-chart-line" />
          {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="1.15" className="gnz-chart-dot"><title>{p.label}: {fmt.format(p.value)} visiteurs</title></circle>)}
        </svg>
      </div>
      <div className="gnz-chart-labels"><span>{points[0]?.label}</span><span>{points[Math.floor(points.length / 2)]?.label}</span><span>{points.at(-1)?.label}</span></div>
    </>
  );
}

const relativeTime = (date) => {
  if (!date) return "";
  const seconds = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return `il y a ${seconds}s`;
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

const integrationLabel = (provider) => ({
  google_analytics: "Google Analytics 4",
  google_search_console: "Google Search Console",
  calendly: "Calendly",
  email_provider: "Emails",
}[provider] || provider);

const AdminDashboard = ({ onNavigate }) => {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [reporting, setReporting] = useState(null);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    try {
      const [dashboard, report, emailSummary] = await Promise.all([
        getDashboardData(days),
        getReportingData(days),
        getEmailSummary(days),
      ]);
      setData(dashboard);
      setReporting(report);
      setEmail(emailSummary);
      setError("");
    } catch (err) {
      setError(err?.message || "Impossible de charger le tableau de bord.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => subscribeDashboard(() => load({ quiet: true })), [load]);

  if (loading && !data) return <div className="gnz-card"><div className="gnz-empty-state">Chargement des données réelles…</div></div>;

  const k = data?.current || {};
  const changes = data?.changes || {};
  const totalTraffic = Math.max(1, ...(data?.traffic || []).map((r) => Number(r.visitors || 0)));
  const ga = data?.integrations?.find((i) => i.provider === "google_analytics");
  const gsc = data?.integrations?.find((i) => i.provider === "google_search_console");

  return (
    <div>
      <div className="gnz-page-heading">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue opérationnelle de GaspardNZ. Les valeurs ci-dessous proviennent de la base réelle.</p>
        </div>
        <div className="gnz-page-actions">
          <span className="gnz-live-pill"><span className="gnz-live-dot" />{fmt.format(data?.activeVisitors || 0)} actif{data?.activeVisitors === 1 ? "" : "s"} · 5 min</span>
          <select className="gnz-select" value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Période">
            <option value={1}>Aujourd'hui / 24 h</option>
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
          </select>
          <button className="gnz-secondary-button" onClick={() => load()}>Actualiser</button>
        </div>
      </div>

      {error && <div className="gnz-alert gnz-alert-error">{error}</div>}

      <section className="gnz-kpi-grid" aria-label="Indicateurs principaux">
        <Kpi label="Visiteurs uniques" value={fmt.format(k.visitors || 0)} trend={changes.visitors} sub="Visiteurs identifiés sur la période" onClick={() => onNavigate?.("analytics")} />
        <Kpi label="Demandes reçues" value={fmt.format(k.leads || 0)} trend={changes.leads} sub="Prospects réellement créés dans le CRM" onClick={() => onNavigate?.("crm")} />
        <Kpi label="Réservations confirmées" value={fmt.format(k.confirmed_bookings || 0)} trend={changes.confirmed_bookings} sub="Rendez-vous au statut confirmé" onClick={() => onNavigate?.("bookings")} />
        <Kpi label="Conversion site" value={`${Number(k.site_conversion_rate || 0).toFixed(2)}%`} trend={null} sub="Visiteurs convertis en prospects" onClick={() => onNavigate?.("analytics")} />
      </section>

      <section className="gnz-dashboard-grid">
        <article className="gnz-card">
          <header className="gnz-card-header"><div className="gnz-card-title"><strong>Visiteurs & activité</strong><span>Visiteurs uniques par jour</span></div><span className="gnz-status info">Supabase</span></header>
          <div className="gnz-card-body"><LineChart rows={reporting?.timeseries || []} /></div>
        </article>
        <article className="gnz-card">
          <header className="gnz-card-header"><div className="gnz-card-title"><strong>Sources de trafic</strong><span>Attribution enregistrée sur le site</span></div></header>
          <div className="gnz-card-body">
            {(data?.traffic || []).length ? <div className="gnz-source-list">{data.traffic.slice(0,7).map((row) => (
              <div className="gnz-source-row" key={row.source}><strong>{row.source}</strong><div className="gnz-bar"><span style={{ width: `${Math.max(2, Number(row.visitors || 0) / totalTraffic * 100)}%` }} /></div><em>{fmt.format(row.visitors || 0)}</em></div>
            ))}</div> : <div className="gnz-empty-state">Aucune source enregistrée pour le moment.</div>}
          </div>
        </article>
      </section>

      <section className="gnz-section-grid">
        <article className="gnz-card gnz-col-7">
          <header className="gnz-card-header"><div className="gnz-card-title"><strong>Demandes récentes</strong><span>Les nouvelles demandes apparaissent automatiquement</span></div><button className="gnz-secondary-button" onClick={() => onNavigate?.("crm")}>Voir le CRM</button></header>
          <div className="gnz-table-wrap">
            <table className="gnz-table">
              <thead><tr><th>Client</th><th>Besoin</th><th>Source</th><th>Statut</th><th>Reçu</th></tr></thead>
              <tbody>{(data?.recentLeads || []).length ? data.recentLeads.map((lead) => (
                <tr key={lead.id}><td><strong>{lead.full_name || "Sans nom"}</strong><span className="gnz-table-sub">{lead.email || lead.phone || "Contact non renseigné"}</span></td><td>{lead.request_type || "Demande"}</td><td>{lead.source || lead.channel || "Site"}</td><td><span className={`gnz-status ${lead.status}`}>{lead.status}</span></td><td>{relativeTime(lead.created_at)}</td></tr>
              )) : <tr><td colSpan="5"><div className="gnz-empty-state">Aucune demande sur cette période.</div></td></tr>}</tbody>
            </table>
          </div>
        </article>

        <article className="gnz-card gnz-col-5">
          <header className="gnz-card-header"><div className="gnz-card-title"><strong>Activité en temps réel</strong><span>Événements métier, pas de données simulées</span></div></header>
          <div className="gnz-card-body">
            {(data?.activity || []).length ? <div className="gnz-activity-list">{data.activity.map((item) => (
              <div className="gnz-activity-item" key={item.id}><span className="gnz-activity-bullet"/><div className="gnz-activity-copy"><strong>{item.title}</strong><span>{item.description || item.event_type}</span></div><span className="gnz-activity-time">{relativeTime(item.created_at)}</span></div>
            ))}</div> : <div className="gnz-empty-state">L'activité apparaîtra ici dès la première interaction enregistrée.</div>}
          </div>
        </article>
      </section>

      <section className="gnz-section-grid">
        <article className="gnz-card gnz-col-4">
          <header className="gnz-card-header"><div className="gnz-card-title"><strong>Performance commerciale</strong><span>Du prospect au client</span></div></header>
          <div className="gnz-card-body">
            <div className="gnz-kpi-value">{Number(k.sales_conversion_rate || 0).toFixed(2)}%</div>
            <div className="gnz-kpi-sub">{fmt.format(k.customers || 0)} client(s) · {money.format(Number(k.revenue || 0))} de valeur enregistrée</div>
            <button className="gnz-secondary-button" style={{ marginTop: 14 }} onClick={() => onNavigate?.("crm")}>Analyser le CRM</button>
          </div>
        </article>
        <article className="gnz-card gnz-col-4">
          <header className="gnz-card-header"><div className="gnz-card-title"><strong>Emails</strong><span>Statuts réellement enregistrés</span></div><button className="gnz-secondary-button" onClick={() => onNavigate?.("emails")}>Détails</button></header>
          <div className="gnz-card-body">
            <div className="gnz-metric-mini-grid">
              <div className="gnz-metric-mini"><span>Envoyés</span><strong>{fmt.format(email?.sent || 0)}</strong></div>
              <div className="gnz-metric-mini"><span>Délivrés</span><strong>{fmt.format(email?.delivered || 0)}</strong></div>
              <div className="gnz-metric-mini"><span>Ouverts</span><strong>{fmt.format(email?.opened || 0)}</strong></div>
              <div className="gnz-metric-mini"><span>Échecs</span><strong>{fmt.format(email?.failed || 0)}</strong></div>
            </div>
          </div>
        </article>
        <article className="gnz-card gnz-col-4">
          <header className="gnz-card-header"><div className="gnz-card-title"><strong>Google</strong><span>État des connexions</span></div><button className="gnz-secondary-button" onClick={() => onNavigate?.("seo")}>Acquisition & SEO</button></header>
          <div className="gnz-card-body">
            <div className="gnz-activity-list">
              {[ga,gsc].filter(Boolean).map((item) => <div className="gnz-activity-item" key={item.provider}><span className="gnz-activity-bullet"/><div className="gnz-activity-copy"><strong>{integrationLabel(item.provider)}</strong><span>{item.account_label || "Compte non renseigné"}</span></div><span className={`gnz-status ${item.status === "connected" ? "success" : "warning"}`}>{item.status === "connected" ? "Connecté" : "À connecter"}</span></div>)}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminDashboard;
