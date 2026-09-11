(() => {
  "use strict";

  const safeText = (element) =>
    String(element?.getAttribute?.("aria-label") || element?.textContent || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);

  const sendEvent = (name, params = {}) => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", name, {
      page_path: window.location.pathname,
      page_location: window.location.href.split("?")[0],
      ...params,
    });
  };

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target?.closest?.("a,button,[data-track]");
      if (!target) return;

      const href = target.getAttribute?.("href") || "";
      const trackedName = target.getAttribute?.("data-track");
      const label = safeText(target);

      if (trackedName) {
        sendEvent(trackedName, { cta_label: label });
      }

      if (/calendly\.com/i.test(href)) {
        sendEvent("booking_start", {
          booking_provider: "calendly",
          cta_label: label || "Calendly",
        });
        return;
      }

      if (/wa\.me|whatsapp\.com/i.test(href)) {
        sendEvent("whatsapp_click", {
          contact_channel: "whatsapp",
          cta_label: label || "WhatsApp",
        });
        return;
      }

      if (/prendre\s+(un\s+)?rendez[- ]?vous|r[ée]server|rendez[- ]?vous/i.test(label)) {
        sendEvent("booking_cta_click", { cta_label: label });
      }
    },
    { passive: true },
  );
})();
