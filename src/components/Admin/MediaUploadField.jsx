import { useState } from "react";
import { uploadMedia } from "../../services/adminData.js";

// Champ URL classique, plus un bouton pour importer une photo directement —
// au lieu de passer par « Médias & photos » puis copier-coller le lien.
// Le champ texte reste éditable à la main : coller un lien existant marche
// toujours exactement comme avant.
export default function MediaUploadField({ label, value, onChange, uploadSection = "other", accept = "image/*" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const asset = await uploadMedia(file, uploadSection, { title: file.name });
      onChange(asset.public_url);
    } catch (e) { setError(e?.message || "Import impossible."); }
    finally { setBusy(false); }
  };

  return <label className="gnz-field">
    {label}
    <div style={{ display: "flex", gap: 8 }}>
      <input className="gnz-input" value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Coller un lien, ou importer ci-contre" />
      <label className="gnz-secondary-button" style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Import…" : "Importer"}
        <input type="file" accept={accept} hidden disabled={busy} onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
    </div>
    {error && <span style={{ color: "#e39a9a", fontSize: 10 }}>{error}</span>}
  </label>;
}
