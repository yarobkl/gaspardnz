// @vitest-environment node
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
const st = vi.hoisted(() => ({
  rows: {}, updates: [], getUser: vi.fn(), sendMail: vi.fn(), close: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { getUser: st.getUser },
    from(table) {
      let mode = "select";
      const q = {
        select() { return q; },
        eq() { return q; },
        update(payload) { st.updates.push({ table, payload }); mode = "update"; return q; },
        async maybeSingle() {
          if (mode === "update") return { data: { id: st.rows.email_messages.id }, error: null };
          return { data: st.rows[table] || null, error: null };
        },
      };
      return q;
    },
  }),
}));
vi.mock("nodemailer", () => ({
  default: { createTransport: () => ({ sendMail: st.sendMail, close: st.close }) },
}));
import handler from "../../api/email-retry.js";
const mailId="11111111-1111-4111-8111-111111111111";
const leadId="22222222-2222-4222-8222-222222222222";
const makeReq=()=>({method:"POST",headers:{authorization:"Bearer test-token"},body:{emailId:mailId}});
const makeRes=()=>({code:0,body:null,setHeader(){return this;},status(n){this.code=n;return this;},json(value){this.body=value;return this;}});
const vars=["SUPABASE_SERVICE_ROLE_KEY","EMAIL_FROM","EMAIL_PASSWORD","SMTP_HOST","SMTP_PORT"];
const saved=Object.fromEntries(vars.map(k=>[k,process.env[k]]));
beforeEach(()=>{
  Object.assign(process.env,{SUPABASE_SERVICE_ROLE_KEY:"not-a-real-key",EMAIL_FROM:"test@example.com",EMAIL_PASSWORD:"fake",SMTP_HOST:"smtp.test",SMTP_PORT:"587"});
  st.updates.length=0;
  st.getUser.mockReset().mockResolvedValue({data:{user:{email:"admin@example.com"}},error:null});
  st.sendMail.mockReset().mockResolvedValue({messageId:"smtp-id"});
  st.close.mockReset();
  st.rows={
    admin_access:{role:"admin",active:true},
    email_messages:{id:mailId,status:"failed",template_key:"partner_contact_internal",lead_id:leadId,booking_id:null,metadata:{}},
    leads:{id:leadId,full_name:"Cliente",email:"client@example.com",phone:"+33612345678",request_type:"partner_contact",message:"Demande privée",metadata:{}},
  };
});
afterEach(()=>{for(const k of vars)saved[k]===undefined?delete process.env[k]:(process.env[k]=saved[k]);});
describe("email retry - admin-only, internal-only",()=>{
  it("requires an admin session",async()=>{
    const res=makeRes();await handler({method:"POST",headers:{},body:{emailId:mailId}},res);
    expect(res.code).toBe(401);expect(st.sendMail).not.toHaveBeenCalled();
  });
  it("refuses read-only profiles",async()=>{
    st.rows.admin_access={role:"viewer",active:true};
    const res=makeRes();await handler(makeReq(),res);
    expect(res.code).toBe(403);expect(st.sendMail).not.toHaveBeenCalled();
  });
  it("sends only an internal message for a failed linked lead",async()=>{
    const res=makeRes();await handler(makeReq(),res);
    expect(res.code).toBe(200);
    expect(st.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to:"gaspardnz.contact@gmail.com",cc:"eliebakala@gmail.com",
      subject:expect.stringContaining("relance"),
    }));
    expect(st.updates.map(x=>x.payload.status)).toEqual(["queued","sent"]);
  });
  it("does not resend a customer acknowledgement",async()=>{
    st.rows.email_messages.template_key="partner_contact_client_ack";
    const res=makeRes();await handler(makeReq(),res);
    expect(res.code).toBe(409);expect(st.sendMail).not.toHaveBeenCalled();
  });
  it("refuses historical failures without a recoverable CRM reference",async()=>{
    st.rows.email_messages.lead_id=null;
    const res=makeRes();await handler(makeReq(),res);
    expect(res.code).toBe(422);expect(st.sendMail).not.toHaveBeenCalled();
  });
  it("records SMTP refusal without exposing its raw message",async()=>{
    st.sendMail.mockRejectedValue({responseCode:535,message:"secret-password"});
    const res=makeRes();await handler(makeReq(),res);
    expect(res.code).toBe(503);
    expect(st.updates.at(-1).payload).toMatchObject({status:"failed",error_message:"SMTP 535 : identifiants refusés"});
    expect(JSON.stringify(res.body)).not.toContain("secret-password");
  });
  it("limits repeated retries",async()=>{
    st.rows.email_messages.metadata={retry_count:3};
    const res=makeRes();await handler(makeReq(),res);
    expect(res.code).toBe(429);expect(st.sendMail).not.toHaveBeenCalled();
  });
});
