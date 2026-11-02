import { createClient } from "@supabase/supabase-js";
import { createPrivateKey, createSign } from "node:crypto";

// APNs HTTP/2 requires an Apple Developer key. This module does not contact APNs
// until explicitly configured and called by an authenticated admin endpoint.
// No third-party notification subscription is required.
const b64url = (data) => Buffer.from(data).toString("base64url");
let cachedToken = null;
let cachedAt = 0;
export function apnsJwt() {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const p8 = process.env.APNS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!keyId || !teamId || !p8) throw new Error("APNs non configuré");
  if (cachedToken && Date.now() - cachedAt < 45 * 60 * 1000) return cachedToken;
  const now = Math.floor(Date.now()/1000);
  const header = b64url(JSON.stringify({alg:"ES256",kid:keyId}));
  const payload = b64url(JSON.stringify({iss:teamId,iat:now}));
  const signer=createSign("SHA256");
  signer.update(header+"."+payload);
  signer.end();
  const signature=signer.sign({key:createPrivateKey(p8),dsaEncoding:"ieee-p1363"}).toString("base64url");
  cachedToken=header+"."+payload+"."+signature;
  cachedAt=Date.now();
  return cachedToken;
}
export async function sendApns({deviceToken,title,body,url,apnsId}) {
  if (!/^[a-f0-9]{64,}$/i.test(deviceToken)) throw new Error("Token appareil invalide");
  const topic=process.env.APNS_TOPIC || "com.gaspardnz.app";
  const host=process.env.APNS_ENV === "sandbox" ? "api.sandbox.push.apple.com" : "api.push.apple.com";
  const http2=await import("node:http2");
  const session=http2.connect("https://"+host);
  try {
    const payload=JSON.stringify({aps:{alert:{title,body},sound:"default"},...(url?{url}:{})});
    return await new Promise((resolve,reject)=>{
      const request=session.request({":method":"POST",":path":"/3/device/"+deviceToken,
        authorization:"bearer "+apnsJwt(),"apns-topic":topic,"apns-push-type":"alert","apns-priority":"10",...(apnsId?{"apns-id":apnsId}:{})});
      let responseStatus=0, output="";
      request.on("response",headers=>{responseStatus=Number(headers[":status"]||0);});
      request.on("data",chunk=>{output+=chunk.toString();});
      request.on("end",()=>resolve({ok:responseStatus===200,status:responseStatus,reason:output.slice(0,400)}));
      request.on("error",reject);
      request.end(payload);
    });
  } finally { session.close(); }
}
export function notificationAdminDb(){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY absent");
 return createClient(process.env.SUPABASE_URL||"https://imvjudhhtcdmtyhfhksm.supabase.co",key,{auth:{persistSession:false,autoRefreshToken:false}});
}
