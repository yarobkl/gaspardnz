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
            'X-CSRF-Token': csrfToken, // ✅ CSRF Protection
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

export const sendPartnerContactEmail = async (partnerId, partnerEmail, clientData, partnerStatus = null) => {
  try {
    // Pour les partenaires avec status 'coming_soon' (comme Palais Groupe),
    // envoyer à Gaspard + CC à l'utilisateur
    // Pour les autres partenaires, envoyer au partenaire + CC à l'utilisateur
    const isComingSoon = partnerStatus === 'coming_soon';
    const gaspardEmail = 'gaspardnz.contact@gmail.com';
    const userEmail = 'eliebakala@gmail.com';

    const emailData = {
      to: isComingSoon ? [gaspardEmail] : [partnerEmail],
      cc: [userEmail],
      subject: `Nouvelle demande de contact - ${clientData.name}`,
      partnerId,
      clientName: clientData.name,
      clientEmail: clientData.email,
      clientPhone: clientData.phone,
      eventType: clientData.eventType,
      eventDate: clientData.eventDate,
      message: clientData.message,
      timestamp: new Date().toISOString(),
      isComingSoon,
      partnerEmail: isComingSoon ? `(à contacter par Gaspard: ${partnerEmail})` : null,
    };

    // Envoyer email via API existante
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        const csrfToken = getCSRFToken();
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken, // ✅ CSRF Protection
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
