import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const clean = (value, max = 1200) => String(value ?? "").slice(0, max);

function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY manquant");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function requireAdmin(req, supabase) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { ok: false, status: 401, error: "Session administrateur requise" };
  const { data, error } = await supabase.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email) return { ok: false, status: 401, error: "Session invalide" };
  const { data: access } = await supabase.from("admin_access").select("role,active").eq("email", email).maybeSingle();
  if (!access?.active || !["owner", "admin", "editor", "viewer"].includes(access.role)) return { ok: false, status: 403, error: "Accès administrateur requis" };
  return { ok: true };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "GEMINI_API_KEY manquante dans Vercel" });
  let supabase;
  try { supabase = adminClient(); } catch { return res.status(503).json({ error: "Service admin non configuré" }); }
  const auth = await requireAdmin(req, supabase);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.error });
  const question = clean(req.body?.question, 1200).trim();
  if (!question) return res.status(400).json({ error: "Question vide" });
  const [leadsResult, bookingsResult, emailsResult, packagesResult, partnersResult, promotionsResult] = await Promise.all([
    supabase.from("leads").select("full_name,request_type,source,channel,status,marketing_consent,next_follow_up_at,created_at").order("created_at", { ascending: false }).limit(100),
    supabase.from("bookings").select("status,starts_at,title,source,created_at").order("starts_at", { ascending: false }).limit(50),
    supabase.from("email_messages").select("subject,status,provider,created_at,archived_at").is("archived_at", null).order("created_at", { ascending: false }).limit(50),
    supabase.from("packages").select("title,description,price,published,status,updated_at").order("updated_at", { ascending: false }).limit(30),
    supabase.from("partners").select("name,category,description,published,updated_at").order("updated_at", { ascending: false }).limit(30),
    supabase.from("promotions").select("title,description,status,published,starts_at,ends_at,updated_at").order("updated_at", { ascending: false }).limit(30),
  ]);
  const context = { site: "GaspardNZ, styliste parisien : mariages, galas, cérémonies, conseil en image, showroom et partenaires événementiels.", section: clean(req.body?.context?.section, 80), leads: leadsResult.data || [], bookings: bookingsResult.data || [], emails: emailsResult.data || [], packages: packagesResult.data || [], partners: partnersResult.data || [], promotions: promotionsResult.data || [] };
  const prompt = `Tu es l'Assistant GaspardNZ intégré à son espace d'administration. Réponds en français, clairement et directement. Tu peux expliquer le site, les modules admin, les prospects, les réservations, les emails et les statistiques à partir des données fournies. Ne fabrique jamais une donnée absente. Si l'information n'est pas disponible, dis-le. Ne réalise aucune action et ne prétends pas en avoir réalisé une. Pour toute modification, suppression, envoi ou campagne, explique que la validation humaine est nécessaire. Réponds avec des paragraphes courts et, si utile, une liste d'actions. Question : ${question}. Contexte : ${JSON.stringify(context)}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 1000 } }) });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error: "L’assistant n’a pas répondu correctement" });
    const answer = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim();
    if (!answer) return res.status(502).json({ error: "Réponse vide de l’assistant" });
    return res.status(200).json({ answer, model: MODEL });
  } catch { return res.status(502).json({ error: "Assistant indisponible" }); }
}
