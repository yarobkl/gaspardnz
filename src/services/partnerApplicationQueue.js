// PartnerApplicationModal ne bloque jamais l'affichage de la confirmation
// sur le réseau (le visiteur voit "envoyé" tout de suite). Si les 3
// tentatives de submitPartnerApplication échouent (réseau coupé, Supabase
// indisponible), la candidature était jusqu'ici perdue en silence : le
// professionnel croit avoir postulé, Gaspard ne reçoit jamais rien, et rien
// n'en garde trace nulle part. Ce module garde la candidature en local pour
// la retenter plus tard (prochaine visite, retour du réseau).
const QUEUE_KEY = "gnz_partner_application_queue";
const MAX_QUEUE = 20;

const readQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeQueue = (queue) => {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));
  } catch {}
};

export const enqueuePartnerApplication = (data) => {
  const queue = readQueue();
  queue.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, data, queuedAt: Date.now() });
  writeQueue(queue);
};

export const getQueuedPartnerApplications = () => readQueue();

const removeFromQueue = (id) => {
  writeQueue(readQueue().filter((item) => item.id !== id));
};

// `submitFn` est injecté (plutôt qu'importé ici) pour éviter toute
// dépendance circulaire avec partnerApplication.js, qui importe déjà ce
// module pour mettre en file d'attente les échecs.
export const flushPartnerApplicationQueue = async (submitFn) => {
  for (const item of readQueue()) {
    const result = await submitFn(item.data);
    if (result?.success) removeFromQueue(item.id);
  }
};
