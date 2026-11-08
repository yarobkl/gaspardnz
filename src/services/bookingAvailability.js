export async function listBookingAvailability() {
  const response = await fetch("/api/booking?route=availability");
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Disponibilités indisponibles");
  return payload.availability || [];
}

export async function requestBooking(values) {
  const response = await fetch("/api/booking?route=request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Impossible d’envoyer la demande");
  return payload;
}
