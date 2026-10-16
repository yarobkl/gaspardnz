import { createClient } from '@supabase/supabase-js';
import { createHmac, createHash } from 'node:crypto';
import { normalizeContact } from '../shared/contact.js';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const reply = (res, status, body) => res.status(status).setHeader('Cache-Control', 'no-store').json(body);
export default async function handler(req, res) {
  if (req.method !== 'POST') return reply(res, 405, { error: 'Méthode non autorisée' });
  const origin = req.headers.origin;
  const allowed = ['https://gaspardnz.style', 'https://www.gaspardnz.style', process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`];
  if (origin && !allowed.includes(origin)) return reply(res, 403, { error: 'Origine non autorisée' });
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) return reply(res, 415, { error: 'JSON requis' });
  let contact;
  const body = req.body;
  try {
    if (JSON.stringify(body).length > 8000 || !uuid.test(body?.requestId) || !['whatsapp', 'calendly'].includes(body?.channel)) throw new Error();
    contact = normalizeContact(body);
  } catch { return reply(res, 400, { error: 'Vérifiez votre nom, votre prestation et votre téléphone.' }); }
  try {
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) return reply(res, 503, { error: 'Enregistrement momentanément indisponible.' });
    const db = createClient(process.env.SUPABASE_URL || 'https://imvjudhhtcdmtyhfhksm.supabase.co', secret, { auth: { persistSession: false, autoRefreshToken: false } });
    const ip = String(req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    const { data: allowedRate, error: rateError } = await db.rpc('consume_public_rate_limit', { p_key_hash: createHmac('sha256', secret).update(ip).digest('hex'), p_action: 'contact_intent', p_limit: 12, p_window_seconds: 900 });
    if (rateError) throw rateError;
    if (!allowedRate) return reply(res, 429, { error: 'Trop de demandes. Réessayez dans quelques minutes.' });
    const fingerprint = createHash('sha256').update(JSON.stringify(contact)).digest('hex');
    const { error } = await db.rpc('save_contact_intent', {
      p_id: body.requestId, p_fingerprint: fingerprint, p_name: contact.name, p_phone: contact.phone,
      p_project: contact.project, p_description: contact.description, p_channel: body.channel,
      p_visitor: uuid.test(body.visitorId || '') ? body.visitorId : null,
    });
    if (error) throw error;
    // No lead identifier or other person's data is disclosed to public clients.
    return reply(res, 200, { ok: true });
  } catch { return reply(res, 503, { error: 'Votre demande n’a pas pu être enregistrée. Réessayez avant de continuer.' }); }
}
