// Every KPI and its drill-down use these same rows and half-open period.
export const TEST_LEAD_IDS = new Set(['491d4ef9-033b-4b1b-a499-63e94b961b37','cc3353de-93fb-4b99-bc80-3e5cb5952333','ff97e39a-6d62-46dd-a2c1-dfc1c5a569eb','0ff52205-b8d4-428f-bd79-800b1136d7b1','a90d4abb-4e63-4919-94ea-05da1498164f']);
export const isCommercialLead = row => !TEST_LEAD_IDS.has(row.id) && row.metadata?.is_test !== true;
const unique = (rows, key) => [...new Map(rows.filter(row => key(row)).map(row => [key(row), row])).values()];
const person = row => row.phone?.replace(/[^+0-9]/g,'') || row.email?.trim().toLowerCase() || row.id;
export function commercialMetrics(raw, period) {
 const inside = row => row.created_at >= period.from && row.created_at < period.to;
 const allLeads = raw.leads.filter(isCommercialLead);
 const leadById = new Map(allLeads.map(row => [row.id,row]));
 const excluded = new Set(raw.leads.filter(row => !isCommercialLead(row)).map(row => row.id));
 const enrich = row => ({ ...leadById.get(row.lead_id), ...row, full_name: row.full_name || leadById.get(row.lead_id)?.full_name, phone: row.phone || leadById.get(row.lead_id)?.phone, request_type: row.request_type || leadById.get(row.lead_id)?.request_type });
 const events = raw.events.filter(inside);
 const leads = unique(allLeads.filter(inside), person);
 const visitors = unique(events, row => row.visitor_id);
 const visitorIds = new Set(visitors.map(row => row.visitor_id));
 const intents = raw.intents.filter(inside).filter(row => !excluded.has(row.lead_id)).map(enrich);
 const customers = unique(raw.customers.filter(inside).filter(row => !excluded.has(row.lead_id)).map(enrich), person);
 const cohortCustomers = unique(allLeads.filter(inside).filter(lead => raw.customers.some(row => row.lead_id === lead.id && row.created_at < period.to)), person);
 const siteConverted = unique(allLeads.filter(inside).filter(row => visitorIds.has(row.visitor_id)), row => row.visitor_id);
 const legacy = events.filter(row => ['whatsapp_click','booking_click','booking_open','phone_click','tel_click'].includes(row.event_name));
 const details = {
  visitors, sessions: raw.sessions.filter(row => inside({created_at:row.started_at})).map(row=>({...row,created_at:row.started_at})),
  leads, customers, revenue: customers,
  confirmed_bookings: raw.bookings.filter(inside).filter(row => row.status === 'confirmed' && !excluded.has(row.lead_id)).map(enrich),
  whatsapp_clicks: [...events.filter(row => row.event_name==='whatsapp_click'), ...intents.filter(row => row.channel==='whatsapp')],
  promo_clicks: events.filter(row=>row.event_name==='promo_click'),
  intentions: [...legacy, ...intents], site_conversion_rate: siteConverted, sales_conversion_rate: cohortCustomers,
  packages_viewed: unique(events.filter(row=>['packages_view','formules_view'].includes(row.event_name)),row=>row.visitor_id),
  booking_clicks: [...events.filter(row=>['booking_click','booking_open'].includes(row.event_name)), ...intents.filter(row=>row.channel==='calendly')],
  form_starts: unique(events.filter(row=>['lead_form_start','booking_form_start'].includes(row.event_name)),row=>row.visitor_id),
 };
 const current = Object.fromEntries(Object.entries(details).map(([key,rows])=>[key,rows.length]));
 current.revenue = customers.reduce((sum,row)=>sum+Number(row.lifetime_value||0),0);
 current.site_conversion_rate = visitors.length ? 100*siteConverted.length/visitors.length : null;
 current.sales_conversion_rate = leads.length ? 100*cohortCustomers.length/leads.length : null;
 const sources = [...new Set([...events,...leads,...customers].map(row=>row.source||'Direct'))];
 const acquisition = sources.map(source=>({source,visitors:unique(events.filter(row=>(row.source||'Direct')===source),row=>row.visitor_id).length,leads:leads.filter(row=>(row.source||'Direct')===source).length,customers:customers.filter(row=>(row.source||'Direct')===source).length,revenue:customers.filter(row=>(row.source||'Direct')===source).reduce((n,r)=>n+Number(r.lifetime_value||0),0)}));
 return {current,details,acquisition,funnel:{...current,bookings:current.confirmed_bookings},recentLeads:allLeads.filter(inside).sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,8)};
}
