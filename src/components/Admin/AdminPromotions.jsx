import { useEffect, useState } from "react";
import { listPromotions, removePromotion, savePromotion } from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const empty = { title: "", subtitle: "", description: "", image_url: "", cta_label: "Découvrir", cta_url: "", placement: "home", status: "draft", starts_at: "", ends_at: "", priority: 0, published: false };
const toLocal = (value) => value ? new Date(value).toISOString().slice(0,16) : "";

export default function AdminPromotions() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const load = async () => { try { setRows(await listPromotions()); setError(""); } catch (e) { setError(e?.message || "Impossible de charger les promotions."); } };
  useEffect(() => { load(); }, []);

  const edit = (row) => setForm({ ...row, starts_at: toLocal(row.starts_at), ends_at: toLocal(row.ends_at) });
  const save = async (e) => {
    e.preventDefault(); if (!form.title.trim()) return;
    setSaving(true); setError("");
    try {
      await savePromotion({ ...form, starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null, ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null });
      await load(); setForm(empty); setToast("Promotion enregistrée."); setTimeout(() => setToast(""), 2200);
    } catch (e) { setError(e?.message || "Enregistrement impossible."); }
    finally { setSaving(false); }
  };
  const archive = async (row) => { if (!window.confirm(`Retirer « ${row.title} » ?`)) return; try { await removePromotion(row.id); await load(); } catch (e) { setError(e?.message || "Impossible de retirer cette promotion."); } };

  return <div>
    <div className="gnz-page-heading"><div><h1>Promotions</h1><p>Créer, programmer, mettre en avant ou retirer une offre sans toucher au code.</p></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div className="gnz-split">
      <article className="gnz-card"><header className="gnz-card-header"><div className="gnz-card-title"><strong>Campagnes</strong><span>{rows.length} promotion{rows.length > 1 ? "s" : ""} enregistrée{rows.length > 1 ? "s" : ""}</span></div></header><div className="gnz-table-wrap"><table className="gnz-table"><thead><tr><th>Promotion</th><th>Emplacement</th><th>Statut</th><th>Période</th><th>Actions</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}><td><strong>{row.title}</strong><span className="gnz-table-sub">{row.subtitle || row.description || "—"}</span></td><td>{row.placement}</td><td><span className={`gnz-status ${row.status}`}>{row.published ? row.status : "brouillon"}</span></td><td>{row.starts_at ? new Date(row.starts_at).toLocaleDateString("fr-FR") : "Maintenant"} → {row.ends_at ? new Date(row.ends_at).toLocaleDateString("fr-FR") : "Sans fin"}</td><td><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={() => edit(row)}>Modifier</button><button className="gnz-danger-button" onClick={() => archive(row)}>Retirer</button></div></td></tr>) : <tr><td colSpan="5"><div className="gnz-empty-state">Aucune promotion. Créez la première depuis le formulaire.</div></td></tr>}</tbody></table></div></article>
      <aside className="gnz-card gnz-editor"><header className="gnz-card-header"><div className="gnz-card-title"><strong>{form.id ? "Modifier la promotion" : "Nouvelle promotion"}</strong><span>Les promotions publiées seront récupérées par le site.</span></div></header><form className="gnz-card-body gnz-editor-grid" onSubmit={save}>
        <label className="gnz-field">Titre<input className="gnz-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        <label className="gnz-field">Sous-titre<input className="gnz-input" value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></label>
        <label className="gnz-field">Description<textarea className="gnz-textarea" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label className="gnz-field">URL de l'image<input className="gnz-input" value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Copiez une URL depuis Médias & photos" /></label>
        <div className="gnz-section-grid" style={{ marginTop: 0 }}><label className="gnz-field gnz-col-6">Texte du bouton<input className="gnz-input" value={form.cta_label || ""} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} /></label><label className="gnz-field gnz-col-6">Lien du bouton<input className="gnz-input" value={form.cta_url || ""} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} /></label></div>
        <div className="gnz-section-grid" style={{ marginTop: 0 }}><label className="gnz-field gnz-col-6">Début<input className="gnz-input" type="datetime-local" value={form.starts_at || ""} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></label><label className="gnz-field gnz-col-6">Fin<input className="gnz-input" type="datetime-local" value={form.ends_at || ""} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></label></div>
        <label className="gnz-field">Emplacement<select className="gnz-select" value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })}><option value="home">Accueil</option><option value="packages">Formules</option><option value="gallery">Galerie</option><option value="global">Bandeau global</option></select></label>
        <label className="gnz-field">Statut<select className="gnz-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Brouillon</option><option value="scheduled">Programmée</option><option value="active">Active</option><option value="expired">Expirée</option><option value="archived">Archivée</option></select></label>
        <label className="gnz-checkbox"><input type="checkbox" checked={Boolean(form.published)} onChange={(e) => setForm({ ...form, published: e.target.checked })} />Visible sur le site</label>
        <div className="gnz-editor-actions">{form.id && <button type="button" className="gnz-secondary-button" onClick={() => setForm(empty)}>Annuler</button>}<button className="gnz-primary-button" disabled={saving}>{saving ? "Enregistrement…" : form.id ? "Enregistrer" : "Créer la promotion"}</button></div>
      </form></aside>
    </div>
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}
