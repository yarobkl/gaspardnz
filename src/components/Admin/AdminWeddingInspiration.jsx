import { useState, useEffect } from "react";
import { GOLD } from "../../constants.js";
import { getSettings, saveSettings } from "../../services/settingsService.js";

const AdminWeddingInspiration = () => {
  const [inspirations, setInspirations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    color: "",
    style: "",
    occasion: "",
    src: "",
  });

  useEffect(() => {
    const settings = getSettings();
    if (settings.weddingInspirations) {
      setInspirations(settings.weddingInspirations);
    }
  }, []);

  const handleAdd = () => {
    if (!formData.title || !formData.src) {
      alert("Titre et URL image sont obligatoires");
      return;
    }

    const newInspirations = [...inspirations];
    if (editingId !== null) {
      newInspirations[editingId] = { ...formData, id: editingId };
      setEditingId(null);
    } else {
      newInspirations.push({ ...formData, id: newInspirations.length });
    }

    setInspirations(newInspirations);
    saveSettings({ weddingInspirations: newInspirations });
    setFormData({ title: "", desc: "", color: "", style: "", occasion: "", src: "" });
  };

  const handleEdit = (index) => {
    setFormData(inspirations[index]);
    setEditingId(index);
  };

  const handleDelete = (index) => {
    const newInspirations = inspirations.filter((_, i) => i !== index);
    setInspirations(newInspirations);
    saveSettings({ weddingInspirations: newInspirations });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ title: "", desc: "", color: "", style: "", occasion: "", src: "" });
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px" }}>
      <h2 style={{ color: GOLD, marginBottom: "1.5rem" }}>Inspirations Mariage</h2>

      <div style={{ background: "#111009", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem", border: `1px solid rgba(184,151,62,0.2)` }}>
        <h3 style={{ color: "#faf7f2", marginTop: 0 }}>{editingId !== null ? "Modifier" : "Ajouter"} une inspiration</h3>

        <div style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Titre du look"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{ padding: "8px", background: "#0a0602", color: "#faf7f2", border: `1px solid ${GOLD}`, borderRadius: "4px" }}
          />

          <textarea
            placeholder="Description (FR)"
            value={formData.desc}
            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
            style={{ padding: "8px", background: "#0a0602", color: "#faf7f2", border: `1px solid ${GOLD}`, borderRadius: "4px", minHeight: "80px", fontFamily: "inherit" }}
          />

          <input
            type="text"
            placeholder="URL de l'image"
            value={formData.src}
            onChange={(e) => setFormData({ ...formData, src: e.target.value })}
            style={{ padding: "8px", background: "#0a0602", color: "#faf7f2", border: `1px solid ${GOLD}`, borderRadius: "4px" }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Couleurs"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              style={{ padding: "8px", background: "#0a0602", color: "#faf7f2", border: `1px solid ${GOLD}`, borderRadius: "4px" }}
            />
            <input
              type="text"
              placeholder="Style"
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              style={{ padding: "8px", background: "#0a0602", color: "#faf7f2", border: `1px solid ${GOLD}`, borderRadius: "4px" }}
            />
          </div>

          <input
            type="text"
            placeholder="Occasion"
            value={formData.occasion}
            onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
            style={{ padding: "8px", background: "#0a0602", color: "#faf7f2", border: `1px solid ${GOLD}`, borderRadius: "4px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={handleAdd}
            style={{
              padding: "8px 16px",
              background: GOLD,
              color: "#0a0602",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {editingId !== null ? "Modifier" : "Ajouter"}
          </button>
          {editingId !== null && (
            <button
              onClick={handleCancel}
              style={{
                padding: "8px 16px",
                background: "rgba(184,151,62,0.2)",
                color: GOLD,
                border: `1px solid ${GOLD}`,
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {inspirations.map((inspiration, idx) => (
          <div key={idx} style={{ background: "#111009", padding: "1rem", borderRadius: "8px", border: `1px solid rgba(184,151,62,0.2)` }}>
            <div style={{ marginBottom: "0.5rem" }}>
              <h4 style={{ color: GOLD, margin: "0 0 0.5rem 0" }}>{inspiration.title}</h4>
              <p style={{ color: "rgba(245,240,232,0.6)", margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>{inspiration.desc}</p>
              {inspiration.src && (
                <img
                  src={inspiration.src}
                  alt={inspiration.title}
                  style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "4px", marginBottom: "0.5rem" }}
                />
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", fontSize: "0.85rem", color: "rgba(184,151,62,0.7)", marginBottom: "0.5rem" }}>
                {inspiration.color && <span><strong style={{ color: GOLD }}>Couleurs:</strong> {inspiration.color}</span>}
                {inspiration.style && <span><strong style={{ color: GOLD }}>Style:</strong> {inspiration.style}</span>}
                {inspiration.occasion && <span><strong style={{ color: GOLD }}>Occasion:</strong> {inspiration.occasion}</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => handleEdit(idx)}
                style={{
                  padding: "6px 12px",
                  background: "rgba(184,151,62,0.2)",
                  color: GOLD,
                  border: `1px solid ${GOLD}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(idx)}
                style={{
                  padding: "6px 12px",
                  background: "rgba(220,53,69,0.2)",
                  color: "#dc3545",
                  border: "1px solid #dc3545",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminWeddingInspiration;
