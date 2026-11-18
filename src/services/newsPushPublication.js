import { supabase } from "./supabaseClient.js";
import { notificationEndpoint } from "./notificationEndpoint.js";

async function authorizedPost(path, body, token) {
  const response = await fetch(notificationEndpoint(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Envoi des notifications indisponible");
  return result;
}

// Appelé seulement lors du passage brouillon -> publié. Une reprise est
// possible sans renvoyer la même actualité à ceux qui l'ont déjà reçue.
export async function notifyPublishedNews(articleId) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Session administrateur expirée");

  const created = await authorizedPost("/api/admin-notifications", { source_news_id: articleId }, token);
  const id = created.campaign?.id;
  if (!id) throw new Error("Campagne de notification introuvable");
  if (created.campaign?.status === "sent") return { sent: 0, alreadySent: true };

  let remaining = 1, sent = 0, failed = 0, attempts = 0;
  while (remaining > 0 && attempts++ < 100) {
    const result = await authorizedPost("/api/notifications/send-campaign", { id }, token);
    remaining = result.remaining;
    sent += result.sent || 0;
    failed += result.failed || 0;
  }
  if (remaining > 0) throw new Error("Envoi partiel. Reprenez depuis Notifications clients.");
  return { sent, failed };
}
