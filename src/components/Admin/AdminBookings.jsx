import { useEffect, useMemo, useState } from "react";
import { listBookings, updateBooking, getIntegrationSettings } from "../../services/adminData.js";
import { supabase } from "../../services/supabaseClient.js";
import "../../styles/admin-v2.css";

const STATUSES = [
  ["requested","Demandé"], ["confirmed","Confirmé"], ["completed","Terminé"], ["cancelled","Annulé"], ["no_show","Absent"],
];
const fmtDate = (value) => value ? new Date(value).toLocaleString("fr-FR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "À planifier";

export default function AdminBookings() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [integration, setIntegration] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [bookings, integrations] = await Promise.all([listBookings(250), getIntegrationSettings()]);
      setRows(bookings);
      setIntegration(integrations.find((item) => item.provider === "calendly") || null);
      setError("");
    } catch (e) { setError(e?.message || "Impossible de charger les réservations."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => filter === "all" ? rows : rows.filter((r) => r.status === filter), [rows, filter]);
  const counts = useMemo(() => Object.fromEntries(STATUSES.map(([key]) => [key, rows.filter((r) => r.status === key).length])), [rows]);

  const patch = async (id, values) => {
    try {
      const updated = await updateBooking(id, values);
      setRows((list) => list.map((item) => item.id === id ? { ...item, ...updated } : item));
      if (selected?.id === id) setSelected((s) => ({ ...s, ...updated }));
      setToast("Réservation mise à jour."); setTimeout(() => setToast(""), 2000);
    } catch (e) { setError(e?.message || "Modification impossible."); }
  };

  const syncCalendly = async () => {
    setSyncing(true); setError(""); setToast("");
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) throw new Error("Session administrateur expirée.");
      const response = await fetch("/api/calendly/sync", {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body:JSON.stringify({ days:180 }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Synchronisation Calendly impossible.");
      setToast(`${payload.events || 0} rendez-vous Calendly synchronisés.`);
      await load();
    } catch (e) { setError(e?.message || "Synchronisation Calendly impossible."); }
    finally { setSyncing(false); }
  };

  return <div>
    <div className="gnz-page-heading"><div><h1>Réservations</h1><p>Demandes de rendez-vous et rendez-vous confirmés, reliés au CRM et à Calendly.</p></div><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={load}>Actualiser</button><button className="gnz-primary-button" onClick={syncCalendly} disabled={syncing}>{syncing ? "Synchronisation…" : "Synchroniser Calendly"}</button></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className={`gnz-alert ${integration?.status === "connected" ? "gnz-alert-success" : ""}`} style={{ marginBottom:12 }}><strong>Calendly : {integration?.status === "connected" ? "connecté" : integration?.status === "error" ? "erreur" : "autorisation requise"}</strong>{integration?.last_sync_at ? ` · Dernière synchro ${new Date(integration.last_sync_at).toLocaleString("fr-FR")}` : ""}{integration?.last_error ? <><br/>{integration.last_error}</> : null}</div>
    <section className="gnz-kpi-grid" style={{ marginBottom: 12 }}>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Demandes</span><div className="gnz-kpi-value">{counts.requested || 0}</div><div className="gnz-kpi-sub">À confirmer</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Confirmées</span><div className="gnz-kpi-value">{counts.confirmed || 0}</div><div className="gnz-kpi-sub">Rendez-vous actifs</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Terminées</span><div className="gnz-kpi-value">{counts.completed || 0}</div><div className="gnz-kpi-sub">Rendez-vous réalisés</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Annulées / absents</span><div className="gnz-kpi-value">{(counts.cancelled || 0) + (counts.no_show || 0)}</div><div className="gnz-kpi-sub">À analyser</div></article>
    </section>
    <div className="gnz-toolbar"><select className="gnz-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Tous les statuts</option>{STATUSES.map(([k,l]) => <option key={k} value={k}>{l}</option>)}</select></div>
    <div className="gnz-split">
      <article className="gnz-card"><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Client</th><th>Rendez-vous</th><th>Source</th><th>Statut</th><th>Créé</th></tr></thead><tbody>{loading ? <tr><td colSpan="5"><div className="gnz-empty-state">Chargement…</div></td></tr> : visible.length ? visible.map((row) => <tr key={row.id} onClick={() => setSelected(row)} style={{ cursor: "pointer" }}><td><strong>{row.leads?.full_name || row.metadata?.invitee_name || row.title || "Demande"}</strong><span className="gnz-table-sub">{row.leads?.email || row.metadata?.invitee_email || row.leads?.phone || row.provider}</span></td><td>{fmtDate(row.starts_at)}</td><td>{row.source || row.provider}</td><td><span className={`gnz-status ${row.status}`}>{STATUSES.find(([k]) => k === row.status)?.[1] || row.status}</span></td><td>{fmtDate(row.created_at)}</td></tr>) : <tr><td colSpan="5"><div className="gnz-empty-state">Aucune réservation.</div></td></tr>}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{selected ? selected.leads?.full_name || selected.metadata?.invitee_name || selected.title || "Réservation" : "Fiche réservation"}</strong><span>{selected?.provider ? `Source : ${selected.provider}` : "Sélectionnez une réservation"}</span></div></header><div className="gnz-card-body">{selected ? <div className="gnz-editor-grid">
        <label className="gnz-field">Statut<select className="gnz-select" value={selected.status} onChange={(e) => patch(selected.id, { status: e.target.value })}>{STATUSES.map(([k,l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        <label className="gnz-field">Début<input className="gnz-input" type="datetime-local" value={selected.starts_at ? new Date(selected.starts_at).toISOString().slice(0,16) : ""} onChange={(e) => setSelected({ ...selected, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })} onBlur={() => patch(selected.id, { starts_at: selected.starts_at })} /></label>
        <label className="gnz-field">Fin<input className="gnz-input" type="datetime-local" value={selected.ends_at ? new Date(selected.ends_at).toISOString().slice(0,16) : ""} onChange={(e) => setSelected({ ...selected, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} onBlur={() => patch(selected.id, { ends_at: selected.ends_at })} /></label>
        <label className="gnz-field">Titre<input className="gnz-input" value={selected.title || ""} onChange={(e) => setSelected({ ...selected, title: e.target.value })} onBlur={() => patch(selected.id, { title: selected.title || null })} /></label>
        <label className="gnz-field">Notes<textarea className="gnz-textarea" value={selected.notes || ""} onChange={(e) => setSelected({ ...selected, notes: e.target.value })} onBlur={() => patch(selected.id, { notes: selected.notes || null })} /></label>
      </div> : <div className="gnz-empty-state">Cliquez sur une réservation pour la gérer.</div>}</div></aside>
    </div>
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}