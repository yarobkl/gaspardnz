import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://imvjudhhtcdmtyhfhksm.supabase.co";
const DEFAULT_PUBLISHABLE_KEY = "sb_publishable_h-yM5GnpgOHp5TlS0nzZhA_YgughX33";

export const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "gnz-admin-auth",
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export const publicEventEndpoint = `${SUPABASE_URL}/functions/v1/public-event`;

export async function sendPublicEvent(type, payload) {
  try {
    const response = await fetch(publicEventEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ type, payload }),
      // keepalive : la requête va au bout même si le visiteur ferme la page
      // juste après avoir envoyé un formulaire.
      keepalive: true,
    });
    if (!response.ok) return { ok: false, status: response.status };
    return await response.json();
  } catch {
    return { ok: false, status: 0 };
  }
}

// Formulaires : le visiteur voit la confirmation tout de suite et
// l'enregistrement se fait en arrière-plan. Sur mobile (4G) un appel peut se
// perdre : on réessaie (réseau coupé ou erreur serveur uniquement).
export async function sendPublicEventWithRetry(type, payload, delays = [1000, 3000]) {
  let result = await sendPublicEvent(type, payload);
  for (const delay of delays) {
    if (result?.ok || (result?.status && result.status < 500)) break;
    await new Promise((resolve) => setTimeout(resolve, delay));
    result = await sendPublicEvent(type, payload);
  }
  return result;
}
