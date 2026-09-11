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
      let automaticEvent = null;
      let automaticParams = {};

      if (/calendly\.com/i.test(href)) {
        automaticEvent = "booking_start";
        automaticParams = { booking_provider: "calendly", cta_label: label || "Calendly" };
      } else if (/wa\.me|whatsapp\.com/i.test(href)) {
        automaticEvent = "whatsapp_click";
        automaticParams = { contact_channel: "whatsapp", cta_label: label || "WhatsApp" };
      }

      if (trackedName) {
        sendEvent(trackedName, { cta_label: label });
      }

      if (automaticEvent) {
        if (trackedName !== automaticEvent) sendEvent(automaticEvent, automaticParams);
        return;
      }

      if (!trackedName && /prendre\s+(un\s+)?rendez[- ]?vous|r[ée]server|rendez[- ]?vous/i.test(label)) {
        sendEvent("booking_cta_click", { cta_label: label });
      }
    },
    { passive: true },
  );
})();
