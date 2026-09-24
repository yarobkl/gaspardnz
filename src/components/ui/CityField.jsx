import { useState } from "react";
import { GOLD, CREAM } from "../../constants.js";
import { FRENCH_CITIES } from "../../data/frenchCities.js";

// Champ « Ville » : un vrai menu déroulant listant les communes
// d'Île-de-France (source : geo.api.gouv.fr), triées alphabétiquement, avec
// le département entre parenthèses pour distinguer les homonymes. Gaspard
// travaille surtout avec des prestataires d'Île-de-France, mais « Autre
// ville » laisse une saisie libre pour les autres candidatures.
const OTHER = "__other__";
const selectStyle = { width: "100%", padding: "0.8rem", paddingRight: "2.2rem", background: "rgba(245,240,232,0.05)", border: `1px solid ${GOLD}`, color: CREAM, fontFamily: "'Montserrat', sans-serif", borderRadius: "4px", boxSizing: "border-box", appearance: "none" };

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
      <div style={{ position: "relative" }}>
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
        {/* `appearance:none` retire la flèche native du <select> : sans
            repli visuel, rien ne signale que c'est un menu déroulant plutôt
            qu'un champ de texte — plus trompeur encore une fois « Autre
            ville » sélectionné, où le select garde ce texte affiché. */}
        <span aria-hidden="true" style={{ position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)", color: GOLD, pointerEvents: "none", fontSize: "0.7rem" }}>▾</span>
      </div>
      {showOther && (
        <div>
          <label htmlFor={`${id}-other`} style={{ ...labelStyle, display: "block", marginTop: "0.6rem" }}>{"Nom de votre ville"}{required ? " *" : ""}</label>
          <input
            id={`${id}-other`}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={120}
            required={required}
            autoFocus
            placeholder="Nom de votre ville"
            style={{ ...(inputStyle || {}), marginTop: "0.3rem" }}
          />
        </div>
      )}
    </div>
  );
};

export default CityField;
