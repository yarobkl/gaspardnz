/**
 * Vercel Function: Send Partner Contact Email
 * Envoie des emails de contact partenaires à Gaspard et à l'utilisateur
 */

import nodemailer from 'nodemailer';

// Valider les variables d'environnement
const requiredEnvVars = ['EMAIL_FROM', 'EMAIL_PASSWORD', 'SMTP_HOST', 'SMTP_PORT'];

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
    ? '📋 NOUVELLE DEMANDE PALAIS GROUPE (À finaliser avec le groupe)'
    : '📋 NOUVELLE DEMANDE DE CONTACT';

  return `
${header}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INFORMATIONS CLIENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nom: ${data.clientName}
Email: ${data.clientEmail}
Téléphone: ${data.clientPhone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DÉTAILS DE L'ÉVÉNEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type d'événement: ${data.eventType}
Date prévue: ${data.eventDate}

Message du client:
${data.message}

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
    // Valider le CSRF token
    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken) {
      return res.status(403).json({ error: 'CSRF token missing' });
    }

    const { to, cc, subject, clientName, clientEmail, clientPhone, eventType, eventDate, message, timestamp, isComingSoon } = req.body;

    // Valider les données
    if (!to || !Array.isArray(to) || to.length === 0) {
      return res.status(400).json({ error: 'Destinataire manquant' });
    }

    if (!clientEmail || !clientName) {
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
      to: to.join(', '),
      cc: cc && cc.length > 0 ? cc.join(', ') : undefined,
      subject: subject,
      text: emailBody,
      html: emailBody.replace(/\n/g, '<br>'),
      replyTo: clientEmail,
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
