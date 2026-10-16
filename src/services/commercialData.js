import { supabase } from './supabaseClient.js';
import { commercialMetrics } from './commercialMetrics.js';
export async function allRows(table, columns, period, date='created_at') {
 const rows=[];
 for(let start=0;;start+=1000) {
  let query=supabase.from(table).select(columns).order(date).order('id').range(start,start+999);
  if(period) query=query.gte(date,period.from).lt(date,period.to);
  const {data,error}=await query;
  if(error) throw error;
  rows.push(...data);
  if(data.length<1000) return rows;
 }
}
export async function getCommercialData(period) {
 const range={from:period.previousFrom || period.from,to:period.to};
 const [leads,customers,events,sessions,bookings,intents]=await Promise.all([
  allRows('leads','id,full_name,email,phone,request_type,source,channel,status,metadata,visitor_id,created_at'),
  allRows('customers','id,lead_id,full_name,email,phone,source,lifetime_value,created_at'),
  allRows('analytics_events','id,visitor_id,event_name,source,created_at',range),
  allRows('sessions','id,visitor_id,source,started_at',range,'started_at'),
  allRows('bookings','id,lead_id,title,status,starts_at,created_at',range),
  allRows('contact_intents','id,lead_id,channel,created_at',range),
 ]);
 const raw={leads,customers,events,sessions,bookings,intents};
 return {...commercialMetrics(raw,period),previous:commercialMetrics(raw,{from:period.previousFrom||period.from,to:period.previousTo||period.to}).current};
}
