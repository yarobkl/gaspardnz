import { trackEvent } from "./adminAnalytics.js";

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
      commissionPercentage: 10,
      status: 'pending',
    };

    // API call pour enregistrer dans la base de données
    if (typeof window !== 'undefined' && window.fetch) {
      try {
        await fetch('/api/partner-contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

export const sendPartnerContactEmail = async (partnerId, partnerEmail, clientData) => {
  try {
    const emailData = {
      to: [partnerEmail, 'gaspardnz@gaspardnz.style'],
      subject: `Nouvelle demande de contact - ${clientData.name}`,
      partnerId,
      clientName: clientData.name,
      clientEmail: clientData.email,
      clientPhone: clientData.phone,
      eventType: clientData.eventType,
      eventDate: clientData.eventDate,
      message: clientData.message,
      timestamp: new Date().toISOString(),
    };

    // Envoyer email via API existante
    if (typeof window !== 'undefined' && window.fetch) {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        console.warn('Email sending returned status:', response.status);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};
