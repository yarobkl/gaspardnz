const LEADS_KEY = "gnz_admin_leads";

const getLeads = () => {
  try {
    const leads = localStorage.getItem(LEADS_KEY);
    return leads ? JSON.parse(leads) : [];
  } catch {
    return [];
  }
};

const saveLeads = (leads) => {
  try {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  } catch {}
};

export const createLead = (data) => {
  const {
    name = "",
    email = "",
    phone = "",
    eventType = "",
    eventDate = "",
    guestCount = "",
    budget = "",
    notes = "",
    source = "direct",
    country = "",
    city = "",
  } = data;

  if (!name || !email) {
    return { success: false, error: "Nom et email sont requis" };
  }

  const lead = {
    id: "lead_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
    name,
    email,
    phone,
    eventType,
    eventDate,
    guestCount,
    budget,
    notes,
    source,
    country,
    city,
    status: "nouveau",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    interactions: [],
  };

  const leads = getLeads();
  leads.push(lead);
  saveLeads(leads);

  return { success: true, lead };
};

export const updateLead = (leadId, updates) => {
  const leads = getLeads();
  const leadIndex = leads.findIndex((l) => l.id === leadId);

  if (leadIndex === -1) {
    return { success: false, error: "Lead non trouvé" };
  }

  const lead = leads[leadIndex];
  Object.assign(lead, updates, { updatedAt: new Date().toISOString() });
  leads[leadIndex] = lead;
  saveLeads(leads);

  return { success: true, lead };
};

export const deleteLead = (leadId) => {
  let leads = getLeads();
  const leadCount = leads.length;
  leads = leads.filter((l) => l.id !== leadId);

  if (leads.length === leadCount) {
    return { success: false, error: "Lead non trouvé" };
  }

  saveLeads(leads);
  return { success: true };
};

export const getAllLeads = () => {
  return getLeads();
};

export const getLead = (leadId) => {
  const leads = getLeads();
  return leads.find((l) => l.id === leadId) || null;
};

export const addInteraction = (leadId, type, message) => {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    return { success: false, error: "Lead non trouvé" };
  }

  const interaction = {
    id: "int_" + Date.now(),
    type,
    message,
    timestamp: new Date().toISOString(),
  };

  if (!lead.interactions) {
    lead.interactions = [];
  }
  lead.interactions.push(interaction);
  lead.updatedAt = new Date().toISOString();

  const leadIndex = leads.findIndex((l) => l.id === leadId);
  leads[leadIndex] = lead;
  saveLeads(leads);

  return { success: true, interaction };
};

export const getLeadStats = () => {
  const leads = getLeads();
  const statuses = {};
  const sources = {};
  const countries = {};

  leads.forEach((lead) => {
    statuses[lead.status] = (statuses[lead.status] || 0) + 1;
    sources[lead.source] = (sources[lead.source] || 0) + 1;
    if (lead.country) countries[lead.country] = (countries[lead.country] || 0) + 1;
  });

  return {
    total: leads.length,
    byStatus: statuses,
    bySources: sources,
    byCountries: countries,
    recentLeads: leads
      .slice()
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 10),
  };
};

export const exportLeadsCSV = () => {
  const leads = getLeads();
  let csv = "Nom,Email,Téléphone,Pays,Ville,Type Événement,Date Événement,Nombre Invités,Budget,Statut,Créé,Mis à jour,Source\n";

  leads.forEach((lead) => {
    const row = [
      `"${lead.name}"`,
      `"${lead.email}"`,
      `"${lead.phone}"`,
      `"${lead.country || ""}"`,
      `"${lead.city || ""}"`,
      `"${lead.eventType}"`,
      `"${lead.eventDate}"`,
      `"${lead.guestCount}"`,
      `"${lead.budget}"`,
      `"${lead.status}"`,
      `"${new Date(lead.createdAt).toLocaleDateString("fr-FR")}"`,
      `"${lead.updatedAt ? new Date(lead.updatedAt).toLocaleString("fr-FR") : ""}"`,
      `"${lead.source}"`,
    ];
    csv += row.join(",") + "\n";
  });

  return csv;
};
