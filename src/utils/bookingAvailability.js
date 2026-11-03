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
