import { describe,it,expect } from 'vitest';
import { commercialMetrics, TEST_LEAD_IDS } from '../../src/services/commercialMetrics.js';
import { normalizeContact } from '../../shared/contact.js';
const period={from:'2026-10-01T00:00:00Z',to:'2026-11-01T00:00:00Z'};
const date='2026-10-10T12:00:00Z';
const empty=()=>({leads:[],customers:[],events:[],sessions:[],bookings:[],intents:[]});
it('normalizes French and Congo phones and allows an empty description',()=>{
 expect(normalizeContact({name:'A',project:'Mariage',phone:'0612345678',country:'FR'}).phone).toBe('+33612345678');
 expect(normalizeContact({name:'A',project:'Mariage',phone:'+242061234567',country:'CG'}).phone).toBe('+242061234567');
 expect(()=>normalizeContact({name:'A',project:'Mariage',phone:'123'})).toThrow();
});
it('excludes exact test IDs without deleting or matching names; deduplicates identified people',()=>{
 const raw=empty();raw.leads=[{id:[...TEST_LEAD_IDS][0],created_at:date},{id:'real',phone:'+33612345678',created_at:date},{id:'duplicate',phone:'+33612345678',created_at:date}];
 const result=commercialMetrics(raw,period);expect(result.current.leads).toBe(1);expect(raw.leads).toHaveLength(3);
});
it('keeps anonymous clicks anonymous and bookings separate; half-open boundaries',()=>{
 const raw=empty();raw.events=[{id:1,event_name:'whatsapp_click',created_at:date},{id:2,event_name:'whatsapp_click',created_at:period.to}];raw.bookings=[{id:'b',status:'requested',created_at:date}];
 const result=commercialMetrics(raw,period);expect(result.current.intentions).toBe(1);expect(result.current.leads).toBe(0);expect(result.current.confirmed_bookings).toBe(0);expect(result.details.whatsapp_clicks[0].full_name).toBeUndefined();
});
it('uses linked cohorts instead of dividing unrelated customer and lead totals',()=>{
 const raw=empty();raw.events=[{id:1,visitor_id:'v',created_at:date}];raw.leads=[{id:'l',visitor_id:'unknown',created_at:date},{id:'old',created_at:'2026-09-01T00:00:00Z'}];raw.customers=[{id:'c',lead_id:'old',created_at:date}];
 const r=commercialMetrics(raw,period);expect(r.current.sales_conversion_rate).toBe(0);expect(r.current.site_conversion_rate).toBe(0);expect(r.current.customers).toBe(1);
 expect(commercialMetrics(empty(),period).current.sales_conversion_rate).toBeNull();
});
