import { useEffect, useMemo, useState } from "react";
import { listEmails } from "../../services/adminData.js";
import { getEmailSummary } from "../../services/adminReporting.js";
import "../../styles/admin-v2.css";

const fmtDate = (value) => value ? new Date(value).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const LABELS = { queued: "En attente", sent: "Envoyé", delivered: "Délivré", opened: "Ouvert", clicked: "Cliqué", failed: "Échec", bounced: "Rejeté" };

export default function AdminEmails() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try { const [messages, stats] = await Promise.all([listEmails(250), getEmailSummary(30)]); setRows(messages); setSummary(stats); setError(""); }
    catch (e) { setError(e?.message || "Impossible de charger les emails."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const visible = useMemo(() => filter === "all" ? rows : rows.filter((r) => r.status === filter), [rows, filter]);

  return <div>
    <div className="gnz-page-heading"><div><h1>Emails</h1><p>Suivi des messages émis par GaspardNZ. Aucune ouverture ou délivrabilité n'est inventée.</p></div><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={load}>Actualiser</button></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <section className="gnz-kpi-grid" style={{ marginBottom: 12 }}>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Envoyés</span><div className="gnz-kpi-value">{summary?.sent || 0}</div><div className="gnz-kpi-sub">Messages acceptés par le système d'envoi</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Délivrés</span><div className="gnz-kpi-value">{summary?.delivered || 0}</div><div className="gnz-kpi-sub">{summary?.deliveryRate || 0}% des envoyés</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Ouverts</span><div className="gnz-kpi-value">{summary?.opened || 0}</div><div className="gnz-kpi-sub">{summary?.openRate || 0}% des délivrés suivis</div></article>
      <article className="gnz-kpi-card"><span className="gnz-kpi-label">Échecs</span><div className="gnz-kpi-value">{summary?.failed || 0}</div><div className="gnz-kpi-sub">{summary?.failureRate || 0}% des tentatives</div></article>
    </section>
    <div className="gnz-alert" style={{ color: "var(--gnz-muted)", border: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
      Le SMTP actuel peut confirmer « envoyé » ou « échec ». Les statuts « délivré / ouvert / cliqué » seront activés uniquement avec un prestataire fournissant des webhooks ; tant que ce n'est pas branché, ils restent à zéro au lieu d'être simulés.
    </div>
    <div className="gnz-toolbar"><select className="gnz-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Tous les statuts</option>{Object.entries(LABELS).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></div>
    <article className="gnz-card"><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Destinataire</th><th>Objet</th><th>Prestataire</th><th>Statut</th><th>Envoyé</th><th>Délivré</th><th>Erreur</th></tr></thead><tbody>{loading ? <tr><td colSpan="7"><div className="gnz-empty-state">Chargement…</div></td></tr> : visible.length ? visible.map((row) => <tr key={row.id}><td><strong>{row.recipient}</strong></td><td>{row.subject}</td><td>{row.provider}</td><td><span className={`gnz-status ${row.status}`}>{LABELS[row.status] || row.status}</span></td><td>{fmtDate(row.sent_at || row.created_at)}</td><td>{fmtDate(row.delivered_at)}</td><td>{row.error_message || "—"}</td></tr>) : <tr><td colSpan="7"><div className="gnz-empty-state">Aucun email enregistré. Le prochain envoi apparaîtra ici une fois la capture activée.</div></td></tr>}</tbody></table></div></article>
  </div>;
}
