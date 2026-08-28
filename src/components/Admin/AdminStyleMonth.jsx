import { useEffect, useState } from "react";
import { listContentTable, upsertRow } from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const empty = { title:"", description:"", cover_url:"", album:[], hotspots:[], starts_at:"", ends_at:"", published:true, metadata:{} };
const urlsToText = (arr) => Array.isArray(arr) ? arr.join("\n") : "";
const spotsToText = (arr) => Array.isArray(arr) ? arr.map((s) => `${s.x}|${s.y}|${s.label || ""}`).join("\n") : "";
const parseSpots = (text) => String(text || "").split(/\n+/).map((line) => {
  const [x,y,...label] = line.split("|");
  return { x:Number(x), y:Number(y), label:label.join("|").trim() };
}).filter((s) => Number.isFinite(s.x) && Number.isFinite(s.y) && s.label);

export default function AdminStyleMonth() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [albumText, setAlbumText] = useState("");
  const [spotsText, setSpotsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = async () => { try { setRows(await listContentTable("style_month")); setError(""); } catch (e) { setError(e?.message || "Impossible de charger le Style du mois."); } };
  useEffect(() => { load(); }, []);
  const reset = () => { setForm(empty); setAlbumText(""); setSpotsText(""); };
  const edit = (row) => { setForm({ ...row, starts_at: row.starts_at || "", ends_at: row.ends_at || "" }); setAlbumText(urlsToText(row.album)); setSpotsText(spotsToText(row.hotspots)); };
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await upsertRow("style_month", {
        ...form,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        album: albumText.split(/\n+/).map((v) => v.trim()).filter(Boolean),
        hotspots: parseSpots(spotsText),
      });
      await load(); reset(); flash("Style du mois mis à jour sur le site.");
    } catch (e) { setError(e?.message || "Enregistrement impossible."); }
    finally { setSaving(false); }
  };

  return <div>
    <div className="gnz-page-heading"><div><h1>Style du mois</h1><p>Préparer, programmer et publier le look mis en avant sur le site.</p></div><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={reset}>Nouveau style</button></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-split">
      <article className="gnz-card"><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Style</th><th>Période</th><th>Photos</th><th>État</th><th>Action</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}><td><strong>{row.title}</strong><span className="gnz-table-sub">{row.description?.slice(0,80)}</span></td><td>{row.starts_at || "—"} → {row.ends_at || "∞"}</td><td>{Array.isArray(row.album) ? row.album.length : 0}</td><td><span className={`gnz-status ${row.published ? "success" : "warning"}`}>{row.published ? "Publié" : "Masqué"}</span></td><td><button className="gnz-secondary-button" onClick={() => edit(row)}>Modifier</button></td></tr>) : <tr><td colSpan="5"><div className="gnz-empty-state">Aucun Style du mois enregistré.</div></td></tr>}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{form.id ? "Modifier le style" : "Créer un style"}</strong><span>Les changements publiés sont lus directement par le site.</span></div></header><form className="gnz-card-body gnz-editor-grid" onSubmit={save}>
        <label className="gnz-field">Titre<input className="gnz-input" value={form.title || ""} onChange={(e)=>setForm({...form,title:e.target.value})} required/></label>
        <label className="gnz-field">Description<textarea className="gnz-textarea" value={form.description || ""} onChange={(e)=>setForm({...form,description:e.target.value})}/></label>
        <label className="gnz-field">Photo principale (URL)<input className="gnz-input" value={form.cover_url || ""} onChange={(e)=>setForm({...form,cover_url:e.target.value})}/></label>
        <label className="gnz-field">Album — une URL par ligne<textarea className="gnz-textarea" value={albumText} onChange={(e)=>setAlbumText(e.target.value)} /></label>
        <label className="gnz-field">Points cliquables — X|Y|Libellé<textarea className="gnz-textarea" value={spotsText} onChange={(e)=>setSpotsText(e.target.value)} placeholder="68|38|Veste terracotta"/></label>
        <div className="gnz-section-grid" style={{marginTop:0}}><label className="gnz-field gnz-col-6">Début<input className="gnz-input" type="date" value={form.starts_at || ""} onChange={(e)=>setForm({...form,starts_at:e.target.value})}/></label><label className="gnz-field gnz-col-6">Fin<input className="gnz-input" type="date" value={form.ends_at || ""} onChange={(e)=>setForm({...form,ends_at:e.target.value})}/></label></div>
        <label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e)=>setForm({...form,published:e.target.checked})}/>Afficher sur le site</label>
        <div className="gnz-editor-actions">{form.id && <button type="button" className="gnz-secondary-button" onClick={reset}>Annuler</button>}<button className="gnz-primary-button" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
      </form></aside>
    </div>
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}
