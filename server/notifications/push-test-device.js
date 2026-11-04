import { createHash } from "node:crypto";
import { notificationAdminDb } from "../apns.js";
const hash=s=>createHash("sha256").update(s).digest("hex");
export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST")return res.status(405).json({error:"Méthode non autorisée"});
  const {code,deviceToken}=req.body||{};
  if(typeof code!=="string"||!/^[a-f0-9]{48}$/.test(code)||typeof deviceToken!=="string"||!/^[a-f0-9]{64}$/i.test(deviceToken))return res.status(400).json({error:"Données invalides"});
  let db;try{db=notificationAdminDb();}catch{return res.status(503).json({error:"Service indisponible"});}
  const {data:pair,error:lookupError}=await db.from("notification_test_pairings").select("code_hash,expires_at,used_at").eq("code_hash",hash(code)).maybeSingle();
  if(lookupError)return res.status(503).json({error:"Service indisponible"});
  if(!pair||pair.used_at||new Date(pair.expires_at).getTime()<Date.now())return res.status(403).json({error:"Code expiré ou utilisé"});
  const {data:claimed,error:claimError}=await db.from("notification_test_pairings").update({used_at:new Date().toISOString()}).eq("code_hash",hash(code)).is("used_at",null).gt("expires_at",new Date().toISOString()).select("code_hash").maybeSingle();
  if(claimError||!claimed)return res.status(409).json({error:"Code déjà utilisé"});
  const {error}=await db.from("notification_test_devices").upsert({id:"owner-iphone",device_token:deviceToken,updated_at:new Date().toISOString()},{onConflict:"id"});
  if(error)return res.status(503).json({error:"Enregistrement impossible"});
  return res.json({success:true});
}
