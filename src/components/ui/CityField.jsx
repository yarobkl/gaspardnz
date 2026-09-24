import { useState } from "react";
import { GOLD, CREAM } from "../../constants.js";
import { FRENCH_CITIES } from "../../data/frenchCities.js";

// Champ « Ville » : un vrai menu déroulant listant les 400 plus grandes
// villes de France (source : geo.api.gouv.fr), triées alphabétiquement,
// avec un code postal-département entre parenthèses pour distinguer les
// homonymes. « Autre ville » révèle une saisie libre, pour les villes plus
// petites ou hors de France.
const OTHER = "__other__";
const selectStyle = { width: "100%", padding: "0.8rem", background: "rgba(245,240,232,0.05)", border: `1px solid ${GOLD}`, color: CREAM, fontFamily: "'Montserrat', sans-serif", borderRadius: "4px", boxSizing: "border-box", appearance: "none" };

const CityField = ({ id, label, value, onChange, required = false, placeholder, labelStyle, inputStyle }) => {
  const knownCity = FRENCH_CITIES.some(([nom, dep]) => `${nom} (${dep})` === value);
  const [showOther, setShowOther] = useState(value !== "" && !knownCity);

  const handleSelect = (e) => {
    const next = e.target.value;
    if (next === OTHER) { setShowOther(true); onChange(""); return; }
    setShowOther(false);
    onChange(next);
  };

  return (
    <div>
      <label htmlFor={id} style={labelStyle}>{label}{required ? " *" : ""}</label>
      <select
        id={id}
        value={showOther ? OTHER : value}
        onChange={handleSelect}
        required={required}
        style={{ ...selectStyle, ...(inputStyle || {}) }}>
        <option value="" disabled>{placeholder || "Choisissez une ville…"}</option>
        {FRENCH_CITIES.map(([nom, dep]) => (
          <option key={`${nom}-${dep}`} value={`${nom} (${dep})`}>{nom} ({dep})</option>
        ))}
        <option value={OTHER}>Autre ville…</option>
      </select>
      {showOther && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={120}
          required={required}
          autoFocus
          placeholder="Nom de votre ville"
          style={{ ...(inputStyle || {}), marginTop: "0.6rem" }}
        />
      )}
    </div>
  );
};

export default CityField;
