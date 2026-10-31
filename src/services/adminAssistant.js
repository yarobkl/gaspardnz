import { supabase } from "./supabaseClient.js";

export async function askAdminAssistant(question, context = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error("Session administrateur invalide");
  const response = await fetch("/api/admin-assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ question, context }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Assistant indisponible");
  return result;
}
