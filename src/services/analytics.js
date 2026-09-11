import { GA_ID } from "../constants.js";
import { hasConsent } from "./consent.js";

const GA_SCRIPT_ATTRIBUTE = "data-gnz-ga";
const GA_COOKIE_PREFIXES = ["_ga", "_gid", "_gat"];

const deleteCookie = (name, domain = "") => {
  const domainPart = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}; SameSite=Lax`;
};

const clearGACookies = () => {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`];
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter((name) => GA_COOKIE_PREFIXES.some((prefix) => name?.startsWith(prefix)));

  cookieNames.forEach((name) => domains.forEach((domain) => deleteCookie(name, domain)));
};

export function initGA() {
  if (typeof window === "undefined" || !hasConsent("analytics")) return false;
  if (window._gaLoaded) return true;

  window[`ga-disable-${GA_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  script.setAttribute(GA_SCRIPT_ATTRIBUTE, "1");
  document.head.appendChild(script);
  window._gaLoaded = true;
  return true;
}

export function disableGA({ clearCookies = true } = {}) {
  if (typeof window === "undefined") return;
  window[`ga-disable-${GA_ID}`] = true;
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }

  document.querySelectorAll(`script[${GA_SCRIPT_ATTRIBUTE}], script[src*="googletagmanager.com/gtag/js"]`)
    .forEach((script) => script.remove());
  if (clearCookies) clearGACookies();

  window.dataLayer = [];
  delete window.gtag;
  window._gaLoaded = false;
}

export function initGAIfConsented() {
  return hasConsent("analytics") ? initGA() : false;
}
