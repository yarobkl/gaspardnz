import { notificationAdminDb, sendApns } from "../apns.js";

export default async function handler(req,res) {
 if(req.method!=="POST") return res.status(405).json({error:"Méthode non autorisée"});
 let db;
 try { db=notificationAdminDb(); } catch { return res.status(503).json({error:"Service non configuré"}); }
 const token=String(req.headers.authorization||"").match(/^Bearer (.+)$/)?.[1];
 if(!token) return res.status(401).json({error:"Authentification requise"});
 const {data}=await db.auth.getUser(token);
 const email=data?.user?.email?.toLowerCase();
 if(!email) return res.status(401).json({error:"Session invalide"});
 const {data:access}=await db.from("admin_access").select("role,active").eq("email",email).maybeSingle();
 if(!access?.active || !["owner","admin"].includes(access.role)) return res.status(403).json({error:"Accès refusé"});
 const {title,body}=req.body||{};
 const {data:device,error:deviceError}=await db.from("push_subscriptions").select("provider_subscription_id").eq("provider","apns").eq("platform","ios").eq("marketing_opt_in",true).is("revoked_at",null).order("updated_at",{ascending:false}).limit(1).maybeSingle();
 if(deviceError)return res.status(503).json({error:"Registre des appareils indisponible"});
 const deviceToken=device?.provider_subscription_id;
 if(!deviceToken)return res.status(409).json({error:"Aucun iPhone n’a accepté les notifications pour le moment."});
 if(typeof deviceToken!=="string" || !/^[a-f0-9]{64,}$/i.test(deviceToken) || typeof title!=="string" || !title.trim() || title.length>120 || typeof body!=="string" || !body.trim() || body.length>500)
   return res.status(400).json({error:"Paramètres de test invalides"});
 try {
   const result=await sendApns({deviceToken,title:title.trim(),body:body.trim()});
   return res.status(result.ok?200:502).json({success:result.ok,apnsStatus:result.status,reason:result.reason});
 } catch(error) {
   console.error("APNs test failed",error?.message);
   return res.status(503).json({error:"Envoi APNs impossible. Vérifier la configuration Apple."});
 }
}
