import { useState, useEffect } from "react";
import { getSettings, saveSettings, getDefaultSettings, subscribeToSettingsChanges } from "../../services/settingsService.js";
import { useTr } from "../../context.jsx";
import "../../styles/admin.css";

const AdminSettings = () => {
  const t = useTr();
  const [settings, setSettings] = useState(() => {
    const s = getSettings();
    return { ...s, formulaPrices: s.formulaPrices || {} };
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(() => {
    const s = getSettings();
    return { ...s, formulaPrices: s.formulaPrices || {} };
  });
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToSettingsChanges((newSettings) => {
      setSettings(newSettings);
      setFormData(newSettings);
    });
    return unsubscribe;
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePriceChange = (formulaKey, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    if (numValue > 1000000) return;

    setFormData({
      ...formData,
      formulaPrices: {
        ...formData.formulaPrices,
        [formulaKey]: numValue,
      },
    });
  };

  const handleSave = () => {
    saveSettings(formData);
    setSettings(formData);
    setEditMode(false);
    setSaveMessage(t("admin_saved"));
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleReset = () => {
    setFormData(settings);
    setEditMode(false);
  };

  const handleResetToDefaults = () => {
    if (window.confirm(t("admin_reset_defaults_confirm"))) {
      const defaults = getDefaultSettings();
      saveSettings(defaults);
      setSettings(defaults);
      setFormData(defaults);
      setEditMode(false);
      setSaveMessage(t("admin_reset_done"));
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
            {t("admin_edit")}
          </button>
        )}
        {editMode && (
          <>
            <button onClick={handleSave} className="admin-btn-success">
              {t("admin_save")}
            </button>
            <button onClick={handleReset} className="admin-btn-secondary">
              {t("admin_cancel")}
            </button>
          </>
        )}
        <button onClick={handleResetToDefaults} className="admin-btn-danger" style={{ marginLeft: "auto" }}>
          {t("admin_reset")}
        </button>
      </div>

      {/* General Settings */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <h3 className="admin-h3" style={{ marginTop: 0 }}>{t("admin_general_settings")}</h3>

        <div className="admin-form-group">
          <label className="admin-label">{t("admin_site_title")}</label>
          {editMode ? (
            <input type="text" name="siteTitle" value={formData.siteTitle} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.siteTitle}</p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">{t("admin_hero_title")}</label>
          {editMode ? (
            <input type="text" name="heroTitle" value={formData.heroTitle} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.heroTitle}</p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">{t("admin_hero_subtitle")}</label>
          {editMode ? (
            <input type="text" name="heroSubtitle" value={formData.heroSubtitle} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.heroSubtitle}</p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">{t("admin_house_address")}</label>
          {editMode ? (
            <input type="text" name="maisonAddress" value={formData.maisonAddress} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.maisonAddress}</p>
          )}
        </div>
      </div>

      {/* Contact Settings */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <h3 className="admin-h3" style={{ marginTop: 0 }}>{t("admin_contact_settings")}</h3>

        <div className="admin-form-group">
          <label className="admin-label">{t("admin_whatsapp_number")}</label>
          {editMode ? (
            <input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.whatsappNumber}</p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">{t("admin_calendly_url")}</label>
          {editMode ? (
            <input type="url" name="calendlyUrl" value={formData.calendlyUrl} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.calendlyUrl}</p>
          )}
        </div>

        <div className="admin-form-group">
          <label className="admin-label">{t("admin_instagram_url")}</label>
          {editMode ? (
            <input type="url" name="instagramUrl" value={formData.instagramUrl} onChange={handleInputChange} className="admin-input" />
          ) : (
            <p style={{ margin: 0, color: "var(--gnz-cream)" }}>{settings.instagramUrl}</p>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="admin-card">
        <h3 className="admin-h3" style={{ marginTop: 0 }}>{t("admin_pricing")}</h3>

        {Object.entries(formData.formulaPrices).map(([key, value]) => (
          <div key={key} className="admin-form-group">
            <label className="admin-label">{key.replace("formule", "Formule ")}</label>
            {editMode ? (
              <input
                type="number"
                value={value}
                onChange={(e) => handlePriceChange(key, e.target.value)}
                className="admin-input"
                min="0"
                max="1000000"
                step="0.01"
              />
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
