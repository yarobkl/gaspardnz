import { useEffect, useState } from "react";
import { changePassword, getSession } from "../../services/adminAuth.js";
import { getIntegrationSettings } from "../../services/adminData.js";
import { SUPABASE_URL } from "../../services/supabaseClient.js";
import "../../styles/admin-v2.css";

const LABELS = { google_analytics:"Google Analytics 4", google_search_console:"Google Search Console", calendly:"Calendly", email_provider:"Emails" };

export default function AdminSettings() {
  const [session, setSession] = useState(null);
  const [integrations, setIntegrations] = useState([]);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  useEffect(() => { Promise.all([getSession(), getIntegrationSettings()]).then(([s,i]) => { setSession(s); setIntegrations(i); }).catch((e)=>setError(e?.message || "Impossible de charger les paramètres.")); }, []);
  const updatePassword = async (e) => { e.preventDefault(); if (newPassword.length < 10) { setError("Le nouveau mot de passe doit contenir au moins 10 caractères."); return; } const result = await changePassword(session?.userId, oldPassword, newPassword); if (!result.success) { setError(result.error); return; } setOldPassword(""); setNewPassword(""); setError(""); setToast("Mot de passe modifié."); setTimeout(()=>setToast(""),2000); };

  return <div>
    <div className="gnz-page-heading"><div><h1>Paramètres</h1><p>Sécurité du compte, intégrations et état technique de la plateforme.</p></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-section-grid">
      <article className="gnz-card gnz-col-6"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Sécurité</strong><span>Compte connecté : {session?.email || "—"}</span></div><span className="gnz-status success">Supabase Auth</span></header><form className="gnz-card-body gnz-editor-grid" onSubmit={updatePassword}><label className="gnz-field">Mot de passe actuel<input className="gnz-input" type="password" autoComplete="current-password" value={oldPassword} onChange={(e)=>setOldPassword(e.target.value)} required/></label><label className="gnz-field">Nouveau mot de passe<input className="gnz-input" type="password" autoComplete="new-password" minLength="10" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required/></label><button className="gnz-primary-button">Modifier mon mot de passe</button></form></article>
      <article className="gnz-card gnz-col-6"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Infrastructure</strong><span>Sources de vérité utilisées par l'administration</span></div></header><div className="gnz-card-body"><div className="gnz-activity-list"><div className="gnz-activity-item"><span className="gnz-activity-bullet"/><div className="gnz-activity-copy"><strong>Base de données</strong><span>{SUPABASE_URL.replace("https://","")}</span></div><span className="gnz-status success">Active</span></div><div className="gnz-activity-item"><span className="gnz-activity-bullet"/><div className="gnz-activity-copy"><strong>Stockage médias</strong><span>Bucket site-media · 15 Mo/fichier</span></div><span className="gnz-status success">Actif</span></div><div className="gnz-activity-item"><span className="gnz-activity-bullet"/><div className="gnz-activity-copy"><strong>Temps réel</strong><span>CRM, réservations, emails, activité et contenu</span></div><span className="gnz-status success">Actif</span></div></div></div></article>
    </div>
    <article className="gnz-card" style={{marginTop:12}}><header className="gnz-card-header"><div className="gnz-card-title"><strong>Intégrations</strong><span>Une intégration non connectée n'alimente aucun faux KPI.</span></div></header><div className="gnz-card-body"><div className="gnz-integration-grid">{integrations.map((item)=><div className="gnz-integration-card" key={item.provider}><div className="gnz-integration-card-head"><div><h3>{LABELS[item.provider] || item.provider}</h3><p>{item.account_label || "Compte non configuré"}<br/>{item.site_url || ""}</p></div><span className={`gnz-status ${item.status === "connected" ? "success" : item.status === "partial" ? "info" : "warning"}`}>{item.status === "connected" ? "Connecté" : item.status === "partial" ? "Partiel" : "À connecter"}</span></div>{item.last_sync_at && <p>Dernière synchro : {new Date(item.last_sync_at).toLocaleString("fr-FR")}</p>}{item.last_error && <p style={{color:"var(--gnz-danger)"}}>Erreur : {item.last_error}</p>}</div>)}</div></div></article>
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}
