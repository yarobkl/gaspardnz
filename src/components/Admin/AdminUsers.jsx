import { useEffect, useState } from "react";
import { createUser, deleteUser, getAllUsers } from "../../services/adminAuth.js";
import "../../styles/admin-v2.css";

const ROLES = { owner:"Propriétaire", admin:"Administrateur", editor:"Éditeur", viewer:"Lecture seule" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("editor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = async () => { setLoading(true); try { setUsers(await getAllUsers()); setError(""); } catch (e) { setError(e?.message || "Impossible de charger les accès."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const add = async (e) => { e.preventDefault(); const result = await createUser(email, null, role, name); if (!result.success) { setError(result.error); return; } setEmail(""); setName(""); await load(); setToast("Adresse autorisée. L'utilisateur peut créer son mot de passe depuis /admin."); setTimeout(() => setToast(""), 3500); };
  const deactivate = async (user) => { if (user.role === "owner" && users.filter((u) => u.role === "owner" && u.active).length <= 1) { setError("Le dernier propriétaire ne peut pas être désactivé."); return; } if (!window.confirm(`Retirer l'accès de ${user.email} ?`)) return; const result = await deleteUser(user.id); if (!result.success) setError(result.error); else await load(); };

  return <div>
    <div className="gnz-page-heading"><div><h1>Utilisateurs</h1><p>Les droits sont stockés en base et appliqués par les politiques de sécurité Supabase.</p></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-split">
      <article className="gnz-card"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Accès autorisés</strong><span>{users.filter((u)=>u.active).length} compte(s) actif(s)</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Utilisateur</th><th>Rôle</th><th>État</th><th>Ajouté</th><th></th></tr></thead><tbody>{loading ? <tr><td colSpan="5"><div className="gnz-empty-state">Chargement…</div></td></tr> : users.map((user) => <tr key={user.id}><td><strong>{user.display_name || user.email}</strong><span className="gnz-table-sub">{user.email}</span></td><td>{ROLES[user.role] || user.role}</td><td><span className={`gnz-status ${user.active ? "success" : "danger"}`}>{user.active ? "Actif" : "Désactivé"}</span></td><td>{new Date(user.created_at).toLocaleDateString("fr-FR")}</td><td>{user.active && <button className="gnz-danger-button" onClick={() => deactivate(user)}>Retirer</button>}</td></tr>)}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Autoriser un utilisateur</strong><span>Aucun mot de passe n'est envoyé ni stocké ici.</span></div></header><form className="gnz-card-body gnz-editor-grid" onSubmit={add}><label className="gnz-field">Nom affiché<input className="gnz-input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Gaspard NZ" /></label><label className="gnz-field">Email<input className="gnz-input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label><label className="gnz-field">Rôle<select className="gnz-select" value={role} onChange={(e)=>setRole(e.target.value)}><option value="admin">Administrateur</option><option value="editor">Éditeur</option><option value="viewer">Lecture seule</option></select></label><button className="gnz-primary-button">Autoriser l'accès</button><p className="gnz-muted" style={{fontSize:10}}>La personne utilisera ensuite « Première connexion » sur l'écran /admin et confirmera son adresse email.</p></form></aside>
    </div>
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}
