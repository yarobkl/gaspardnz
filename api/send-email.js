/**
 * Vercel Function: Send Partner Contact Email
 * Envoie des emails de contact partenaires à Gaspard et à l'utilisateur
 */

import nodemailer from 'nodemailer';

// Valider les variables d'environnement
const requiredEnvVars = ['EMAIL_FROM', 'EMAIL_PASSWORD', 'SMTP_HOST', 'SMTP_PORT'];
const DEFAULT_ALLOWED_RECIPIENTS = [
  'gaspardnz.contact@gmail.com',
  'eliebakala@gmail.com',
];

export const sanitizeText = (value, maxLength = 2000) =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

export const escapeHtml = (value) =>
  sanitizeText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeEmail = (value) => sanitizeText(value, 320).toLowerCase();

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));

const parseCsvEmails = (value) =>
  String(value || '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);

const getAllowedRecipients = () => {
  const configured = parseCsvEmails(process.env.ALLOWED_EMAIL_RECIPIENTS || process.env.EMAIL_TO);
  return new Set(configured.length > 0 ? configured : DEFAULT_ALLOWED_RECIPIENTS);
};

export const resolveRecipients = ({ to = [], cc = [] }) => {
  const allowed = getAllowedRecipients();
  const normalizeList = (list) => Array.isArray(list) ? list.map(normalizeEmail).filter(Boolean) : [];
  const requested = [...normalizeList(to), ...normalizeList(cc)];

  if (requested.length === 0) {
    return { ok: false, error: 'Destinataire manquant' };
  }

  if (requested.some((email) => !isValidEmail(email))) {
    return { ok: false, error: 'Adresse email invalide' };
  }

  const forbidden = requested.filter((email) => !allowed.has(email));
  if (forbidden.length > 0) {
    return { ok: false, error: 'Destinataire non autorisé' };
  }

  return {
    ok: true,
    to: normalizeList(to).filter((email) => allowed.has(email)),
    cc: normalizeList(cc).filter((email) => allowed.has(email)),
  };
};

const getAllowedHosts = () => {
  const configured = String(process.env.ALLOWED_ORIGINS || process.env.SITE_URL || 'https://gaspardnz.style')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const hosts = new Set(['gaspardnz.style', 'www.gaspardnz.style']);
  configured.forEach((origin) => {
    try {
      hosts.add(new URL(origin).host);
    } catch {}
  });
  if (process.env.VERCEL_URL) hosts.add(process.env.VERCEL_URL);
  return hosts;
};

export const isAllowedOrigin = (origin) => {
  if (!origin) return process.env.NODE_ENV !== 'production';
  try {
    return getAllowedHosts().has(new URL(origin).host);
  } catch {
    return false;
  }
};

const rateLimitStore = new Map();
const isRateLimited = (key) => {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 8;
  const bucket = rateLimitStore.get(key) || [];
  const recent = bucket.filter((timestamp) => now - timestamp < windowMs);
  recent.push(now);
  rateLimitStore.set(key, recent);
  return recent.length > maxRequests;
};

const validateEnv = () => {
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.warn('⚠️ Missing env vars:', missing.join(', '));
    return false;
  }
  return true;
};

// Créer le transporteur SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Formater l'email
const formatEmailBody = (data, isComingSoon) => {
  const header = isComingSoon
    ? 'NOUVELLE DEMANDE PALAIS GROUPE (À finaliser avec le groupe)'
    : 'NOUVELLE DEMANDE DE CONTACT';

  return `
${header}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMATIONS CLIENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nom: ${sanitizeText(data.clientName, 140)}
Email: ${sanitizeText(data.clientEmail, 320)}
Téléphone: ${sanitizeText(data.clientPhone, 80)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉTAILS DE L'ÉVÉNEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type d'événement: ${sanitizeText(data.eventType, 140)}
Date prévue: ${sanitizeText(data.eventDate, 80)}

Message du client:
${sanitizeText(data.message, 2000)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${isComingSoon ? 'ACTION REQUISE' : 'SUIVI'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${isComingSoon
  ? `Gaspard doit contacter le groupe Palais et finaliser.
Utilisateur reçoit une copie pour suivi du process.`
  : 'Contacter directement le client pour suite.'
}

Timestamp: ${new Date(data.timestamp).toLocaleString('fr-FR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
};

export default async function handler(req, res) {
  // Seulement POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!isAllowedOrigin(req.headers.origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    if (isRateLimited(clientIp)) {
      return res.status(429).json({ error: 'Trop de demandes, réessayez plus tard' });
    }

    // Valider le CSRF token
    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken) {
      return res.status(403).json({ error: 'CSRF token missing' });
    }

    const { to, cc, subject, clientName, clientEmail, clientPhone, eventType, eventDate, message, timestamp, isComingSoon } = req.body;

    // Valider les données
    const recipients = resolveRecipients({ to, cc });
    if (!recipients.ok) {
      return res.status(400).json({ error: recipients.error });
    }

    if (!isValidEmail(clientEmail) || !sanitizeText(clientName, 140)) {
      return res.status(400).json({ error: 'Données client incomplètes' });
    }

    // Vérifier les variables d'environnement
    if (!validateEnv()) {
      console.warn('⚠️ Email service not configured - storing in log only');
      // En développement, on peut logger et retourner success
      if (process.env.NODE_ENV !== 'production') {
        console.log('Email would be sent to:', to, cc);
        console.log('Subject:', subject);
        return res.status(200).json({ success: true, message: 'Dev mode - email logged' });
      }
      return res.status(503).json({ error: 'Email service not configured' });
    }

    // Créer le transporteur
    const transporter = createTransporter();

    // Formater le corps de l'email
    const emailBody = formatEmailBody({
      clientName,
      clientEmail,
      clientPhone,
      eventType,
      eventDate,
      message,
      timestamp,
    }, isComingSoon);

    // Préparer les options d'email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipients.to.join(', '),
      cc: recipients.cc.length > 0 ? recipients.cc.join(', ') : undefined,
      subject: sanitizeText(subject || 'Nouvelle demande de contact', 160),
      text: emailBody,
      html: emailBody.split('\n').map(escapeHtml).join('<br>'),
      replyTo: normalizeEmail(clientEmail),
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email envoyé:', {
      to: to.join(', '),
      cc: cc?.join(', '),
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Email envoyé avec succès',
      messageId: info.messageId,
    });

  } catch (error) {
    console.error('❌ Email error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi de l\'email',
      message: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
}
