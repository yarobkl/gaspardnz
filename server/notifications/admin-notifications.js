import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || "https://imvjudhhtcdmtyhfhksm.supabase.co";
const categories = new Set(["arrivage","promotion","evenement","showroom","service","actualite","rappel","personnalise"]);
const statuses = new Set(["draft","scheduled"]);
function client() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Configuration Supabase absente");
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession:false, autoRefreshToken:false } });
}
async function authorize(req, db) {
  const token = String(req.headers.authorization || "").match(/^Bearer (.+)$/)?.[1];
  if (!token) return false;
  const { data } = await db.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (!email) return false;
  const { data: access } = await db.from("admin_access").select("role,active").eq("email",email).maybeSingle();
  return access?.active === true && ["owner","admin","editor"].includes(access.role);
}
function safeUrl(value) {
  if (!value) return null;
  try { const u = new URL(value, "https://gaspardnz.style"); return u.protocol === "https:" && (u.hostname === "gaspardnz.style" || u.hostname.endsWith(".gaspardnz.style")) ? u.href : null; }
  catch { return null; }
}
export default async function handler(req,res) {
  if (!["GET","POST"].includes(req.method)) return res.status(405).json({error:"Méthode non autorisée"});
  let db;
  try { db=client(); } catch { return res.status(503).json({error:"Service non configuré"}); }
  if (!(await authorize(req,db))) return res.status(403).json({error:"Accès administrateur refusé"});
  if (req.method==="GET") {
    const {data,error}=await db.from("notification_campaigns").select("id,category,title,body,image_url,target_url,audience,status,scheduled_at,sent_at,created_at").order("created_at",{ascending:false}).limit(100);
    return error ? res.status(503).json({error:"Table notifications indisponible"}) : res.json({campaigns:data});
  }
  const b=req.body || {};
  const category=String(b.category||"");
  const title=String(b.title||"").trim(), body=String(b.body||"").trim();
  if (!categories.has(category) || !title || title.length>120 || !body || body.length>500) return res.status(400).json({error:"Catégorie, titre ou message invalide"});
  if (b.audience && b.audience!=="opted_in") return res.status(400).json({error:"Envois individuels non disponibles dans ce module"});
  const target_url=safeUrl(b.target_url);
  if (b.target_url && !target_url) return res.status(400).json({error:"Lien hors du site GaspardNZ interdit"});
  const image_url=safeUrl(b.image_url);
  if (b.image_url && !image_url) return res.status(400).json({error:"Image hors du site GaspardNZ interdite"});
  const status=String(b.status||"draft");
  if (!statuses.has(status)) return res.status(400).json({error:"Statut invalide"});
  const scheduled_at=status==="scheduled" ? new Date(b.scheduled_at||"") : null;
  if (status==="scheduled" && (!Number.isFinite(scheduled_at?.getTime()) || scheduled_at.getTime()<Date.now()+60000)) return res.status(400).json({error:"Choisissez une date future"});
  const {data,error}=await db.from("notification_campaigns").insert({category,title,body,image_url,target_url,audience:"opted_in",status,scheduled_at:scheduled_at?.toISOString()||null}).select("id,status").single();
  if(error) return res.status(503).json({error:"Impossible d'enregistrer la campagne"});
  return res.status(201).json({campaign:data});
}
