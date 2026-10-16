// @vitest-environment node
import { beforeEach,it,expect,vi } from 'vitest';
const rpc=vi.hoisted(()=>vi.fn());
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({rpc})}));
import handler from '../../api/contact-intent.js';
const body={name:'Test',phone:'0612345678',country:'FR',project:'Mariage',description:'',requestId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',channel:'whatsapp'};
const res=()=>({status:vi.fn().mockReturnThis(),setHeader:vi.fn().mockReturnThis(),json:vi.fn().mockReturnThis()});
beforeEach(()=>{process.env.SUPABASE_SERVICE_ROLE_KEY='test-only';rpc.mockReset();rpc.mockResolvedValue({data:true,error:null});});
it('rejects forbidden origins before touching the DB',async()=>{const r=res();await handler({method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body},r);expect(r.status).toHaveBeenCalledWith(403);expect(rpc).not.toHaveBeenCalled();});
it('validates phone and request id before touching the DB',async()=>{const r=res();await handler({method:'POST',headers:{'content-type':'application/json'},body:{...body,phone:'12'}},r);expect(r.status).toHaveBeenCalledWith(400);expect(rpc).not.toHaveBeenCalled();});
it('returns success only after the atomic write, without disclosing lead ids',async()=>{const r=res();await handler({method:'POST',headers:{'content-type':'application/json'},body},r);expect(rpc).toHaveBeenLastCalledWith('save_contact_intent',expect.objectContaining({p_phone:'+33612345678',p_id:body.requestId}));expect(r.json).toHaveBeenCalledWith({ok:true});});
it('blocks redirect on DB error and respects rate limit failures',async()=>{rpc.mockResolvedValueOnce({data:true}).mockResolvedValueOnce({error:new Error('db')});const r=res();await handler({method:'POST',headers:{'content-type':'application/json'},body},r);expect(r.status).toHaveBeenCalledWith(503);rpc.mockResolvedValue({data:false});const r2=res();await handler({method:'POST',headers:{'content-type':'application/json'},body},r2);expect(r2.status).toHaveBeenCalledWith(429);});
