import MetricDetails from "./components/MetricDetails.jsx";
import { useCallback, useEffect, useState } from "react";
import { getDashboardData, getGoogleSnapshots, getIntegrationSettings, subscribeDashboard } from "../../services/adminData.js";
import { getReportingData } from "../../services/adminReporting.js";
import { supabase } from "../../services/supabaseClient.js";
import "../../styles/admin-v2.css";

const fmt = new Intl.NumberFormat("fr-FR");
const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const Funnel = ({ data, onSelect }) => {
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
    <button type="button" onClick={()=>onSelect(label)} className="gnz-funnel-step" key={label}><span>{label}</span><div className="gnz-funnel-track"><div className="gnz-funnel-fill" style={{ width: `${Math.max(1, Number(value) / max * 100)}%` }} /></div><strong>{fmt.format(value)}</strong></button>
  ))}</div>;
};

const AdminAnalytics = () => {
  const [metric, setMetric] = useState(null);
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);
  const [google, setGoogle] = useState({ integration: null, realtime: null });
  const [loading, setLoading] = useState(true);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    Promise.all([getDashboardData(days), getReportingData(days), getIntegrationSettings(), getGoogleSnapshots("google_analytics", 2)])
      .then(([dashboard, reporting, integrations, snapshots]) => {
        if (!active) return;
        setData(dashboard); setReport(reporting);
        setGoogle({ integration: integrations.find((item) => item.provider === "google_analytics") || null, realtime: snapshots.find((item) => item.dimension_key === "realtime") || null });
        setError("");
      })
      .catch((err) => active && setError(err?.message || "Impossible de charger les analytics."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [days]);

  useEffect(() => load(), [load]);
  useEffect(() => subscribeDashboard(() => load()), [load]);

  const syncGoogle = async () => {
    setSyncingGoogle(true); setError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Session administrateur expirée. Reconnectez-vous.");
      const response = await fetch("/api/google/sync", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ days }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || payload.analytics?.error || "Synchronisation Google impossible.");
      load();
    } catch (err) {
      setError(err?.message || "Synchronisation Google impossible.");
    } finally { setSyncingGoogle(false); }
  };

  const k = data?.current || {};
  const show = (key,label) => setMetric({key,label});
  const clickable = (key,label) => ({ role:'button',tabIndex:0,onClick:()=>show(key,label),onKeyDown:e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();show(key,label);}} });
  return (
    <div>
      <div className="gnz-page-heading">
        <div><h1>Analytics</h1><p>Événements du site en direct et données GA4 officielles, sans chiffres simulés.</p></div>
        <div className="gnz-page-actions">
          <span className="gnz-live-pill"><span className="gnz-live-dot" />{fmt.format(data?.activeVisitors || 0)} actif{data?.activeVisitors === 1 ? "" : "s"}</span>
          <select className="gnz-select" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value="7">7 jours</option><option value="30">30 jours</option><option value="90">90 jours</option></select>
          {google.integration?.status === "connected" && <button type="button" className="gnz-secondary-button" onClick={syncGoogle} disabled={syncingGoogle}>{syncingGoogle ? "Mise à jour…" : "Actualiser GA4"}</button>}
        </div>
      </div>
      {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
      {loading && !data ? <div className="gnz-empty-state">Chargement…</div> : <>
        <section className="gnz-card" style={{ marginBottom: 12 }}>
          <div className="gnz-card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div><strong>Données Google Analytics 4</strong><div className="gnz-kpi-sub">{google.integration?.status === "connected" ? `Source officielle Google${google.realtime ? ` · ${fmt.format(google.realtime.metrics?.activeUsers || 0)} utilisateurs actifs lors de la dernière mise à jour` : " · en attente de la première synchronisation"}` : "Connexion Google requise : aucun chiffre GA4 n’est affiché ni inventé."}</div></div>
            <a className="gnz-secondary-button" href="/admin/seo">{google.integration?.status === "connected" ? "Voir le détail Google" : "Connecter Google"}</a>
          </div>
        </section>
        <section className="gnz-kpi-grid">
          <article className="gnz-kpi-card" {...clickable("visitors","Visiteurs uniques")}><span className="gnz-kpi-label">Visiteurs uniques</span><div className="gnz-kpi-value">{fmt.format(k.visitors || 0)}</div><div className="gnz-kpi-sub">Identifiants visiteurs distincts</div></article>
          <article className="gnz-kpi-card" {...clickable("sessions","Sessions")}><span className="gnz-kpi-label">Sessions</span><div className="gnz-kpi-value">{fmt.format(k.sessions || 0)}</div><div className="gnz-kpi-sub">Sessions enregistrées</div></article>
          <article className="gnz-kpi-card" {...clickable("site_conversion_rate","Conversion site")}><span className="gnz-kpi-label">Conversion site</span><div className="gnz-kpi-value">{k.site_conversion_rate == null ? "—" : `${Number(k.site_conversion_rate).toFixed(2)}%`}</div><div className="gnz-kpi-sub">Visiteurs reliés à un prospect / visiteurs suivis</div></article>
          <article className="gnz-kpi-card" {...clickable("sales_conversion_rate","Conversion commerciale")}><span className="gnz-kpi-label">Conversion commerciale</span><div className="gnz-kpi-value">{k.sales_conversion_rate == null ? "—" : `${Number(k.sales_conversion_rate).toFixed(2)}%`}</div><div className="gnz-kpi-sub">Prospects de la période devenus clients / cohorte</div></article>
        </section>

        <MetricDetails key={`${metric?.key}-${days}`} metric={metric} data={data} onClose={()=>setMetric(null)} />
        <section className="gnz-section-grid">
          <article className="gnz-card gnz-col-7"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Tunnel de conversion</strong><span>Chaque étape provient d'un événement ou d'une entité réelle</span></div></header><div className="gnz-card-body"><Funnel data={data?.funnel || {}} onSelect={label=>show(({Visiteurs:'visitors','Formules consultées':'packages_viewed','Clics réservation':'booking_clicks','Formulaires commencés':'form_starts',Prospects:'leads','RDV confirmés':'confirmed_bookings',Clients:'customers'})[label],label)} /></div></article>
          <article className="gnz-card gnz-col-5"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Indicateurs d'intention</strong><span>Actions à forte valeur</span></div></header><div className="gnz-card-body"><div className="gnz-metric-mini-grid"><div className="gnz-metric-mini" {...clickable("whatsapp_clicks","Clics WhatsApp")}><span>Clics WhatsApp</span><strong>{fmt.format(k.whatsapp_clicks || 0)}</strong></div><div className="gnz-metric-mini" {...clickable("promo_clicks","Clics promo")}><span>Clics promo</span><strong>{fmt.format(k.promo_clicks || 0)}</strong></div><div className="gnz-metric-mini" {...clickable("leads","Prospects")}><span>Prospects</span><strong>{fmt.format(k.leads || 0)}</strong></div><div className="gnz-metric-mini" {...clickable("revenue","Valeur clients")}><span>Valeur clients</span><strong>{money.format(Number(k.revenue || 0))}</strong></div></div></div></article>
        </section>

        <section className="gnz-section-grid">
          <article className="gnz-card gnz-col-7"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Acquisition → business</strong><span>Sources enregistrées et valeur commerciale attribuée</span></div></header><div className="gnz-table-wrap"><table className="gnz-table" style={{ minWidth: 600 }}><thead><tr><th>Source</th><th>Visiteurs</th><th>Prospects</th><th>Clients</th><th>Valeur</th><th>Attribution</th></tr></thead><tbody>{(data?.acquisition || []).length ? data.acquisition.map((row) => <tr key={row.source}><td><strong>{row.source}</strong></td><td>{fmt.format(row.visitors || 0)}</td><td>{fmt.format(row.leads || 0)}</td><td>{fmt.format(row.customers || 0)}</td><td>{money.format(Number(row.revenue || 0))}</td><td>Source déclarée</td></tr>) : <tr><td colSpan="6"><div className="gnz-empty-state">Aucune attribution disponible pour le moment.</div></td></tr>}</tbody></table></div></article>
          <article className="gnz-card gnz-col-5"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Pages les plus vues</strong><span>Événements page_view enregistrés</span></div></header><div className="gnz-table-wrap"><table className="gnz-table" style={{ minWidth: 420 }}><thead><tr><th>Page</th><th>Vues</th><th>Visiteurs</th></tr></thead><tbody>{(report?.topPages || []).length ? report.topPages.map((row) => <tr key={row.page_path}><td><strong>{row.page_path}</strong></td><td>{fmt.format(row.views || 0)}</td><td>{fmt.format(row.visitors || 0)}</td></tr>) : <tr><td colSpan="3"><div className="gnz-empty-state">Les pages apparaîtront dès que le nouveau tracking sera déployé.</div></td></tr>}</tbody></table></div></article>
        </section>
      </>}
    </div>
  );
};

export default AdminAnalytics;
