import { useEffect } from "react";
import { motion } from "framer-motion";
import { CALCOM_BOOKING_PATH, CALCOM_BOOKING_URL, CREAM, GOLD, TEXT } from "../constants.js";

// Charge l'embed officiel Cal.com sans ajouter de dépendance à l'application.
// Le widget reste strictement réservé au site web ; la réservation iOS native
// continue d'utiliser son formulaire et ses disponibilités existants.
function ensureCalEmbed() {
  if (window.Cal) return window.Cal;

  ((host, scriptUrl) => {
    const enqueue = (api, args) => api.q.push(args);
    host.Cal = function () {
      const cal = host.Cal;
      const args = arguments;

      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        document.head.appendChild(script);
        cal.loaded = true;
      }

      if (args[0] === "init") {
        const namespace = args[1];
        if (typeof namespace === "string") {
          const api = function () { enqueue(api, arguments); };
          api.q = [];
          cal.ns[namespace] = cal.ns[namespace] || api;
          enqueue(cal.ns[namespace], args);
          enqueue(cal, ["initNamespace", namespace]);
        } else {
          enqueue(cal, args);
        }
        return;
      }

      enqueue(cal, args);
    };
  })(window, "https://app.cal.com/embed/embed.js");

  return window.Cal;
}

export default function CalBookingPanel({ onClose, focusTrapRef }) {
  useEffect(() => {
    const cal = ensureCalEmbed();
    cal("init", "gaspardnz", { origin: "https://app.cal.com" });
    cal.ns.gaspardnz("inline", {
      elementOrSelector: "#gnz-cal-booking",
      calLink: CALCOM_BOOKING_PATH,
      config: { layout: "month_view" },
    });
    cal.ns.gaspardnz("ui", {
      theme: "light",
      styles: { branding: { brandColor: GOLD }, body: { backgroundColor: CREAM } },
      cssVarsPerTheme: {
        light: {
          "cal-brand": GOLD,
          "cal-bg": CREAM,
          "cal-bg-subtle": CREAM,
          "cal-bg-muted": CREAM,
          "cal-border-booker": "transparent",
          "cal-border-booker-width": "0px",
          "cal-border-subtle": "rgba(184, 151, 62, 0.2)",
          "cal-text": TEXT,
        },
      },
      layout: "month_view",
    });
  }, []);

  return (
    <motion.div
      ref={focusTrapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gnz-cal-title"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.32 }}
      onClick={(event) => event.stopPropagation()}
      style={{
        width: "100%", maxWidth: 960, maxHeight: "min(90dvh, 920px)",
        overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch",
        color: TEXT, background: CREAM, border: `1px solid ${GOLD}`,
        boxShadow: "0 18px 65px rgba(0,0,0,.4)",
      }}
    >
      <div style={{ padding: "clamp(1rem, 4vw, 2rem)", borderBottom: `1px solid rgba(184,151,62,.25)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
          <div>
            <p style={{ color: GOLD, fontFamily: "'Montserrat', sans-serif", letterSpacing: ".26em", fontSize: 10, margin: "0 0 .5rem", textTransform: "uppercase" }}>Gaspard NZ · Paris</p>
            <h2 id="gnz-cal-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 400, lineHeight: 1.05, margin: 0 }}>Votre rendez-vous</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer les rendez-vous"
            style={{ background: "transparent", border: `1px solid rgba(184,151,62,.4)`, color: TEXT, fontSize: 25, minWidth: 44, minHeight: 44, cursor: "pointer" }}>×</button>
        </div>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 12, lineHeight: 1.65, color: "rgba(28,18,8,.72)", margin: "1rem 0 0" }}>
          Choisissez le créneau qui vous convient pour rencontrer Gaspard et imaginer une allure qui vous ressemble.
        </p>
      </div>

      <div style={{ padding: "clamp(.4rem, 2vw, 1rem)", minHeight: 560 }}>
        <div data-testid="cal-booking-surface" style={{
          position: "relative", isolation: "isolate", background: CREAM, overflow: "hidden",
        }}>
          <div id="gnz-cal-booking" aria-label="Calendrier de réservation GaspardNZ"
            style={{
              position: "relative", zIndex: 1, width: "100%", minHeight: 540,
              overflow: "auto", background: CREAM,
            }} />
          {/* Teinte protectrice pour les navigateurs iOS où l'iframe reste blanche. */}
          <div aria-hidden="true" data-testid="cal-cream-tint" style={{
            position: "absolute", zIndex: 2, inset: 0, pointerEvents: "none",
            backdropFilter: "sepia(0.22) brightness(0.97)",
            WebkitBackdropFilter: "sepia(0.22) brightness(0.97)",
          }} />
          {/* Le filigrane reste visible quel que soit le fond opaque de l'iframe Cal.com. */}
          <img src="/images/gaspardnz-watermark.svg" alt="" aria-hidden="true"
            data-testid="cal-watermark"
            style={{
              position: "absolute", zIndex: 3, top: "51%", left: "50%",
              transform: "translate(-50%, -50%)", width: "min(82%, 670px)",
              maxHeight: 460, objectFit: "contain", opacity: 0.07,
              pointerEvents: "none", userSelect: "none",
            }} />
        </div>
      </div>

      <div style={{ padding: "0 1rem 1.25rem", textAlign: "center" }}>
        <a href={CALCOM_BOOKING_URL} target="_blank" rel="noopener noreferrer"
          data-track="booking_start"
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 11, color: TEXT, textDecorationColor: GOLD, textUnderlineOffset: 4 }}>
          Ouvrir le calendrier dans un nouvel onglet
        </a>
      </div>
    </motion.div>
  );
}
