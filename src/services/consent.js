export const CONSENT_STORAGE_KEY = "gnz-consent-v1";
export const LEGACY_CONSENT_STORAGE_KEY = "gnz-cookies";
export const CONSENT_CHANGED_EVENT = "gnz:consent-changed";
export const OPEN_COOKIE_SETTINGS_EVENT = "gnz:open-cookie-settings";

const CONSENT_VERSION = 1;

const undecidedPreferences = () => ({
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: null,
});

const safeLocalStorage = (method, ...args) => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage?.[method]?.(...args) ?? null;
  } catch {
    return null;
  }
};

const normalizeStoredPreferences = (value) => {
  if (!value || typeof value !== "object") return null;
  if (value.version !== CONSENT_VERSION) return null;
  if (typeof value.analytics !== "boolean" || typeof value.marketing !== "boolean") return null;

  return {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: value.analytics,
    marketing: value.marketing,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
};

const getLegacyPreferences = () => {
  const legacy = safeLocalStorage("getItem", LEGACY_CONSENT_STORAGE_KEY);
  if (legacy !== "accepted" && legacy !== "declined") return null;

  return {
    ...undecidedPreferences(),
    analytics: legacy === "accepted",
    marketing: false,
  };
};

export function getStoredConsentPreferences() {
  const raw = safeLocalStorage("getItem", CONSENT_STORAGE_KEY);
  if (raw) {
    try {
      const normalized = normalizeStoredPreferences(JSON.parse(raw));
      if (normalized) return normalized;
    } catch {
      // An unreadable value is not evidence of consent.
    }
  }

  return getLegacyPreferences();
}

export function getConsentPreferences() {
  return getStoredConsentPreferences() || undecidedPreferences();
}

export function hasConsentDecision() {
  return getStoredConsentPreferences() !== null;
}

export function hasConsent(category) {
  if (category === "necessary") return true;
  if (category !== "analytics" && category !== "marketing") return false;
  return getStoredConsentPreferences()?.[category] === true;
}

export function saveConsentPreferences(preferences = {}) {
  const next = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: preferences.analytics === true,
    marketing: preferences.marketing === true,
    updatedAt: new Date().toISOString(),
  };

  safeLocalStorage("setItem", CONSENT_STORAGE_KEY, JSON.stringify(next));
  safeLocalStorage("removeItem", LEGACY_CONSENT_STORAGE_KEY);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: next }));
  }
  return next;
}

export function subscribeToConsentChanges(listener) {
  if (typeof window === "undefined") return () => {};
  const handler = (event) => listener(event.detail || getConsentPreferences());
  window.addEventListener(CONSENT_CHANGED_EVENT, handler);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handler);
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT));
}

export function subscribeToCookieSettingsRequests(listener) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, listener);
  return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, listener);
}
