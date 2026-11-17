import { useEffect, useState } from "react";
import { Browser } from "@capacitor/browser";

// Identical to the published website event; dates are always loaded live from Cal.com.
export const CAL_BOOKING_URL = "https://cal.com/gaspardnz-s-habiller-autrement-ghzqy2/rendez-vous";
const CAL_BOOKING_PATH = "gaspardnz-s-habiller-autrement-ghzqy2/rendez-vous";

function calEmbed() {
  if (window.Cal) return window.Cal;

  // Official Cal.com embed bootstrap, shared in behavior with the website.
  window.Cal = function () {
    const cal = window.Cal;
    const args = arguments;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      const script = document.createElement("script");
      script.src = "https://app.cal.com/embed/embed.js";
      script.async = true;
      document.head.appendChild(script);
      cal.loaded = true;
    }
    if (args[0] === "init" && typeof args[1] === "string") {
      const namespace = args[1];
      const api = function () { api.q.push(arguments); };
      api.q = [];
      cal.ns[namespace] = cal.ns[namespace] || api;
      cal.ns[namespace].q.push(args);
      cal.q.push(["initNamespace", namespace]);
      return;
    }
    cal.q.push(args);
  };
  return window.Cal;
}

export default function NativeCalBooking({ lang = "FR" }) {
  const [embedError, setEmbedError] = useState(false);

  useEffect(() => {
    const cal = calEmbed();
    cal("init", "gaspardnz-ios", { origin: "https://app.cal.com" });
    cal.ns["gaspardnz-ios"]("inline", {
      elementOrSelector: "#gnz-native-cal-booking",
      calLink: CAL_BOOKING_PATH,
      config: { layout: "month_view" },
    });
    cal.ns["gaspardnz-ios"]("ui", {
      theme: "light",
      styles: { branding: { brandColor: "#a77b4c" }, body: { backgroundColor: "#f5eee5" } },
      layout: "month_view",
    });

    // The booking URL stays usable if iOS blocks the third-party embed.
    const script = document.querySelector('script[src="https://app.cal.com/embed/embed.js"]');
    const onError = () => setEmbedError(true);
    script?.addEventListener("error", onError);
    return () => script?.removeEventListener("error", onError);
  }, []);

  const openCalendar = () => Browser.open({ url: CAL_BOOKING_URL })
    .catch(() => window.open(CAL_BOOKING_URL, "_blank", "noopener,noreferrer"));

  return <div className="gnz-native-cal">
    <p className="gnz-native-cal-lead">{lang === "FR" ? "Choisissez directement une date et un horaire dans notre calendrier à jour." : lang === "EN" ? "Choose a date and time from our live booking calendar." : lang === "ES" ? "Elija una fecha y hora en nuestro calendario actualizado." : "请从实时日历选择预约日期和时间。"}</p>
    {embedError && <p role="alert" className="gnz-native-booking-error">{lang === "FR" ? "Le calendrier intégré n'a pas pu charger. Utilisez le bouton ci-dessous." : "The calendar could not load. Open it below."}</p>}
    <div id="gnz-native-cal-booking" aria-label="Calendrier de réservation GaspardNZ" className="gnz-native-cal-embed" data-testid="native-cal-booking" />
    <button type="button" onClick={openCalendar} className="gnz-native-booking-contact gnz-native-cal-fallback">
      {lang === "FR" ? "Ouvrir le calendrier des rendez-vous ↗" : lang === "EN" ? "Open the booking calendar ↗" : lang === "ES" ? "Abrir el calendario de citas ↗" : "打开预约日历 ↗"}
    </button>
  </div>;
}
