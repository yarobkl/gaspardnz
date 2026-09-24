import { GOLD, CREAM } from "../../constants.js";
import { FRENCH_CITIES } from "../../data/frenchCities.js";

// Champ « Ville » : un vrai menu déroulant listant uniquement les communes
// d'Île-de-France (source : geo.api.gouv.fr), triées alphabétiquement, avec
// le département entre parenthèses pour distinguer les homonymes. Gaspard
// ne travaille pour l'instant qu'avec des prestataires d'Île-de-France : la
// liste est volontairement fermée, sans saisie libre.
const selectStyle = { width: "100%", padding: "0.8rem", background: "rgba(245,240,232,0.05)", border: `1px solid ${GOLD}`, color: CREAM, fontFamily: "'Montserrat', sans-serif", borderRadius: "4px", boxSizing: "border-box", appearance: "none" };

const CityField = ({ id, label, value, onChange, required = false, placeholder, labelStyle, inputStyle }) => (
  <div>
    <label htmlFor={id} style={labelStyle}>{label}{required ? " *" : ""}</label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      style={{ ...selectStyle, ...(inputStyle || {}) }}>
      <option value="" disabled>{placeholder || "Choisissez une ville…"}</option>
      {FRENCH_CITIES.map(([nom, dep]) => (
        <option key={`${nom}-${dep}`} value={`${nom} (${dep})`}>{nom} ({dep})</option>
      ))}
    </select>
  </div>
);

export default CityField;
