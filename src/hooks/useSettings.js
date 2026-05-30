import { useState, useEffect } from "react";
import { getSettings, subscribeToSettingsChanges } from "../services/settingsService.js";

export const useSettings = () => {
  const [settings, setSettings] = useState(() => getSettings());

  useEffect(() => {
    const unsubscribe = subscribeToSettingsChanges((newSettings) => {
      setSettings(newSettings);
    });
    return unsubscribe;
  }, []);

  return settings;
};
