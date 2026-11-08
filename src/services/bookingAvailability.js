import { Capacitor, CapacitorHttp } from "@capacitor/core";

const endpoint = (path) => Capacitor.isNativePlatform() ? `https://gaspardnz.style${path}` : path;

export async function listBookingAvailability() {
  if (Capacitor.isNativePlatform()) {
    const response = await CapacitorHttp.get({ url: endpoint("/api/availability"), headers: { "Cache-Control": "no-cache" } });
    const payload = typeof response.data === "string" ? JSON.parse(response.data || "{}") : response.data || {};
    if (response.status < 200 || response.status >= 300) throw new Error(payload.error || "Disponibilités indisponibles");
    return payload.availability || [];
  }
  const response = await fetch(endpoint("/api/availability"), { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Disponibilités indisponibles");
  return payload.availability || [];
}

export async function requestBooking(values) {
  if (Capacitor.isNativePlatform()) {
    const response = await CapacitorHttp.post({ url: endpoint("/api/booking-request"), headers: { "Content-Type": "application/json" }, data: values });
    const payload = typeof response.data === "string" ? JSON.parse(response.data || "{}") : response.data || {};
    if (response.status < 200 || response.status >= 300) throw new Error(payload.error || "Impossible d’envoyer la demande");
    return payload;
  }
  const response = await fetch(endpoint("/api/booking-request"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Impossible d’envoyer la demande");
  return payload;
}
