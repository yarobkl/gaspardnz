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
  weddingInspirations: [],
  vipClients: [],
};

const mergeSettings = (saved = {}) => ({
  ...defaultSettings,
  ...saved,
  formulaPrices: {
    ...defaultSettings.formulaPrices,
    ...(saved.formulaPrices || {}),
  },
  weddingInspirations: Array.isArray(saved.weddingInspirations) ? saved.weddingInspirations : defaultSettings.weddingInspirations,
  vipClients: Array.isArray(saved.vipClients) ? saved.vipClients : defaultSettings.vipClients,
});

export const getSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? mergeSettings(JSON.parse(saved)) : mergeSettings();
  } catch {
    return mergeSettings();
  }
};

export const saveSettings = (settings) => {
  try {
    const nextSettings = mergeSettings({ ...getSettings(), ...settings });
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    window.dispatchEvent(new CustomEvent("settingsUpdated", { detail: nextSettings }));
    return nextSettings;
  } catch (error) {
    console.error("Error saving settings:", error);
    return getSettings();
  }
};

export const getDefaultSettings = () => mergeSettings();

export const subscribeToSettingsChanges = (callback) => {
  const handler = (e) => callback(e.detail);
  window.addEventListener("settingsUpdated", handler);
  return () => window.removeEventListener("settingsUpdated", handler);
};
