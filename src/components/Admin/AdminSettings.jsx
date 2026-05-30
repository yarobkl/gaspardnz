import { useState } from "react";

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
      {saveMessage && (
        <div
          style={{
            padding: "0.8rem",
            background: "rgba(92,175,45,0.1)",
            border: "1px solid rgba(92,175,45,0.3)",
            borderRadius: "4px",
            color: "#5caf2d",
            fontSize: "12px",
            marginBottom: "1rem",
          }}>
          {saveMessage}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        {!editMode && (
          <button
            onClick={() => {
              setEditMode(true);
              setFormData(settings);
            }}
            style={{
              padding: "0.8rem 1.4rem",
              background: "#b8973e",
              border: "none",
              borderRadius: "4px",
              color: "#0a0602",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              cursor: "pointer",
            }}>
            Éditer
          </button>
        )}
        {editMode && (
          <>
            <button
              onClick={handleSave}
              style={{
                padding: "0.8rem 1.4rem",
                background: "#5caf2d",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "600",
                textTransform: "uppercase",
                cursor: "pointer",
              }}>
              Enregistrer
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: "0.8rem 1.4rem",
                background: "rgba(184,151,62,0.1)",
                border: "1px solid rgba(184,151,62,0.3)",
                borderRadius: "4px",
                color: "#b8973e",
                fontSize: "12px",
                cursor: "pointer",
              }}>
              Annuler
            </button>
          </>
        )}
        <button
          onClick={handleResetToDefaults}
          style={{
            marginLeft: "auto",
            padding: "0.8rem 1.4rem",
            background: "rgba(200,50,50,0.1)",
            border: "1px solid rgba(200,50,50,0.3)",
            borderRadius: "4px",
            color: "#ff6b6b",
            fontSize: "12px",
            cursor: "pointer",
          }}>
          Réinitialiser
        </button>
      </div>

      {/* General Settings */}
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(184,151,62,0.2)",
          borderRadius: "8px",
          padding: "1.6rem",
          marginBottom: "2rem",
        }}>
        <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 0 }}>
          Paramètres Généraux
        </h3>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#b8973e", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Titre du Site
          </label>
          {editMode ? (
            <input
              type="text"
              name="siteTitle"
              value={formData.siteTitle}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <p style={{ margin: 0, fontSize: "14px", color: "#faf7f2" }}>{settings.siteTitle}</p>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#b8973e", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Titre Hero
          </label>
          {editMode ? (
            <input
              type="text"
              name="heroTitle"
              value={formData.heroTitle}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <p style={{ margin: 0, fontSize: "14px", color: "#faf7f2" }}>{settings.heroTitle}</p>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#b8973e", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Sous-titre Hero
          </label>
          {editMode ? (
            <input
              type="text"
              name="heroSubtitle"
              value={formData.heroSubtitle}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <p style={{ margin: 0, fontSize: "14px", color: "#faf7f2" }}>{settings.heroSubtitle}</p>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#b8973e", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Adresse de la Maison
          </label>
          {editMode ? (
            <input
              type="text"
              name="maisonAddress"
              value={formData.maisonAddress}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <p style={{ margin: 0, fontSize: "14px", color: "#faf7f2" }}>{settings.maisonAddress}</p>
          )}
        </div>
      </div>

      {/* Contact Settings */}
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(184,151,62,0.2)",
          borderRadius: "8px",
          padding: "1.6rem",
          marginBottom: "2rem",
        }}>
        <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 0 }}>
          Paramètres de Contact
        </h3>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#b8973e", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Numéro WhatsApp
          </label>
          {editMode ? (
            <input
              type="tel"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <p style={{ margin: 0, fontSize: "14px", color: "#faf7f2" }}>{settings.whatsappNumber}</p>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#b8973e", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            URL Calendly
          </label>
          {editMode ? (
            <input
              type="url"
              name="calendlyUrl"
              value={formData.calendlyUrl}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <p style={{ margin: 0, fontSize: "14px", color: "#faf7f2" }}>{settings.calendlyUrl}</p>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#b8973e", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            URL Instagram
          </label>
          {editMode ? (
            <input
              type="url"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          ) : (
            <p style={{ margin: 0, fontSize: "14px", color: "#faf7f2" }}>{settings.instagramUrl}</p>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(184,151,62,0.2)",
          borderRadius: "8px",
          padding: "1.6rem",
        }}>
        <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 0 }}>
          Tarification
        </h3>

        {Object.entries(formData.formulaPrices).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "11px", color: "#b8973e", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              {key.replace("formule", "Formule ")}
            </label>
            {editMode ? (
              <input
                type="number"
                value={value}
                onChange={(e) => handlePriceChange(key, e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(184,151,62,0.2)",
                  borderRadius: "4px",
                  color: "#faf7f2",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <p style={{ margin: 0, fontSize: "14px", color: "#faf7f2" }}>{value}€</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
