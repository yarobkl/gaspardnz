import { useEffect, useState } from "react";
import { addPartnerPhoto, listPartnerPhotos, removePartnerPhoto } from "../../services/adminData.js";

// Photos de prestations d'un partenaire (ex. un pâtissier : des gâteaux déjà
// réalisés), en plus de son logo unique. Volontairement pas encore affiché
// sur le site public — cet écran sert à préparer la galerie à l'avance,
// avant de décider de l'activer.
export default function PartnerPhotosManager({ partnerId, partnerName }) {
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try { setPhotos(await listPartnerPhotos(partnerId)); setError(""); }
    catch (e) { setError(e?.message || "Impossible de charger les photos."); }
  };
  useEffect(() => { load(); }, [partnerId]);

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true); setError("");
    try { await addPartnerPhoto(partnerId, file, { sortOrder: photos.length }); await load(); }
    catch (e) { setError(e?.message || "Import impossible."); }
    finally { setBusy(false); }
  };

  const handleRemove = async (photo) => {
    if (!window.confirm("Retirer cette photo ?")) return;
    setBusy(true); setError("");
    try { await removePartnerPhoto(photo.id); await load(); }
    catch (e) { setError(e?.message || "Suppression impossible."); }
    finally { setBusy(false); }
  };

  return <div className="gnz-field">
    <span>Photos de prestations{partnerName ? ` · ${partnerName}` : ""}</span>
    <span className="gnz-muted" style={{ fontSize: 10, marginTop: -4 }}>Pas encore affichées sur le site : préparez la galerie, elle sera activée plus tard.</span>
    {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
      {photos.map((photo) => (
        <div key={photo.id} style={{ position: "relative", width: 84, height: 84 }}>
          <img src={photo.photo_url} alt={photo.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} />
          <button type="button" onClick={() => handleRemove(photo)} disabled={busy} aria-label="Retirer cette photo"
            style={{ position: "absolute", top: -8, right: -8, width: 34, height: 34, borderRadius: "50%", border: "1px solid rgba(255,255,255,.2)", background: "#0a0602", color: "#e39a9a", cursor: busy ? "wait" : "pointer", lineHeight: 1, fontSize: 16, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            ×
          </button>
        </div>
      ))}
      <label className="gnz-secondary-button" style={{ width: 84, height: 84, display: "flex", alignItems: "center", justifyContent: "center", cursor: busy ? "wait" : "pointer", textAlign: "center", fontSize: 10 }}>
        {busy ? "Import…" : "+ Ajouter"}
        <input type="file" accept="image/*" hidden disabled={busy} onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
    </div>
  </div>;
}
