import { getTrackingContext } from './siteTracking.js';
export async function saveContactIntent(contact, requestId, channel) {
  const response = await fetch('/api/contact-intent', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...contact, requestId, channel, visitorId: getTrackingContext().visitor_id || null }),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok !== true) throw new Error(result.error || 'Enregistrement impossible. Réessayez.');
}
