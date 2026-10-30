import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";

export const CONTACT_COUNTRIES = getCountries();

export function contactCountries(lang = "FR") {
  const locale = ({ FR: "fr", EN: "en", ES: "es", ZH: "zh" })[lang] || "fr";
  let names;
  try { names = new Intl.DisplayNames([locale], { type: "region" }); } catch { /* Older Safari: keep ISO codes usable. */ }
  return CONTACT_COUNTRIES.map(code => ({
    code,
    name: names?.of(code) || code,
    callingCode: `+${getCountryCallingCode(code)}`,
    flag: String.fromCodePoint(...[...code].map(c => c.charCodeAt(0) + 127397)),
  })).sort((a, b) => a.name.localeCompare(b.name, locale));
}
