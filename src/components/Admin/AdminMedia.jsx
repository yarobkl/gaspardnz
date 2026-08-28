import { useEffect, useState } from "react";
import { deleteMedia, listMedia, uploadMedia } from "../../services/adminData.js";
import "../../styles/admin-v2.css";

const SECTIONS = ["hero","gallery","style-journal","wedding","vip","showroom","actualites","style-month","partners","promotions","other"];

export default function AdminMedia() {
  const [section, setSection] = useState("all");
  const [uploadSection, setUploadSection] = useState("gallery");
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

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
      <div className="gnz-media-preview">{asset.media_type === "image" ? <img src={asset.public_url} alt={asset.alt_text || asset.title || "Média"} loading="lazy" /> : asset.media_type === "video" ? <video src={asset.public_url} muted preload="metadata" /> : <div className="gnz-empty-state">PDF</div>}</div>
      <div className="gnz-media-meta"><strong>{asset.title || "Sans titre"}</strong><span>{asset.section_key} · {asset.media_type}</span><div className="gnz-page-actions" style={{ marginTop: 9 }}><button className="gnz-secondary-button" onClick={() => copy(asset.public_url)}>Copier le lien</button><button className="gnz-danger-button" onClick={() => remove(asset)}>Supprimer</button></div></div>
    </article>)}</div> : <div className="gnz-card"><div className="gnz-empty-state">Aucun média dans cette section. Importez une photo pour commencer.</div></div>}
    {toast && <div className="gnz-toast">{toast}</div>}
  </div>;
}
