import { trackEvent } from "./adminAnalytics.js";
import { getCSRFToken } from "./adminAuth.js";

export const trackPartnerContact = async (partnerId, clientData) => {
  try {
    // Envoyer event Google Analytics
    trackEvent('partner_contact', {
      partner_id: partnerId,
      client_email: clientData.email,
      event_type: clientData.eventType,
    });

    // Enregistrer dans le CRM admin
    const partnerContactData = {
      partnerId,
      clientName: clientData.name,
      clientEmail: clientData.email,
      clientPhone: clientData.phone,
      eventType: clientData.eventType,
      eventDate: clientData.eventDate,
      message: clientData.message,
      timestamp: new Date().toISOString(),
      commissionPercentage: 5,
      clientDiscountPercentage: 5,
      status: 'pending',
    };

    // API call pour enregistrer dans la base de données
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        const csrfToken = getCSRFToken();
        await fetch('/api/partner-contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || '',
          },
          body: JSON.stringify(partnerContactData),
        });
      } catch (e) {
        console.warn('Failed to log to CRM:', e.message);
      }
    }

    return { success: true, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Partner tracking error:', error);
    return { success: false, error: error.message };
  }
};

const cleanLine = (value) =>
  String(value)
    .split('')
    .filter((ch) => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) !== 127)
    .join('')
    .trim();

export const sendPartnerContactEmail = async (partnerId, partnerEmail, clientData, partnerStatus = null) => {
  try {
    // Pour TOUS les prestataires (coming_soon ou non):
    // Email TO: Gaspard (c'est à lui de contacter le prestataire)
    // Email CC: Utilisateur (suivi) et Prestataire
    const gaspardEmail = 'gaspardnz.contact@gmail.com';
    const userEmail = 'eliebakala@gmail.com';

    const emailData = {
      to: [gaspardEmail],
      cc: [userEmail, partnerEmail],
      subject: `Nouvelle demande de contact - ${cleanLine(clientData.name)}`,
      partnerId,
      clientName: cleanLine(clientData.name),
      clientEmail: cleanLine(clientData.email),
      clientPhone: cleanLine(clientData.phone),
      eventType: cleanLine(clientData.eventType),
      eventDate: cleanLine(clientData.eventDate),
      message: String(clientData.message).slice(0, 2000).trim(),
      timestamp: new Date().toISOString(),
      isComingSoon: partnerStatus === 'coming_soon',
    };

    // Envoyer email via API existante
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        const csrfToken = getCSRFToken();
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken || '',
          },
          body: JSON.stringify(emailData),
        });

        if (!response.ok) {
          console.warn('Email sending returned status:', response.status);
        }
      } catch (e) {
        console.warn('Email fetch error:', e.message);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};
