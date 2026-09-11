import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
  key(index) { return [...this.values.keys()][index] ?? null; }
  get length() { return this.values.size; }
}

if (typeof globalThis.CustomEvent !== "function") {
  globalThis.CustomEvent = class CustomEvent extends Event {
    constructor(type, options = {}) {
      super(type);
      this.detail = options.detail;
    }
  };
}

const localStorage = new MemoryStorage();
const sessionStorage = new MemoryStorage();
const windowTarget = new EventTarget();
windowTarget.localStorage = localStorage;
windowTarget.sessionStorage = sessionStorage;
windowTarget.location = { hostname: "localhost", pathname: "/" };
globalThis.window = windowTarget;
globalThis.localStorage = localStorage;
globalThis.sessionStorage = sessionStorage;

const consent = await import("../src/services/consent.js");

assert.equal(consent.hasConsentDecision(), false);
assert.equal(consent.hasConsent("necessary"), true);
assert.equal(consent.hasConsent("analytics"), false);
assert.equal(consent.hasConsent("marketing"), false);

localStorage.setItem(consent.LEGACY_CONSENT_STORAGE_KEY, "accepted");
assert.equal(consent.hasConsentDecision(), true);
assert.equal(consent.hasConsent("analytics"), true);
assert.equal(consent.hasConsent("marketing"), false);

let changedPreferences = null;
const unsubscribe = consent.subscribeToConsentChanges((preferences) => { changedPreferences = preferences; });
const rejected = consent.saveConsentPreferences({ analytics: false, marketing: false });
assert.equal(rejected.necessary, true);
assert.equal(rejected.analytics, false);
assert.equal(rejected.marketing, false);
assert.match(rejected.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
assert.deepEqual(changedPreferences, rejected);
assert.equal(localStorage.getItem(consent.LEGACY_CONSENT_STORAGE_KEY), null);
assert.equal(consent.hasConsentDecision(), true);
assert.equal(consent.hasConsent("analytics"), false);
unsubscribe();

localStorage.setItem(consent.CONSENT_STORAGE_KEY, "not-json");
assert.equal(consent.hasConsentDecision(), false, "invalid storage must never grant consent");
assert.equal(consent.hasConsent("analytics"), false);

localStorage.clear();
const accepted = consent.saveConsentPreferences({ analytics: true, marketing: true });
assert.equal(consent.getConsentPreferences().analytics, true);
assert.equal(consent.getConsentPreferences().marketing, true);
assert.equal(accepted.version, 1);

const appendedScripts = [];
globalThis.document = {
  cookie: "",
  createElement: () => ({
    setAttribute(name, value) { this[name] = value; },
    remove() {
      const index = appendedScripts.indexOf(this);
      if (index >= 0) appendedScripts.splice(index, 1);
    },
  }),
  head: { appendChild(script) { appendedScripts.push(script); } },
  querySelectorAll: () => [...appendedScripts],
};

const analytics = await import("../src/services/analytics.js");
consent.saveConsentPreferences({ analytics: false, marketing: false });
assert.equal(analytics.initGA(), false);
assert.equal(appendedScripts.length, 0, "GA must not load before analytics consent");

consent.saveConsentPreferences({ analytics: true, marketing: false });
assert.equal(analytics.initGA(), true);
assert.equal(appendedScripts.length, 1);
assert.match(appendedScripts[0].src, /googletagmanager\.com\/gtag\/js/);
analytics.disableGA();
assert.equal(appendedScripts.length, 0);
assert.equal(windowTarget._gaLoaded, false);

const app = readFileSync("src/App.jsx", "utf8");
const localTracking = readFileSync("src/services/analyticsTracking.js", "utf8");
const supabaseTracking = readFileSync("src/services/siteTracking.js", "utf8");
const cookieBanner = readFileSync("src/components/CookieBanner.jsx", "utf8");
const footer = readFileSync("src/components/FooterMobile.jsx", "utf8");

assert.match(app, /consentPreferences\.analytics/);
assert.match(localTracking, /hasConsent\("analytics"\)/);
assert.match(supabaseTracking, /hasConsent\("analytics"\)/);
assert.doesNotMatch(supabaseTracking, /queueMicrotask/);
assert.match(cookieBanner, /cookie_decline_all/);
assert.match(cookieBanner, /cookie_accept_all/);
assert.match(cookieBanner, /cookie_customize/);
assert.match(footer, /openCookieSettings/);

for (const [file, source] of [
  ["src/App.jsx", app],
  ["src/services/analytics.js", readFileSync("src/services/analytics.js", "utf8")],
  ["src/services/analyticsTracking.js", localTracking],
  ["src/services/siteTracking.js", supabaseTracking],
  ["src/components/CookieBanner.jsx", cookieBanner],
]) {
  assert.equal(source.includes("gnz-cookies"), false, `${file} must use the central consent service`);
}

console.log("Consent validation passed");
