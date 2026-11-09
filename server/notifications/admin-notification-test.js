import { notificationAdminDb, sendApns } from "../apns.js";

function safeTargetUrl(value) {
 if (value == null || value === "") return "";
 if (typeof value !== "string" || value.length > 2048) return null;
 try {
   const target = new URL(value.trim());
   return target.protocol === "https:" && !target.username && !target.password ? target.href : null;
 } catch { return null; }
}

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
 const {title,body,target_url}=req.body||{};
 const url=safeTargetUrl(target_url);
 if(target_url && !url)return res.status(400).json({error:"Le lien doit être une adresse HTTPS valide"});
 const {data:paired,error:pairedError}=await db.from("notification_test_devices").select("device_token").eq("id","owner-iphone").maybeSingle();
 if(pairedError)return res.status(503).json({error:"Registre des appareils indisponible"});
 const {data:device,error:deviceError}=paired?.device_token
   ? {data:null,error:null}
   : await db.from("push_subscriptions").select("provider_subscription_id").eq("provider","apns").eq("platform","ios").eq("marketing_opt_in",true).is("revoked_at",null).order("updated_at",{ascending:false}).limit(1).maybeSingle();
 if(deviceError)return res.status(503).json({error:"Registre des appareils indisponible"});
 const deviceToken=paired?.device_token || device?.provider_subscription_id;
 if(!deviceToken)return res.status(409).json({error:"Aucun iPhone n’a accepté les notifications pour le moment."});
 if(typeof deviceToken!=="string" || !/^[a-f0-9]{64,}$/i.test(deviceToken) || typeof title!=="string" || !title.trim() || title.length>120 || typeof body!=="string" || !body.trim() || body.length>500)
   return res.status(400).json({error:"Paramètres de test invalides"});
 try {
   const result=await sendApns({deviceToken,title:title.trim(),body:body.trim(),url:url||undefined});
   return res.status(result.ok?200:502).json({success:result.ok,apnsStatus:result.status,reason:result.reason});
 } catch(error) {
   console.error("APNs test failed",error?.message);
   return res.status(503).json({error:"Envoi APNs impossible. Vérifier la configuration Apple."});
 }
}
