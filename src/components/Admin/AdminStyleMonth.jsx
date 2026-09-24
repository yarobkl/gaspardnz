import { useEffect, useState } from "react";
import { listContentTable, setPublished, upsertRow } from "../../services/adminData.js";
import { scrollToAdminEditor } from "./scrollToEditor.js";
import MediaUploadField from "./MediaUploadField.jsx";
import "../../styles/admin-v2.css";

const empty = { title:"", description:"", cover_url:"", album:[], hotspots:[], starts_at:"", ends_at:"", published:true, metadata:{} };
const urlsToText = (arr) => Array.isArray(arr) ? arr.join("\n") : "";
const emptyHotspot = { x: 50, y: 50, label: "" };

export default function AdminStyleMonth() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [albumText, setAlbumText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = async () => { try { setRows(await listContentTable("style_month")); setError(""); } catch (e) { setError(e?.message || "Impossible de charger le Style du mois."); } };
  useEffect(() => { load(); }, []);
  const reset = () => { setForm(empty); setAlbumText(""); scrollToAdminEditor(); };
  const edit = (row) => { setForm({ ...row, starts_at: row.starts_at || "", ends_at: row.ends_at || "", hotspots: Array.isArray(row.hotspots) ? row.hotspots : [] }); setAlbumText(urlsToText(row.album)); scrollToAdminEditor(); };
  const toggle = async (row) => { try { await setPublished("style_month", row.id, !row.published); await load(); } catch (e) { setError(e?.message || "Impossible de changer la visibilité."); } };
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const addHotspot = () => setForm((f) => ({ ...f, hotspots: [...(f.hotspots || []), { ...emptyHotspot }] }));
  const updateHotspot = (index, key, value) => setForm((f) => ({ ...f, hotspots: f.hotspots.map((h, i) => i === index ? { ...h, [key]: value } : h) }));
  const removeHotspot = (index) => setForm((f) => ({ ...f, hotspots: f.hotspots.filter((_, i) => i !== index) }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await upsertRow("style_month", {
        ...form,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
        album: albumText.split(/\n+/).map((v) => v.trim()).filter(Boolean),
        hotspots: (form.hotspots || [])
          .map((h) => ({ x: Number(h.x), y: Number(h.y), label: String(h.label || "").trim() }))
          .filter((h) => Number.isFinite(h.x) && Number.isFinite(h.y) && h.label),
      });
      await load(); reset(); flash("Style du mois mis à jour sur le site.");
    } catch (e) { setError(e?.message || "Enregistrement impossible."); }
    finally { setSaving(false); }
  };

  return <div>
    <div className="gnz-page-heading"><div><h1>Style du mois</h1><p>Préparer, programmer et publier le look mis en avant sur le site.</p></div><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={reset}>Nouveau style</button></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-split">
      <article className="gnz-card"><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Style</th><th>Période</th><th>Photos</th><th>État</th><th>Action</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}><td><strong>{row.title}</strong><span className="gnz-table-sub">{row.description?.slice(0,80)}</span></td><td>{row.starts_at || "—"} → {row.ends_at || "∞"}</td><td>{Array.isArray(row.album) ? row.album.length : 0}</td><td><span className={`gnz-status ${row.published ? "success" : "warning"}`}>{row.published ? "Publié" : "Masqué"}</span></td><td><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={() => edit(row)}>Modifier</button><button className={`gnz-secondary-button gnz-toggle-button${row.published ? "" : " is-hidden"}`} onClick={() => toggle(row)}>{row.published ? "Masquer" : "Afficher"}</button></div></td></tr>) : <tr><td colSpan="5"><div className="gnz-empty-state">Aucun Style du mois enregistré.</div></td></tr>}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor" id="gnz-admin-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{form.id ? "Modifier le style" : "Créer un style"}</strong><span>Les changements publiés sont lus directement par le site.</span></div></header><form className="gnz-card-body gnz-editor-grid" onSubmit={save}>
        <label className="gnz-field">Titre<input className="gnz-input" value={form.title || ""} onChange={(e)=>setForm({...form,title:e.target.value})} required/></label>
        <label className="gnz-field">Description<textarea className="gnz-textarea" value={form.description || ""} onChange={(e)=>setForm({...form,description:e.target.value})}/></label>
        <MediaUploadField label="Photo principale" value={form.cover_url} onChange={(url) => setForm({...form,cover_url:url})} uploadSection="style-month" />
        <label className="gnz-field">Album · une URL par ligne<textarea className="gnz-textarea" value={albumText} onChange={(e)=>setAlbumText(e.target.value)} /></label>

        <div style={{ borderTop: "1px solid rgba(205,169,75,.16)", paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
            <strong>Points cliquables sur la photo principale</strong>
            <button type="button" className="gnz-secondary-button" onClick={addHotspot}>Ajouter un point</button>
          </div>
          <span className="gnz-muted" style={{ fontSize: 11, display: "block", marginBottom: 10 }}>Position en % de la photo (0 = bord gauche/haut, 100 = bord droit/bas).</span>
          {(form.hotspots || []).length === 0 && <span className="gnz-muted" style={{ fontSize: 11 }}>Aucun point pour l'instant.</span>}
          {(form.hotspots || []).map((spot, index) => (
            <div key={index} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
              <label className="gnz-field" style={{ width: 90 }}>X (%)<input className="gnz-input" type="number" min="0" max="100" step="0.5" value={spot.x} onChange={(e) => updateHotspot(index, "x", e.target.value)} /></label>
              <label className="gnz-field" style={{ width: 90 }}>Y (%)<input className="gnz-input" type="number" min="0" max="100" step="0.5" value={spot.y} onChange={(e) => updateHotspot(index, "y", e.target.value)} /></label>
              <label className="gnz-field" style={{ flex: "1 1 200px" }}>Libellé<input className="gnz-input" value={spot.label} onChange={(e) => updateHotspot(index, "label", e.target.value)} placeholder="Veste terracotta" /></label>
              <button type="button" className="gnz-secondary-button" onClick={() => removeHotspot(index)} style={{ alignSelf: "flex-end" }}>Retirer</button>
            </div>
          ))}
        </div>

        <div className="gnz-section-grid" style={{marginTop:0}}><label className="gnz-field gnz-col-6">Début<input className="gnz-input" type="date" value={form.starts_at || ""} onChange={(e)=>setForm({...form,starts_at:e.target.value})}/></label><label className="gnz-field gnz-col-6">Fin<input className="gnz-input" type="date" value={form.ends_at || ""} onChange={(e)=>setForm({...form,ends_at:e.target.value})}/></label></div>
        <label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e)=>setForm({...form,published:e.target.checked})}/>Afficher sur le site</label>
        <div className="gnz-editor-actions">{form.id && <button type="button" className="gnz-secondary-button" onClick={reset}>Annuler</button>}<button className="gnz-primary-button" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
      </form></aside>
    </div>
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}
