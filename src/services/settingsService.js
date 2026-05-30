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

export const getSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("settingsUpdated", { detail: settings }));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};

export const getDefaultSettings = () => defaultSettings;

export const subscribeToSettingsChanges = (callback) => {
  window.addEventListener("settingsUpdated", (e) => callback(e.detail));
  return () => window.removeEventListener("settingsUpdated", callback);
};
