import { useEffect, useMemo, useState } from "react";
import { listEmails } from "../../services/adminData.js";
import { getEmailSummary } from "../../services/adminReporting.js";
import { supabase } from "../../services/supabaseClient.js";
import { EMAIL_NOTIFICATIONS_ENABLED } from "../../constants.js";
import "../../styles/admin-v2.css";

const fmtDate = (value) => value ? new Date(value).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
const LABELS = { queued: "En attente", sent: "Envoyé", delivered: "Délivré", opened: "Ouvert", clicked: "Cliqué", failed: "Échec", bounced: "Rejeté" };

export default function AdminEmails() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [smtpCheck, setSmtpCheck] = useState(null);
  const [checkingSmtp, setCheckingSmtp] = useState(false);
  const smtpMessages = {
    ready: "Connexion SMTP vérifiée. Aucun email de test envoyé. Une validation de réception reste nécessaire.",
    authentication_rejected: "Le serveur SMTP refuse les identifiants configurés dans Vercel.",
    missing_configuration: "Paramètres Vercel manquants : " + (smtpCheck?.missing || []).join(", "),
    invalid_port: "Port SMTP Vercel invalide.",
    network_error: "Impossible pour Vercel de joindre le serveur SMTP.",
    tls_error: "Erreur TLS côté serveur SMTP.",
    smtp_error: "La vérification SMTP a échoué.",
    check_error: smtpCheck?.message || "Diagnostic indisponible.",
  };
  const verifySmtp = async () => {
    setCheckingSmtp(true);
    setSmtpCheck(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (!token) throw new Error("Session administrateur expirée.");
      const response = await fetch("/api/admin-email-health", {
        method:"GET",headers:{Authorization:`Bearer ${token}`},cache:"no-store",
      });
      const body = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(body.error || "Diagnostic SMTP indisponible.");
      setSmtpCheck(body);
    } catch(error) {
      setSmtpCheck({smtpStatus:"check_error",message:error?.message || "Diagnostic indisponible."});
    } finally { setCheckingSmtp(false); }
  };

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
    <div className="gnz-page-heading"><div><h1>Emails</h1><p>Suivi des messages émis par GaspardNZ. Aucune ouverture ou délivrabilité n'est inventée.</p></div><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={load}>Actualiser</button><button className="gnz-secondary-button" onClick={verifySmtp} disabled={checkingSmtp}>{checkingSmtp ? "Vérification…" : "Tester SMTP"}</button></div></div>
    {!EMAIL_NOTIFICATIONS_ENABLED && <div role="status" className="gnz-alert gnz-alert-error">Notifications automatiques des formulaires partenaires actuellement désactivées. Réactiver uniquement après validation du SMTP et test d'envoi.</div>}
    {smtpCheck && <div role="status" className={`gnz-alert ${smtpCheck.smtpStatus === "ready" ? "gnz-alert-success" : "gnz-alert-error"}`}>{smtpMessages[smtpCheck.smtpStatus] || "État SMTP inconnu."}</div>}
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
    <article className="gnz-card"><div className="gnz-table-wrap gnz-table-wrap--capped"><table className="gnz-table"><thead><tr><th>Destinataire</th><th>Objet</th><th>Prestataire</th><th>Statut</th><th>Envoyé</th><th>Délivré</th><th>Erreur</th></tr></thead><tbody>{loading ? <tr><td colSpan="7"><div className="gnz-empty-state">Chargement…</div></td></tr> : visible.length ? visible.map((row) => <tr key={row.id}><td><strong>{row.recipient}</strong></td><td>{row.subject}</td><td>{row.provider}</td><td><span className={`gnz-status ${row.status}`}>{LABELS[row.status] || row.status}</span></td><td>{fmtDate(row.sent_at || row.created_at)}</td><td>{fmtDate(row.delivered_at)}</td><td>{row.error_message || "—"}</td></tr>) : <tr><td colSpan="7"><div className="gnz-empty-state">Aucun email enregistré. Le prochain envoi apparaîtra ici une fois la capture activée.</div></td></tr>}</tbody></table></div></article>
  </div>;
}
