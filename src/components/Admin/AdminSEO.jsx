import { useEffect, useMemo, useState } from "react";
import { getGoogleSnapshots, getIntegrationSettings } from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const fmt = new Intl.NumberFormat("fr-FR");
const pct = (n) => `${Number(n || 0).toFixed(2)}%`;

export default function AdminSEO() {
  const [integrations, setIntegrations] = useState([]);
  const [searchRows, setSearchRows] = useState([]);
  const [analyticsRows, setAnalyticsRows] = useState([]);
  const [days, setDays] = useState(28);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([getIntegrationSettings(), getGoogleSnapshots("google_search_console", days), getGoogleSnapshots("google_analytics", days)])
      .then(([i,s,a]) => { if (alive) { setIntegrations(i); setSearchRows(s); setAnalyticsRows(a); setError(""); } })
      .catch((e) => alive && setError(e?.message || "Impossible de charger les données Google."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [days]);

  const gsc = integrations.find((i) => i.provider === "google_search_console");
  const ga = integrations.find((i) => i.provider === "google_analytics");
  const searchTotals = useMemo(() => searchRows.filter((r) => r.dimension_key === "all").reduce((acc,row) => {
    acc.clicks += Number(row.metrics?.clicks || 0); acc.impressions += Number(row.metrics?.impressions || 0); acc.positionWeighted += Number(row.metrics?.position || 0) * Number(row.metrics?.impressions || 0); return acc;
  }, { clicks:0, impressions:0, positionWeighted:0 }), [searchRows]);
  const ctr = searchTotals.impressions ? searchTotals.clicks / searchTotals.impressions * 100 : 0;
  const position = searchTotals.impressions ? searchTotals.positionWeighted / searchTotals.impressions : 0;
  const queries = searchRows.filter((r) => r.dimension_key === "query").sort((a,b) => Number(b.metrics?.clicks || 0) - Number(a.metrics?.clicks || 0)).slice(0,20);
  const pages = searchRows.filter((r) => r.dimension_key === "page").sort((a,b) => Number(b.metrics?.clicks || 0) - Number(a.metrics?.clicks || 0)).slice(0,20);

  return <div>
    <div className="gnz-page-heading"><div><h1>Acquisition & SEO</h1><p>Google Analytics 4 + Search Console, reliés au pilotage commercial GaspardNZ.</p></div><div className="gnz-page-actions"><select className="gnz-select" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value="7">7 jours</option><option value="28">28 jours</option><option value="90">90 jours</option></select></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-integration-grid" style={{ marginBottom: 12 }}>
      <article className="gnz-integration-card"><div className="gnz-integration-card-head"><div><h3>Google Search Console</h3><p>{gsc?.site_url || "https://gaspardnz.style"}<br/>{gsc?.account_label || "Compte Google"}</p></div><span className={`gnz-status ${gsc?.status === "connected" ? "success" : "warning"}`}>{gsc?.status === "connected" ? "Connecté" : "Autorisation requise"}</span></div>{gsc?.last_sync_at && <p>Dernière synchronisation : {new Date(gsc.last_sync_at).toLocaleString("fr-FR")}</p>}</article>
      <article className="gnz-integration-card"><div className="gnz-integration-card-head"><div><h3>Google Analytics 4</h3><p>{ga?.property_id ? `Propriété ${ga.property_id}` : "Propriété GaspardNZ"}<br/>{ga?.account_label || "Compte Google"}</p></div><span className={`gnz-status ${ga?.status === "connected" ? "success" : "warning"}`}>{ga?.status === "connected" ? "Connecté" : "Autorisation requise"}</span></div>{ga?.last_sync_at && <p>Dernière synchronisation : {new Date(ga.last_sync_at).toLocaleString("fr-FR")}</p>}</article>
    </div>

    {gsc?.status !== "connected" || ga?.status !== "connected" ? <div className="gnz-alert" style={{ color: "var(--gnz-muted)", border: "1px solid rgba(205,169,75,.16)", background: "rgba(205,169,75,.035)" }}><strong style={{ color: "var(--gnz-gold-soft)" }}>Connexion Google préparée mais non autorisée.</strong><br/>Cette page n'affichera jamais de chiffres fictifs. Dès que l'autorisation OAuth du compte propriétaire est réalisée, les snapshots Google seront stockés et affichés ici.</div> : null}

    <section className="gnz-kpi-grid" style={{ marginTop: 12 }}>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Clics Google</span><div className="gnz-kpi-value">{fmt.format(searchTotals.clicks)}</div><div className="gnz-kpi-sub">Search Console</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Impressions Google</span><div className="gnz-kpi-value">{fmt.format(searchTotals.impressions)}</div><div className="gnz-kpi-sub">Search Console</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">CTR moyen</span><div className="gnz-kpi-value">{pct(ctr)}</div><div className="gnz-kpi-sub">Clics / impressions</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Position moyenne</span><div className="gnz-kpi-value">{position ? position.toFixed(1) : "—"}</div><div className="gnz-kpi-sub">Pondérée par impressions</div></article>
    </section>

    <section className="gnz-section-grid">
      <article className="gnz-card gnz-col-6"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Requêtes Google</strong><span>Mots-clés remontés par Search Console</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Requête</th><th>Clics</th><th>Impressions</th><th>CTR</th><th>Position</th></tr></thead><tbody>{loading ? <tr><td colSpan="5"><div className="gnz-empty-state">Chargement…</div></td></tr> : queries.length ? queries.map((row,i) => <tr key={`${row.metric_date}-${row.dimension_value}-${i}`}><td><strong>{row.dimension_value}</strong></td><td>{fmt.format(row.metrics?.clicks || 0)}</td><td>{fmt.format(row.metrics?.impressions || 0)}</td><td>{pct(Number(row.metrics?.ctr || 0) * (Number(row.metrics?.ctr || 0) <= 1 ? 100 : 1))}</td><td>{Number(row.metrics?.position || 0).toFixed(1)}</td></tr>) : <tr><td colSpan="5"><div className="gnz-empty-state">Aucune donnée Search Console synchronisée.</div></td></tr>}</tbody></table></div></article>
      <article className="gnz-card gnz-col-6"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Pages depuis Google</strong><span>Landing pages SEO les plus performantes</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Page</th><th>Clics</th><th>Impressions</th><th>CTR</th></tr></thead><tbody>{pages.length ? pages.map((row,i) => <tr key={`${row.metric_date}-${row.dimension_value}-${i}`}><td><strong>{String(row.dimension_value).replace("https://gaspardnz.style", "") || "/"}</strong></td><td>{fmt.format(row.metrics?.clicks || 0)}</td><td>{fmt.format(row.metrics?.impressions || 0)}</td><td>{pct(Number(row.metrics?.ctr || 0) * (Number(row.metrics?.ctr || 0) <= 1 ? 100 : 1))}</td></tr>) : <tr><td colSpan="4"><div className="gnz-empty-state">Aucune page Google synchronisée.</div></td></tr>}</tbody></table></div></article>
    </section>

    <article className="gnz-card" style={{ marginTop: 12 }}><header className="gnz-card-header"><div className="gnz-card-title"><strong>Google Analytics 4</strong><span>Les lignes ci-dessous sont exclusivement les données synchronisées via l'API GA4</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Date</th><th>Dimension</th><th>Valeur</th><th>Métriques</th></tr></thead><tbody>{analyticsRows.length ? analyticsRows.slice(-50).reverse().map((row,i) => <tr key={`${row.metric_date}-${row.dimension_key}-${row.dimension_value}-${i}`}><td>{row.metric_date}</td><td>{row.dimension_key}</td><td>{row.dimension_value}</td><td>{Object.entries(row.metrics || {}).map(([key,value]) => `${key}: ${value}`).join(" · ")}</td></tr>) : <tr><td colSpan="4"><div className="gnz-empty-state">Aucune donnée GA4 synchronisée tant que Google n'est pas autorisé.</div></td></tr>}</tbody></table></div></article>
  </div>;
}
