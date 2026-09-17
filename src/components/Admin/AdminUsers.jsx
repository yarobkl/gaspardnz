import { useEffect, useState } from "react";
import { deleteUser, generateUserAccess, getAllUsers } from "../../services/adminAuth.js";
import "../../styles/admin-v2.css";

const ROLES = { owner:"Propriétaire", admin:"Administrateur", editor:"Éditeur", viewer:"Lecture seule", couturier:"Couturier partenaire" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("editor");
  const [loading, setLoading] = useState(true);
  const [busyEmail, setBusyEmail] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  // Reste affiché tant que Gaspard ne l'a pas fermé lui-même : un mot de
  // passe ne doit pas disparaître tout seul avant d'avoir pu être recopié.
  const [reveal, setReveal] = useState(null);

  const load = async () => { setLoading(true); try { setUsers(await getAllUsers()); setError(""); } catch (e) { setError(e?.message || "Impossible de charger les accès."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    setBusyEmail(email); setError("");
    const result = await generateUserAccess(email, name, role);
    setBusyEmail("");
    if (!result.success) { setError(result.error); return; }
    setReveal({ email, displayName: name, password: result.password });
    setEmail(""); setName("");
    await load();
  };

  const regenerate = async (user) => {
    if (!window.confirm(`Générer un nouveau mot de passe pour ${user.email} ?\nL'ancien cessera immédiatement de fonctionner.`)) return;
    setBusyEmail(user.email); setError("");
    const result = await generateUserAccess(user.email, user.display_name, user.role);
    setBusyEmail("");
    if (!result.success) { setError(result.error); return; }
    setReveal({ email: user.email, displayName: user.display_name, password: result.password });
  };

  const deactivate = async (user) => { if (user.role === "owner" && users.filter((u) => u.role === "owner" && u.active).length <= 1) { setError("Le dernier propriétaire ne peut pas être désactivé."); return; } if (!window.confirm(`Retirer l'accès de ${user.email} ?`)) return; const result = await deleteUser(user.id); if (!result.success) setError(result.error); else await load(); };
  const copyPassword = async () => { try { await navigator.clipboard.writeText(reveal.password); setToast("Mot de passe copié."); setTimeout(() => setToast(""), 1800); } catch {} };

  return <div>
    <div className="gnz-page-heading"><div><h1>Utilisateurs</h1><p>Les droits sont stockés en base et appliqués par les politiques de sécurité Supabase.</p></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}

    {reveal && <article className="gnz-card" style={{ marginBottom: 12, border: "1px solid var(--gnz-border-strong)" }}>
      <div className="gnz-card-body">
        <strong>Identifiants pour {reveal.displayName || reveal.email}</strong>
        <p className="gnz-muted" style={{ fontSize: 11, margin: "6px 0 12px" }}>À transmettre maintenant : ce mot de passe ne sera plus jamais affiché ensuite. Il peut se connecter dès maintenant sur /admin.</p>
        <div className="gnz-section-grid" style={{ marginTop: 0 }}>
          <label className="gnz-field gnz-col-6">Identifiant<input className="gnz-input" value={reveal.email} readOnly /></label>
          <label className="gnz-field gnz-col-6">Mot de passe<input className="gnz-input" value={reveal.password} readOnly style={{ fontFamily: "monospace", letterSpacing: "0.04em" }} /></label>
        </div>
        <div className="gnz-editor-actions" style={{ justifyContent: "flex-start" }}>
          <button type="button" className="gnz-secondary-button" onClick={copyPassword}>Copier le mot de passe</button>
          <button type="button" className="gnz-secondary-button" onClick={() => setReveal(null)}>J'ai transmis les identifiants, fermer</button>
        </div>
      </div>
    </article>}

    <div className="gnz-split">
      <article className="gnz-card"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Accès autorisés</strong><span>{users.filter((u)=>u.active).length} compte(s) actif(s)</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Utilisateur</th><th>Rôle</th><th>État</th><th>Ajouté</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="5"><div className="gnz-empty-state">Chargement…</div></td></tr> : users.map((user) => <tr key={user.id}><td><strong>{user.display_name || user.email}</strong><span className="gnz-table-sub">{user.email}</span></td><td>{ROLES[user.role] || user.role}</td><td><span className={`gnz-status ${user.active ? "success" : "danger"}`}>{user.active ? "Actif" : "Désactivé"}</span></td><td>{new Date(user.created_at).toLocaleDateString("fr-FR")}</td><td>{user.active && <div className="gnz-page-actions">{user.role !== "owner" && <button className="gnz-secondary-button" disabled={busyEmail === user.email} onClick={() => regenerate(user)}>{busyEmail === user.email ? "Génération…" : "Nouveau mot de passe"}</button>}<button className="gnz-danger-button" onClick={() => deactivate(user)}>Retirer</button></div>}</td></tr>)}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Autoriser un utilisateur</strong><span>Identifiant et mot de passe générés ici, à transmettre vous-même.</span></div></header><form className="gnz-card-body gnz-editor-grid" onSubmit={add}><label className="gnz-field">Nom affiché<input className="gnz-input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Atelier Dupont" /></label><label className="gnz-field">Email<input className="gnz-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label><label className="gnz-field">Rôle<select className="gnz-select" value={role} onChange={(e)=>setRole(e.target.value)}><option value="admin">Administrateur</option><option value="editor">Éditeur</option><option value="viewer">Lecture seule</option><option value="couturier">Couturier partenaire — voit uniquement ses commandes</option></select></label><button className="gnz-primary-button" disabled={Boolean(busyEmail)}>{busyEmail ? "Génération…" : "Générer l'accès"}</button><p className="gnz-muted" style={{fontSize:10}}>Aucune inscription à faire de leur côté : le compte est actif immédiatement, avec le mot de passe affiché ici.</p></form></aside>
    </div>
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}
