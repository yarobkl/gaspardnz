import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
export const SERVICES = ['Habillage mariage', 'Costume sur mesure', 'Conseil en image', 'Habillage soirée / événement', 'Shooting photo', 'Autre'];
export function normalizeContact(input) {
  const name = String(input?.name || '').trim();
  const project = String(input?.project || '').trim();
  const description = String(input?.description || '').trim();
  const country = String(input?.country || 'FR');
  const phone = parsePhoneNumberFromString(String(input?.phone || ''), country);
  if (!name || name.length > 100 || !project || project.length > 120 || description.length > 1000 || !phone?.isValid()) throw new Error('Indiquez votre nom, votre prestation et un numéro de téléphone valide.');
  return { name, project, description, country, phone: phone.number };
}
