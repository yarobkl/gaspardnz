// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const spy = vi.hoisted(() => ({ role:"owner", valid:true, err:null, verified:0 }));
vi.mock("nodemailer", () => ({
  default:{ createTransport: () => ({ async verify(){ spy.verified += 1; if(spy.err) throw spy.err; }, close(){} }) },
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth:{ getUser:async()=>spy.valid?{ data:{user:{email:"owner@example.com"}}, error:null }:{ data:{user:null},error:{message:"bad"} } },
    from:()=>({ select(){return this;}, eq(){return this;}, async maybeSingle(){return {data:spy.role?{role:spy.role}:null,error:null};} }),
  }),
}));
const { default:handler, classifySmtpError } = await import("../../api/admin-email-health.js");
const respond = () => ({statusCode:0,body:null,setHeader(){return this;},status(c){this.statusCode=c;return this;},json(b){this.body=b;return this;}});
const request = (authorization="Bearer token") => ({method:"GET",headers:{authorization}});
const keys=["EMAIL_FROM","EMAIL_PASSWORD","SMTP_HOST","SMTP_PORT","SUPABASE_SERVICE_ROLE_KEY"];
const original=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
beforeEach(()=>{
  spy.role="owner";spy.valid=true;spy.err=null;spy.verified=0;
  Object.assign(process.env,{EMAIL_FROM:"mock@example.com",EMAIL_PASSWORD:"fake",SMTP_HOST:"smtp.example.com",SMTP_PORT:"465",SUPABASE_SERVICE_ROLE_KEY:"mock-key"});
});
afterEach(()=>{ for(const key of keys){if(original[key]===undefined)delete process.env[key];else process.env[key]=original[key];} });
describe("authorized, read-only SMTP preflight",()=>{
  it("refuses anonymous",async()=>{const r=respond();await handler(request(""),r);expect(r.statusCode).toBe(401);expect(spy.verified).toBe(0);});
  it("refuses a viewer",async()=>{spy.role="viewer";const r=respond();await handler(request(),r);expect(r.statusCode).toBe(403);expect(spy.verified).toBe(0);});
  it("refuses expired identity",async()=>{spy.valid=false;const r=respond();await handler(request(),r);expect(r.statusCode).toBe(401);});
  it("shows only missing config key names",async()=>{delete process.env.EMAIL_PASSWORD;const r=respond();await handler(request(),r);expect(r.body).toEqual({smtpStatus:"missing_configuration",missing:["EMAIL_PASSWORD"],emailSent:false});expect(spy.verified).toBe(0);});
  it("verifies server connection without sending",async()=>{const r=respond();await handler(request(),r);expect(r.body).toEqual({smtpStatus:"ready",emailSent:false});expect(spy.verified).toBe(1);});
  it("redacts remote SMTP error",async()=>{spy.err=Object.assign(new Error("sensitive response"),{code:"EAUTH",responseCode:535});const r=respond();await handler(request(),r);expect(r.body).toEqual({smtpStatus:"authentication_rejected",emailSent:false});expect(JSON.stringify(r.body)).not.toContain("sensitive");});
  it("categorizes network and TLS errors",()=>{expect(classifySmtpError({code:"ETIMEDOUT"})).toBe("network_error");expect(classifySmtpError({code:"CERT_HAS_EXPIRED"})).toBe("tls_error");});
});
