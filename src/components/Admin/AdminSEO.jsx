import { useCallback, useEffect, useMemo, useState } from "react";
import { getGoogleSnapshots, getIntegrationSettings } from "../../services/adminData.js";
import { supabase } from "../../services/supabaseClient.js";
import "../../styles/admin-v2.css";

const fmt = new Intl.NumberFormat("fr-FR");
const pct = (n) => `${Number(n || 0).toFixed(2)}%`;

export default function AdminSEO() {
  const [integrations, setIntegrations] = useState([]);
  const [searchRows, setSearchRows] = useState([]);
  const [analyticsRows, setAnalyticsRows] = useState([]);
  const [days, setDays] = useState(28);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [i, s, a] = await Promise.all([
        getIntegrationSettings(),
        getGoogleSnapshots("google_search_console", days),
        getGoogleSnapshots("google_analytics", days),
      ]);
      setIntegrations(i);
      setSearchRows(s);
      setAnalyticsRows(a);
      setError("");
    } catch (e) {
      setError(e?.message || "Impossible de charger les données Google.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const google = params.get("google");
    if (google === "connected") setNotice("Google Analytics et Search Console ont été autorisés. Lancez une synchronisation pour importer les données.");
    if (google === "partial") setNotice("Google a été autorisé, mais une des propriétés GaspardNZ n'a pas été identifiée automatiquement.");
    if (google === "error") setError(`Connexion Google non finalisée${params.get("reason") ? ` : ${params.get("reason")}` : "."}`);
    if (google) window.history.replaceState({}, "", "/admin/seo");
  }, []);

  const accessToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || "";
  };

  const connectGoogle = async () => {
    setAction("connect"); setError(""); setNotice("");
    try {
      const token = await accessToken();
      if (!token) throw new Error("Session administrateur expirée. Reconnectez-vous.");
      const response = await fetch("/api/google/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ redirectTo: "/admin/seo" }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.url) throw new Error(payload.error || "Impossible de démarrer l'autorisation Google.");
      window.location.assign(payload.url);
    } catch (e) {
      setError(e?.message || "Connexion Google impossible.");
      setAction("");
    }
  };

  const syncGoogle = async () => {
    setAction("sync"); setError(""); setNotice("");
    try {
      const token = await accessToken();
      if (!token) throw new Error("Session administrateur expirée. Reconnectez-vous.");
      const response = await fetch("/api/google/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || payload.analytics?.error || payload.searchConsole?.error || "Synchronisation Google impossible.");
      setNotice(`Synchronisation terminée : ${payload.analytics?.rows || 0} lignes GA4 et ${payload.searchConsole?.rows || 0} lignes Search Console.`);
      await load();
    } catch (e) {
      setError(e?.message || "Synchronisation Google impossible.");
    } finally {
      setAction("");
    }
  };

  const gsc = integrations.find((i) => i.provider === "google_search_console");
  const ga = integrations.find((i) => i.provider === "google_analytics");
  const connected = gsc?.status === "connected" || ga?.status === "connected";

  const searchTotals = useMemo(() => searchRows.filter((r) => r.dimension_key === "all").reduce((acc,row) => {
    acc.clicks += Number(row.metrics?.clicks || 0);
    acc.impressions += Number(row.metrics?.impressions || 0);
    acc.positionWeighted += Number(row.metrics?.position || 0) * Number(row.metrics?.impressions || 0);
    return acc;
  }, { clicks:0, impressions:0, positionWeighted:0 }), [searchRows]);
  const ctr = searchTotals.impressions ? searchTotals.clicks / searchTotals.impressions * 100 : 0;
  const position = searchTotals.impressions ? searchTotals.positionWeighted / searchTotals.impressions : 0;
  const queries = searchRows.filter((r) => r.dimension_key === "query").sort((a,b) => Number(b.metrics?.clicks || 0) - Number(a.metrics?.clicks || 0)).slice(0,20);
  const pages = searchRows.filter((r) => r.dimension_key === "page").sort((a,b) => Number(b.metrics?.clicks || 0) - Number(a.metrics?.clicks || 0)).slice(0,20);

  const gaTotals = useMemo(() => analyticsRows.filter((r) => r.dimension_key === "all").reduce((acc,row) => {
    for (const key of ["activeUsers","newUsers","sessions","screenPageViews","eventCount","engagedSessions"]) acc[key] += Number(row.metrics?.[key] || 0);
    acc.engagementWeighted += Number(row.metrics?.engagementRate || 0) * Number(row.metrics?.sessions || 0);
    acc.durationWeighted += Number(row.metrics?.averageSessionDuration || 0) * Number(row.metrics?.sessions || 0);
    return acc;
  }, { activeUsers:0,newUsers:0,sessions:0,screenPageViews:0,eventCount:0,engagedSessions:0,engagementWeighted:0,durationWeighted:0 }), [analyticsRows]);
  const realtime = analyticsRows.find((r) => r.dimension_key === "realtime" && r.dimension_value === "all");
  const gaEngagement = gaTotals.sessions ? gaTotals.engagementWeighted / gaTotals.sessions * 100 : 0;

  return <div>
    <div className="gnz-page-heading"><div><h1>Acquisition & SEO</h1><p>Google Analytics 4 + Search Console, reliés au pilotage commercial GaspardNZ.</p></div><div className="gnz-page-actions"><select className="gnz-select" value={days} onChange={(e) => setDays(Number(e.target.value))}><option value="7">7 jours</option><option value="28">28 jours</option><option value="90">90 jours</option></select><button type="button" className="gnz-secondary-button" onClick={connectGoogle} disabled={Boolean(action)}>{action === "connect" ? "Connexion…" : connected ? "Reconnecter Google" : "Connecter Google"}</button>{connected && <button type="button" className="gnz-primary-button" onClick={syncGoogle} disabled={Boolean(action)}>{action === "sync" ? "Synchronisation…" : "Synchroniser maintenant"}</button>}</div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    {notice && <div className="gnz-alert gnz-alert-success">{notice}</div>}

    <div className="gnz-integration-grid" style={{ marginBottom: 12 }}>
      <article className="gnz-integration-card"><div className="gnz-integration-card-head"><div><h3>Google Search Console</h3><p>{gsc?.site_url || "https://gaspardnz.style"}<br/>{gsc?.account_label || "eliebakala@gmail.com"}</p></div><span className={`gnz-status ${gsc?.status === "connected" ? "success" : gsc?.status === "error" ? "danger" : "warning"}`}>{gsc?.status === "connected" ? "Connecté" : gsc?.status === "error" ? "Erreur" : "Autorisation requise"}</span></div>{gsc?.last_sync_at && <p>Dernière synchronisation : {new Date(gsc.last_sync_at).toLocaleString("fr-FR")}</p>}{gsc?.last_error && <p className="gnz-danger-text">{gsc.last_error}</p>}</article>
      <article className="gnz-integration-card"><div className="gnz-integration-card-head"><div><h3>Google Analytics 4</h3><p>{ga?.property_id ? `Propriété ${ga.property_id}` : "Mesure G-N283W7662X"}<br/>{ga?.account_label || "eliebakala@gmail.com"}</p></div><span className={`gnz-status ${ga?.status === "connected" ? "success" : ga?.status === "error" ? "danger" : "warning"}`}>{ga?.status === "connected" ? "Connecté" : ga?.status === "error" ? "Erreur" : "Autorisation requise"}</span></div>{ga?.last_sync_at && <p>Dernière synchronisation : {new Date(ga.last_sync_at).toLocaleString("fr-FR")}</p>}{ga?.last_error && <p className="gnz-danger-text">{ga.last_error}</p>}</article>
    </div>

    {!connected && <div className="gnz-alert" style={{ color: "var(--gnz-muted)", border: "1px solid rgba(205,169,75,.16)", background: "rgba(205,169,75,.035)" }}><strong style={{ color: "var(--gnz-gold-soft)" }}>Aucun chiffre Google n'est simulé.</strong><br/>Cliquez sur « Connecter Google », autorisez le compte propriétaire puis lancez la synchronisation. Les données déjà présentes chez Google seront importées dans l'administration.</div>}

    <section className="gnz-kpi-grid" style={{ marginTop: 12 }}>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Utilisateurs GA4</span><div className="gnz-kpi-value">{fmt.format(gaTotals.activeUsers)}</div><div className="gnz-kpi-sub">{realtime ? `${fmt.format(realtime.metrics?.activeUsers || 0)} actifs maintenant` : "Google Analytics"}</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Sessions GA4</span><div className="gnz-kpi-value">{fmt.format(gaTotals.sessions)}</div><div className="gnz-kpi-sub">{fmt.format(gaTotals.screenPageViews)} vues de pages</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Engagement GA4</span><div className="gnz-kpi-value">{pct(gaEngagement)}</div><div className="gnz-kpi-sub">Pondéré par sessions</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Clics Google</span><div className="gnz-kpi-value">{fmt.format(searchTotals.clicks)}</div><div className="gnz-kpi-sub">{fmt.format(searchTotals.impressions)} impressions</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">CTR Search</span><div className="gnz-kpi-value">{pct(ctr)}</div><div className="gnz-kpi-sub">Clics / impressions</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Position moyenne</span><div className="gnz-kpi-value">{position ? position.toFixed(1) : "—"}</div><div className="gnz-kpi-sub">Pondérée par impressions</div></article>
    </section>

    <section className="gnz-section-grid">
      <article className="gnz-card gnz-col-6"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Requêtes Google</strong><span>Mots-clés remontés par Search Console</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Requête</th><th>Clics</th><th>Impressions</th><th>CTR</th><th>Position</th></tr></thead><tbody>{loading ? <tr><td colSpan="5"><div className="gnz-empty-state">Chargement…</div></td></tr> : queries.length ? queries.map((row,i) => <tr key={`${row.metric_date}-${row.dimension_value}-${i}`}><td><strong>{row.dimension_value}</strong></td><td>{fmt.format(row.metrics?.clicks || 0)}</td><td>{fmt.format(row.metrics?.impressions || 0)}</td><td>{pct(Number(row.metrics?.ctr || 0) * (Number(row.metrics?.ctr || 0) <= 1 ? 100 : 1))}</td><td>{Number(row.metrics?.position || 0).toFixed(1)}</td></tr>) : <tr><td colSpan="5"><div className="gnz-empty-state">Aucune donnée Search Console synchronisée.</div></td></tr>}</tbody></table></div></article>
      <article className="gnz-card gnz-col-6"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Pages depuis Google</strong><span>Landing pages SEO les plus performantes</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Page</th><th>Clics</th><th>Impressions</th><th>CTR</th></tr></thead><tbody>{pages.length ? pages.map((row,i) => <tr key={`${row.metric_date}-${row.dimension_value}-${i}`}><td><strong>{String(row.dimension_value).replace("https://gaspardnz.style", "") || "/"}</strong></td><td>{fmt.format(row.metrics?.clicks || 0)}</td><td>{fmt.format(row.metrics?.impressions || 0)}</td><td>{pct(Number(row.metrics?.ctr || 0) * (Number(row.metrics?.ctr || 0) <= 1 ? 100 : 1))}</td></tr>) : <tr><td colSpan="4"><div className="gnz-empty-state">Aucune page Google synchronisée.</div></td></tr>}</tbody></table></div></article>
    </section>

    <article className="gnz-card" style={{ marginTop: 12 }}><header className="gnz-card-header"><div className="gnz-card-title"><strong>Google Analytics 4 — données brutes synchronisées</strong><span>Uniquement des valeurs retournées par l'API officielle Google</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Date</th><th>Dimension</th><th>Valeur</th><th>Métriques</th></tr></thead><tbody>{analyticsRows.length ? analyticsRows.slice(-80).reverse().map((row,i) => <tr key={`${row.metric_date}-${row.dimension_key}-${row.dimension_value}-${i}`}><td>{row.metric_date}</td><td>{row.dimension_key}</td><td>{row.dimension_value}</td><td>{Object.entries(row.metrics || {}).map(([key,value]) => `${key}: ${value}`).join(" · ")}</td></tr>) : <tr><td colSpan="4"><div className="gnz-empty-state">Aucune donnée GA4 synchronisée.</div></td></tr>}</tbody></table></div></article>
  </div>;
}
