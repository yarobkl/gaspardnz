import { useEffect, useState } from "react";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

// Identical to the published website event; dates are always loaded live from Cal.com.
export const CAL_BOOKING_URL = "https://cal.com/gaspardnz-s-habiller-autrement-ghzqy2/rendez-vous";
const CAL_BOOKING_PATH = "gaspardnz-s-habiller-autrement-ghzqy2/rendez-vous";
const CAL_NAMESPACE = "gaspardnz-ios";

function appointmentNotice(lang, status) {
  const french = {
    "waiting-native": "Réservation acceptée. Activez les notifications sur votre iPhone pour recevoir les rappels GNZ PARIS.",
    scheduled: "Rappels iPhone activés : la veille et deux heures avant le rendez-vous, lorsque ces délais sont encore possibles.",
    pending: "Votre demande est enregistrée chez Cal.com. Nous attendons sa confirmation avant d’activer les rappels.",
    "permission-denied": "Votre rendez-vous est enregistré, mais les notifications sont désactivées. Autorisez-les dans Réglages pour les prochains rappels.",
    unavailable: "Votre rendez-vous est enregistré, mais les rappels iPhone n’ont pas pu être programmés.",
    invalid: "Cal.com a enregistré votre rendez-vous, mais n’a pas transmis toutes les informations nécessaires aux rappels iPhone.",
    "other-device": "Cal.com a enregistré votre rendez-vous. Les rappels natifs ne sont disponibles que dans l’application iPhone GNZ PARIS.",
  };
  const english = {
    "waiting-native": "Booking accepted. Allow iPhone notifications to receive GNZ PARIS reminders.",
    scheduled: "iPhone reminders enabled: one day and two hours before your appointment, when applicable.",
    pending: "Your request was sent to Cal.com. We will wait for confirmation before enabling reminders.",
    "permission-denied": "Your appointment is saved, but notifications are disabled. Enable them in Settings for future reminders.",
    unavailable: "Your appointment is saved, but we could not schedule iPhone reminders.",
    invalid: "Cal.com saved your appointment but did not provide enough details for iPhone reminders.",
    "other-device": "Cal.com saved your appointment. Native reminders are available in the GNZ PARIS iPhone app.",
  };
  return (lang === "FR" ? french : english)[status] ?? "";
}

function isNativeBookingBridgeAvailable() {
  return Capacitor.getPlatform() === "ios" &&
    typeof window.webkit?.messageHandlers?.gnzBookingReminders?.postMessage === "function";
}

// Cal.com SDK listeners are global and have no lifecycle-specific `off` API.
// Install the SDK listener once and dispatch to the mounted booking screen.
function registerBookingSuccessListener(cal) {
  if (window.__gnzCalBookingListenerRegistered) return;
  window.__gnzCalBookingListenerRegistered = true;
  cal("on", {
    action: "bookingSuccessfulV2",
    callback: (event) => {
      if (event?.detail?.namespace !== CAL_NAMESPACE) return;
      window.dispatchEvent(new CustomEvent("gnz:cal-booking-success", { detail: event.detail.data }));
    },
  });
}

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
  const [reminderStatus, setReminderStatus] = useState("");

  useEffect(() => {
    const bookingSucceeded = (event) => {
      const data = event.detail || {};
      const status = String(data.status || "").toUpperCase();
      if (!(["ACCEPTED", "CONFIRMED"].includes(status))) {
        setReminderStatus("pending");
        return;
      }
      if (!isNativeBookingBridgeAvailable()) {
        setReminderStatus("other-device");
        return;
      }
      setReminderStatus("waiting-native");
      try {
        window.webkit.messageHandlers.gnzBookingReminders.postMessage({
          type: "cal-booking-success",
          uid: data.uid,
          startTime: data.startTime,
          status,
        });
      } catch {
        setReminderStatus("unavailable");
      }
    };
    const nativeReminderResult = (event) => {
      const status = event.detail?.status;
      if (["scheduled", "pending", "permission-denied", "invalid", "unavailable"].includes(status)) {
        setReminderStatus(status);
      }
    };
    window.addEventListener("gnz:cal-booking-success", bookingSucceeded);
    window.addEventListener("gnz:appointment-reminder-result", nativeReminderResult);
    return () => {
      window.removeEventListener("gnz:cal-booking-success", bookingSucceeded);
      window.removeEventListener("gnz:appointment-reminder-result", nativeReminderResult);
    };
  }, []);

  useEffect(() => {
    const cal = calEmbed();
    cal("init", CAL_NAMESPACE, { origin: "https://app.cal.com" });
    registerBookingSuccessListener(cal);
    cal.ns[CAL_NAMESPACE]("inline", {
      elementOrSelector: "#gnz-native-cal-booking",
      calLink: CAL_BOOKING_PATH,
      config: { layout: "month_view" },
    });
    cal.ns[CAL_NAMESPACE]("ui", {
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
    {reminderStatus && <p className="gnz-native-booking-reminder" role="status" data-testid="gnz-appointment-reminder-status">{appointmentNotice(lang, reminderStatus)}</p>}
    {embedError && <p role="alert" className="gnz-native-booking-error">{lang === "FR" ? "Le calendrier intégré n'a pas pu charger. Utilisez le bouton ci-dessous." : "The calendar could not load. Open it below."}</p>}
    <div id="gnz-native-cal-booking" aria-label="Calendrier de réservation GaspardNZ" className="gnz-native-cal-embed" data-testid="native-cal-booking" />
    <button type="button" onClick={openCalendar} className="gnz-native-booking-contact gnz-native-cal-fallback">
      {lang === "FR" ? "Ouvrir le calendrier des rendez-vous ↗" : lang === "EN" ? "Open the booking calendar ↗" : lang === "ES" ? "Abrir el calendario de citas ↗" : "打开预约日历 ↗"}
    </button>
    <p className="gnz-native-cal-external-hint">{lang === "FR" ? "Pour recevoir les rappels iPhone GNZ PARIS, réservez directement dans le calendrier intégré ci-dessus. Une réservation ouverte dans le navigateur reste gérée par les confirmations Cal.com." : "For GNZ PARIS iPhone reminders, book in the calendar above. External browser bookings use Cal.com confirmations."}</p>
  </div>;
}
