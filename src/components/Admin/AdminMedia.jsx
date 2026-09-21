import { useEffect, useState } from "react";
import { deleteMedia, listMedia, replaceMediaFile, setPublished, updateMediaMeta, uploadMedia } from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const SECTIONS = ["hero","gallery","style-journal","wedding","vip","showroom","actualites","style-month","partners","promotions","lookbook","other"];

export default function AdminMedia() {
  const [section, setSection] = useState("all");
  const [uploadSection, setUploadSection] = useState("gallery");
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [replacingId, setReplacingId] = useState(null);

  const load = async () => { try { setRows(await listMedia(section)); setError(""); } catch (e) { setError(e?.message || "Impossible de charger les médias."); } };
  useEffect(() => { load(); }, [section]);

  const handleFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    setBusy(true);
    setError("");
    try {
      for (const file of list) await uploadMedia(file, uploadSection, { published: true });
      await load();
      setToast(`${list.length} média${list.length > 1 ? "s" : ""} ajouté${list.length > 1 ? "s" : ""}.`);
      setTimeout(() => setToast(""), 2200);
    } catch (e) { setError(e?.message || "Import impossible."); }
    finally { setBusy(false); }
  };

  const remove = async (asset) => {
    if (!window.confirm(`Supprimer définitivement « ${asset.title || "ce média"} » ?`)) return;
    try { await deleteMedia(asset); setRows((r) => r.filter((x) => x.id !== asset.id)); }
    catch (e) { setError(e?.message || "Suppression impossible."); }
  };

  const copy = async (url) => { try { await navigator.clipboard.writeText(url); setToast("Lien copié."); setTimeout(() => setToast(""), 1800); } catch {} };

  const toggle = async (asset) => { try { const updated = await setPublished("media_assets", asset.id, !asset.published); setRows((r) => r.map((x) => x.id === asset.id ? updated : x)); } catch (e) { setError(e?.message || "Impossible de changer la visibilité."); } };

  const startEdit = (asset) => { setEditingId(asset.id); setDraft({ title: asset.title || "", alt_text: asset.alt_text || "", section_key: asset.section_key }); };
  const cancelEdit = () => { setEditingId(null); setDraft(null); };
  const saveEdit = async (asset) => {
    try {
      const updated = await updateMediaMeta(asset.id, draft);
      setRows((r) => r.map((x) => x.id === asset.id ? updated : x));
      cancelEdit();
      setToast("Média mis à jour."); setTimeout(() => setToast(""), 2200);
    } catch (e) { setError(e?.message || "Modification impossible."); }
  };

  const replaceFile = async (asset, file) => {
    if (!file) return;
    setReplacingId(asset.id); setError("");
    try {
      const updated = await replaceMediaFile(asset, file);
      setRows((r) => r.map((x) => x.id === asset.id ? updated : x));
      setToast("Fichier remplacé — le lien reste le même partout où il est déjà utilisé.");
      setTimeout(() => setToast(""), 3200);
    } catch (e) { setError(e?.message || "Remplacement impossible."); }
    finally { setReplacingId(null); }
  };

  return <div>
    <div className="gnz-page-heading"><div><h1>Médias & photos</h1><p>Bibliothèque centralisée Supabase Storage : photos, vidéos et documents du site.</p></div><div className="gnz-page-actions"><button className="gnz-secondary-button" onClick={load}>Actualiser</button></div></div>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}

    <article className="gnz-card" style={{ marginBottom: 12 }}><div className="gnz-card-body">
      <div className="gnz-toolbar" style={{ marginBottom: 0 }}>
        <select className="gnz-select" value={uploadSection} onChange={(e) => setUploadSection(e.target.value)}>{SECTIONS.map((s) => <option key={s} value={s}>Destination : {s}</option>)}</select>
        <label className="gnz-primary-button" style={{ display: "inline-flex", alignItems: "center", cursor: busy ? "wait" : "pointer" }}>{busy ? "Import en cours…" : "Ajouter des médias"}<input type="file" multiple accept="image/*,video/mp4,application/pdf" hidden disabled={busy} onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} /></label>
        <span className="gnz-muted" style={{ fontSize: 10 }}>15 Mo maximum par fichier. JPG, PNG, WebP, AVIF, MP4, PDF.</span>
      </div>
    </div></article>

    <div className="gnz-toolbar"><select className="gnz-select" value={section} onChange={(e) => setSection(e.target.value)}><option value="all">Toutes les sections</option>{SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select><span className="gnz-status">{rows.length} média{rows.length > 1 ? "s" : ""}</span></div>
    {rows.length ? <div className="gnz-media-grid">{rows.map((asset) => <article className="gnz-media-card" key={asset.id}>
      <div className="gnz-media-preview">{asset.media_type === "image" ? <img src={asset.public_url} alt={asset.alt_text || asset.title || "Média"} loading="lazy" /> : asset.media_type === "video" ? <video src={asset.public_url} controls playsInline preload="metadata" aria-label={`Aperçu vidéo : ${asset.title || "média"}`} /> : <div className="gnz-empty-state">PDF</div>}</div>
      {editingId === asset.id ? <div className="gnz-media-meta">
        <label className="gnz-field" style={{ fontSize: 10 }}>Titre<input className="gnz-input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
        <label className="gnz-field" style={{ fontSize: 10, marginTop: 8 }}>Texte alternatif<input className="gnz-input" value={draft.alt_text} onChange={(e) => setDraft({ ...draft, alt_text: e.target.value })} /></label>
        <label className="gnz-field" style={{ fontSize: 10, marginTop: 8 }}>Rubrique<select className="gnz-select" value={draft.section_key} onChange={(e) => setDraft({ ...draft, section_key: e.target.value })}>{SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
        <div className="gnz-page-actions" style={{ marginTop: 9 }}><button className="gnz-secondary-button" onClick={cancelEdit}>Annuler</button><button className="gnz-primary-button" onClick={() => saveEdit(asset)}>Enregistrer</button></div>
      </div> : <div className="gnz-media-meta"><strong>{asset.title || "Sans titre"}</strong><span>{asset.section_key} · {asset.media_type} · <span className={`gnz-status ${asset.published ? "success" : "warning"}`}>{asset.published ? "Visible" : "Masqué"}</span></span><div className="gnz-page-actions" style={{ marginTop: 9 }}>
        <button className="gnz-secondary-button" onClick={() => startEdit(asset)}>Modifier</button>
        <label className="gnz-secondary-button" style={{ display: "inline-flex", alignItems: "center", cursor: replacingId === asset.id ? "wait" : "pointer" }}>{replacingId === asset.id ? "Remplacement…" : "Remplacer"}<input type="file" accept="image/*,video/mp4,application/pdf" hidden disabled={replacingId === asset.id} onChange={(e) => { replaceFile(asset, e.target.files?.[0]); e.target.value = ""; }} /></label>
        {asset.section_key !== "lookbook" && <button className={`gnz-secondary-button gnz-toggle-button${asset.published ? "" : " is-hidden"}`} onClick={() => toggle(asset)}>{asset.published ? "Masquer" : "Afficher"}</button>}
        <button className="gnz-secondary-button" onClick={() => copy(asset.public_url)}>Copier le lien</button>
        <button className="gnz-danger-button" onClick={() => remove(asset)}>Supprimer</button>
      </div>
      {asset.section_key === "lookbook" && <span className="gnz-muted" style={{ fontSize: 10, display: "block", marginTop: 6 }}>Le fichier réellement envoyé aux clients se gère dans « Contenu du site → Général → Fichier du lookbook », pas ici.</span>}
      </div>}
    </article>)}</div> : <div className="gnz-card"><div className="gnz-empty-state">Aucun média dans cette section. Importez une photo pour commencer.</div></div>}
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}
