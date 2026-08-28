import { useEffect, useState } from "react";
import { listContentTable, upsertRow } from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const empty = { name:"", city:"", event_label:"Mariage", photo_url:"", album:[], published:true, sort_order:0 };
const lines = (arr) => Array.isArray(arr) ? arr.join("\n") : "";

export default function AdminVIPClients() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [albumText, setAlbumText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const load = async () => { try { setRows(await listContentTable("vip_clients")); setError(""); } catch (e) { setError(e?.message || "Impossible de charger les clients VIP."); } };
  useEffect(() => { load(); }, []);
  const edit = (row) => { setForm(row); setAlbumText(lines(row.album)); };
  const reset = () => { setForm(empty); setAlbumText(""); };
  const save = async (e) => { e.preventDefault(); setSaving(true); try { await upsertRow("vip_clients", { ...form, sort_order:Number(form.sort_order||0), album: albumText.split(/\n+/).map((v)=>v.trim()).filter(Boolean) }); await load(); reset(); } catch (e) { setError(e?.message || "Enregistrement impossible."); } finally { setSaving(false); } };
  return <div>
    <div className="gnz-page-heading"><div><h1>Clients VIP</h1><p>Gérer les profils et albums visibles dans la galerie VIP du site.</p></div><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={reset}>Nouveau client</button></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-split">
      <article className="gnz-card"><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Client</th><th>Ville</th><th>Événement</th><th>Photos</th><th>Visible</th><th>Action</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}><td><strong>{row.name}</strong></td><td>{row.city || "—"}</td><td>{row.event_label || "—"}</td><td>{Array.isArray(row.album) ? row.album.length : 0}</td><td><span className={`gnz-status ${row.published ? "success" : "warning"}`}>{row.published ? "Oui" : "Non"}</span></td><td><button className="gnz-secondary-button" onClick={() => edit(row)}>Modifier</button></td></tr>) : <tr><td colSpan="6"><div className="gnz-empty-state">Aucun client VIP enregistré.</div></td></tr>}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{form.id ? "Modifier le client" : "Ajouter un client"}</strong><span>Utilisez « Médias & photos » pour importer les images puis copiez leurs liens.</span></div></header><form className="gnz-card-body gnz-editor-grid" onSubmit={save}>
        <label className="gnz-field">Nom<input className="gnz-input" value={form.name || ""} onChange={(e)=>setForm({...form,name:e.target.value})} required/></label>
        <label className="gnz-field">Ville<input className="gnz-input" value={form.city || ""} onChange={(e)=>setForm({...form,city:e.target.value})}/></label>
        <label className="gnz-field">Événement<input className="gnz-input" value={form.event_label || ""} onChange={(e)=>setForm({...form,event_label:e.target.value})}/></label>
        <label className="gnz-field">Photo principale (URL)<input className="gnz-input" value={form.photo_url || ""} onChange={(e)=>setForm({...form,photo_url:e.target.value})}/></label>
        <label className="gnz-field">Album — une URL par ligne<textarea className="gnz-textarea" style={{minHeight:150}} value={albumText} onChange={(e)=>setAlbumText(e.target.value)} /></label>
        <label className="gnz-field">Ordre<input className="gnz-input" type="number" value={form.sort_order || 0} onChange={(e)=>setForm({...form,sort_order:e.target.value})}/></label>
        <label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e)=>setForm({...form,published:e.target.checked})}/>Afficher sur le site</label>
        <div className="gnz-editor-actions">{form.id && <button type="button" className="gnz-secondary-button" onClick={reset}>Annuler</button>}<button className="gnz-primary-button" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
      </form></aside>
    </div>
  </div>;
}
