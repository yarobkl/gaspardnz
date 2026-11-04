import { notificationAdminDb, sendApns } from "./_lib/apns.js";

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
 let {deviceToken,title,body}=req.body||{};
 if(!deviceToken){const {data:device,error}=await db.from("notification_test_devices").select("device_token").eq("id","owner-iphone").maybeSingle();if(error)return res.status(503).json({error:"Registre des appareils indisponible"});deviceToken=device?.device_token;}
 if(!deviceToken)return res.status(409).json({error:"Aucun iPhone de test associé. Appairez-le depuis l’application."});
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
