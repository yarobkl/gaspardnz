import { useEffect, useState } from "react";
import { listContentTable, upsertRow } from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const empty = { title:"", description:"", color_label:"", style_label:"", occasion_label:"", cover_url:"", album:[], published:true, sort_order:0 };
const albumToText = (album) => Array.isArray(album) ? album.map((item) => typeof item === "string" ? item : item?.src).filter(Boolean).join("\n") : "";

export default function AdminWeddingInspiration() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [albumText, setAlbumText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => { try { setRows(await listContentTable("wedding_inspirations")); setError(""); } catch (e) { setError(e?.message || "Impossible de charger les inspirations."); } };
  useEffect(() => { load(); }, []);
  const edit = (row) => { setForm(row); setAlbumText(albumToText(row.album)); };
  const reset = () => { setForm(empty); setAlbumText(""); };
  const save = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const album = albumText.split(/\n+/).map((src) => src.trim()).filter(Boolean).map((src) => ({ src, spots: [] }));
      await upsertRow("wedding_inspirations", { ...form, album, sort_order: Number(form.sort_order || 0) });
      await load(); reset();
    } catch (e) { setError(e?.message || "Enregistrement impossible."); }
    finally { setSaving(false); }
  };

  return <div>
    <div className="gnz-page-heading"><div><h1>Wedding Inspiration</h1><p>Modifier les inspirations mariage, leurs visuels et leur ordre d'affichage.</p></div><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={reset}>Nouvelle inspiration</button></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-split">
      <article className="gnz-card"><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Inspiration</th><th>Couleur</th><th>Style</th><th>Photos</th><th>État</th><th>Action</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}><td><strong>{row.title}</strong><span className="gnz-table-sub">{row.occasion_label || "—"}</span></td><td>{row.color_label || "—"}</td><td>{row.style_label || "—"}</td><td>{Array.isArray(row.album) ? row.album.length : 0}</td><td><span className={`gnz-status ${row.published ? "success" : "warning"}`}>{row.published ? "Publié" : "Masqué"}</span></td><td><button className="gnz-secondary-button" onClick={() => edit(row)}>Modifier</button></td></tr>) : <tr><td colSpan="6"><div className="gnz-empty-state">Aucune inspiration enregistrée.</div></td></tr>}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{form.id ? "Modifier l'inspiration" : "Nouvelle inspiration"}</strong><span>Importer d'abord les images dans Médias & photos.</span></div></header><form className="gnz-card-body gnz-editor-grid" onSubmit={save}>
        <label className="gnz-field">Titre<input className="gnz-input" value={form.title || ""} onChange={(e)=>setForm({...form,title:e.target.value})} required/></label>
        <label className="gnz-field">Description<textarea className="gnz-textarea" value={form.description || ""} onChange={(e)=>setForm({...form,description:e.target.value})}/></label>
        <div className="gnz-section-grid" style={{marginTop:0}}><label className="gnz-field gnz-col-4">Couleur<input className="gnz-input" value={form.color_label || ""} onChange={(e)=>setForm({...form,color_label:e.target.value})}/></label><label className="gnz-field gnz-col-4">Style<input className="gnz-input" value={form.style_label || ""} onChange={(e)=>setForm({...form,style_label:e.target.value})}/></label><label className="gnz-field gnz-col-4">Occasion<input className="gnz-input" value={form.occasion_label || ""} onChange={(e)=>setForm({...form,occasion_label:e.target.value})}/></label></div>
        <label className="gnz-field">Photo principale (URL)<input className="gnz-input" value={form.cover_url || ""} onChange={(e)=>setForm({...form,cover_url:e.target.value})}/></label>
        <label className="gnz-field">Album — une URL par ligne<textarea className="gnz-textarea" style={{minHeight:150}} value={albumText} onChange={(e)=>setAlbumText(e.target.value)}/></label>
        <label className="gnz-field">Ordre<input className="gnz-input" type="number" value={form.sort_order || 0} onChange={(e)=>setForm({...form,sort_order:e.target.value})}/></label>
        <label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e)=>setForm({...form,published:e.target.checked})}/>Afficher sur le site</label>
        <div className="gnz-editor-actions">{form.id && <button type="button" className="gnz-secondary-button" onClick={reset}>Annuler</button>}<button className="gnz-primary-button" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
      </form></aside>
    </div>
  </div>;
}
