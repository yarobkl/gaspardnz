import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const configuredModel = String(process.env.GEMINI_MODEL || "").trim();
const MODEL = !configuredModel || configuredModel === "gemini-2.5-flash" ? "gemini-3.8-flash" : configuredModel;

function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquant");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function requireAdmin(req, supabase) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false, status: 401, error: "Session administrateur requise" };
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  const email = authData?.user?.email?.toLowerCase();
  if (authError || !email) return { ok: false, status: 401, error: "Session invalide" };
  const { data: access } = await supabase.from("admin_access").select("role,active").eq("email", email).maybeSingle();
  if (!access?.active || !["owner", "admin"].includes(access.role)) return { ok: false, status: 403, error: "Accès administrateur requis" };
  return { ok: true };
}

const clean = (value, max = 3000) => String(value ?? "").slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "GEMINI_API_KEY manquante dans Vercel" });
  let supabase;
  try { supabase = adminClient(); } catch { return res.status(503).json({ error: "Service admin non configuré" }); }
  const auth = await requireAdmin(req, supabase);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

  const lead = req.body?.lead;
  if (!lead?.id) return res.status(400).json({ error: "Prospect invalide" });
  const prompt = `Tu es l'assistant commercial interne de GaspardNZ. Analyse ce prospect uniquement pour aider un administrateur humain. Ne prétends pas avoir contacté le prospect et ne déclenche aucune action.

Retourne exactement quatre rubriques en français :
1. Résumé (2 phrases maximum)
2. Niveau de priorité (faible, moyen ou élevé, avec justification)
3. Prochaine action recommandée (une action concrète)
4. Tags suggérés (3 tags maximum, séparés par des virgules)

Données CRM :
- Nom : ${clean(lead.full_name, 160)}
- Email : ${clean(lead.email, 240)}
- Téléphone : ${clean(lead.phone, 100)}
- Besoin : ${clean(lead.request_type, 160)}
- Message : ${clean(lead.message, 2200)}
- Source : ${clean(lead.source || lead.channel, 160)}
- Statut : ${clean(lead.status, 80)}
- Valeur estimée : ${clean(lead.estimated_value, 80)} ${clean(lead.currency, 20)}`;

  try {
    const models = [...new Set([MODEL, "gemini-3.6-flash", "gemini-3.5-flash-lite"])]
    let lastDetail = "Erreur Gemini inconnue";
    for (const model of models) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 700 } }),
      });
      const data = await response.json();
      if (response.ok) {
        const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
        if (text) return res.status(200).json({ analysis: text, model });
        lastDetail = "Réponse Gemini vide";
        continue;
      }
      lastDetail = String(data?.error?.message || `Gemini HTTP ${response.status}`).slice(0, 240);
      console.error("Gemini error", { status: response.status, detail: lastDetail, model });
      if (![429, 500, 503].includes(response.status)) break;
    }
    return res.status(502).json({ error: "Gemini n'a pas répondu correctement", detail: lastDetail });
  } catch (error) {
    console.error("admin-gemini error", error?.message || error);
    return res.status(502).json({ error: "Analyse Gemini indisponible" });
  }
}

