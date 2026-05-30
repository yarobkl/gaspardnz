import { useState } from "react";
import "../../styles/admin.css";

const AdminSettings = () => {
  const SETTINGS_KEY = "gaspardnz_settings";

  const defaultSettings = {
    siteTitle: "GASPARDNZ",
    heroTitle: "Événements d'Exception",
    heroSubtitle: "Création et organisation d'événements mémorables",
    whatsappNumber: "+33612345678",
    calendlyUrl: "https://calendly.com/gaspardnz",
    instagramUrl: "https://instagram.com/gaspardnz",
    maisonAddress: "Paris, France",
    formulaPrices: {
      formule1: 1500,
      formule2: 2500,
      formule3: 5000,
    },
  };

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(settings);
  const [saveMessage, setSaveMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePriceChange = (formulaKey, value) => {
    setFormData({
      ...formData,
      formulaPrices: {
        ...formData.formulaPrices,
        [formulaKey]: parseFloat(value) || 0,
      },
    });
  };

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(formData));
    setSettings(formData);
    setEditMode(false);
    setSaveMessage("Paramètres sauvegardés avec succès");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleReset = () => {
    setFormData(settings);
    setEditMode(false);
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser tous les paramètres par défaut ?")) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      setSettings(defaultSettings);
      setFormData(defaultSettings);
      setEditMode(false);
      setSaveMessage("Paramètres réinitialisés par défaut");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      {saveMessage && <div className="admin-alert admin-alert-success">{saveMessage}</div>}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {!editMode && (
          <button
            onClick={() => {
              setEditMode(true);
              setFormData(settings);
            }}
            className="admin-btn">
            Éditer
          </button>
        )}
        {editMode && (
          <>
            <button onClick={handleSave} className="admin-btn-success">
              Enregistrer
            </button>
            <button onClick={handleReset} className="admin-btn-secondary">
              Annuler
            </button>
          </>
        )}
        <button onClick={handleResetToDefaults} className="admin-btn-danger" style={{ marginLeft: "auto" }}>
          Réinitialiser
        </button>
      </div>

      {/* General Settings */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <h3 className="admin-h3" style={{ marginTop: 0 }}>Paramètres Généraux</h3>

        <div className="admin-form-group">
          <label className="admin-label">Titre du Site</label>
          {editMode ? (
            <input type="text" name="siteTitle" value={formData.siteTitle} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.siteTitle}</p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Titre Hero</label>
          {editMode ? (
            <input type="text" name="heroTitle" value={formData.heroTitle} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.heroTitle}</p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Sous-titre Hero</label>
          {editMode ? (
            <input type="text" name="heroSubtitle" value={formData.heroSubtitle} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.heroSubtitle}</p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Adresse de la Maison</label>
          {editMode ? (
            <input type="text" name="maisonAddress" value={formData.maisonAddress} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.maisonAddress}</p>
          )}
        </div>
      </div>

      {/* Contact Settings */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <h3 className="admin-h3" style={{ marginTop: 0 }}>Paramètres de Contact</h3>

        <div className="admin-form-group">
          <label className="admin-label">Numéro WhatsApp</label>
          {editMode ? (
            <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.whatsappNumber}</p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">URL Calendly</label>
          {editMode ? (
            <input type="url" name="calendlyUrl" value={formData.calendlyUrl} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.calendlyUrl}</p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">URL Instagram</label>
          {editMode ? (
            <input type="url" name="instagramUrl" value={formData.instagramUrl} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.instagramUrl}</p>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="admin-card">
        <h3 className="admin-h3" style={{ marginTop: 0 }}>Tarification</h3>

        {Object.entries(formData.formulaPrices).map(([key, value]) => (
          <div key={key} className="admin-form-group">
            <label className="admin-label">{key.replace("formule", "Formule ")}</label>
            {editMode ? (
              <input type="number" value={value} onChange={(e) => handlePriceChange(key, e.target.value)} className="admin-input" />
            ) : (
              <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{value}€</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
