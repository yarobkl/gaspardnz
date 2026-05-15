const GA_ID = "G-N283W7662X";

export function initGA() {
  if (window._gaLoaded) return;
  window._gaLoaded = true;

  const s = document.createElement("script");
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  s.async = true;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
}

export function initGAIfConsented() {
  if (localStorage.getItem("gnz-cookies") === "accepted") initGA();
}
