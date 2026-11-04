import { randomBytes, createHash } from "node:crypto";
import { notificationAdminDb } from "./_lib/apns.js";
const hash = s => createHash("sha256").update(s).digest("hex");
export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST") return res.status(405).json({error:"Méthode non autorisée"});
  let db;try{db=notificationAdminDb();}catch{return res.status(503).json({error:"Service indisponible"});}
  const bearer=String(req.headers.authorization||"").match(/^Bearer (.+)$/)?.[1];
  if(!bearer)return res.status(401).json({error:"Connexion requise"});
  const {data}=await db.auth.getUser(bearer);
  const email=data?.user?.email?.toLowerCase();
  const {data:access}=email?await db.from("admin_access").select("role,active").eq("email",email).maybeSingle():{data:null};
  if(!access?.active||!["owner","admin"].includes(access.role))return res.status(403).json({error:"Accès refusé"});
  const code=randomBytes(24).toString("hex");
  const expires=new Date(Date.now()+10*60*1000).toISOString();
  const {error}=await db.from("notification_test_pairings").insert({code_hash:hash(code),expires_at:expires});
  if(error)return res.status(503).json({error:"Table d'appairage indisponible"});
  return res.json({code,expires_at:expires});
}
