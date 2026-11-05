export const DEFAULT_BOOKING_AVAILABILITY = { timezone: "Europe/Paris", slots: [] };

export function normalizeBookingAvailability(value) {
  const source = value && typeof value === "object" ? value : {};
  const slots = Array.isArray(source.slots) ? source.slots : [];
  return {
    timezone: source.timezone || "Europe/Paris",
    slots: slots
      .filter((slot) => slot && slot.date && slot.start && slot.end && slot.active !== false)
      .map((slot) => ({
        id: slot.id || `${slot.date}-${slot.start}-${slot.end}`,
        date: String(slot.date),
        start: String(slot.start),
        end: String(slot.end),
        label: slot.label || "",
      }))
      .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`)),
  };
}

export function formatAvailabilitySlot(slot, locale = "fr-FR") {
  const date = new Date(`${slot.date}T${slot.start}:00`);
  const dateLabel = Number.isNaN(date.getTime()) ? slot.date : date.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "long" });
  return `${dateLabel} · ${slot.start}–${slot.end}`;
}

/**
 * Une disponibilité publique ne peut pas être demandée après sa fin.
 * Comparaison en heure locale Europe/Paris (source de vérité de l'admin),
 * même si le téléphone du visiteur utilise un autre fuseau horaire.
 */
export function isFutureBookingSlot(slot, now = new Date()) {
  if (!slot?.date || !slot?.start || !slot?.end) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slot.date) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.start) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.end) ||
      slot.end <= slot.start) return false;
  const paris = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(now);
  return `${slot.date} ${slot.end}` > paris;
}
