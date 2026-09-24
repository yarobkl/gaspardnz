import { useEffect, useRef, useState } from "react";
import { GOLD, CREAM } from "../../constants.js";

// Champ « Ville » avec menu déroulant de toutes les communes de France.
// La liste vient de l'API officielle geo.api.gouv.fr (gratuite, sans clé),
// les plus grandes villes en premier. Si l'API ne répond pas, la saisie
// libre reste possible : le formulaire n'est jamais bloqué.
const API = "https://geo.api.gouv.fr/communes";

export const formatCity = (commune) => `${commune.nom} (${commune.departement?.code || commune.codeDepartement || ""})`.replace(" ()", "");

export async function searchCities(query, signal) {
  const params = new URLSearchParams({ nom: query, fields: "nom,departement", boost: "population", limit: "8" });
  const response = await fetch(`${API}?${params}`, { signal });
  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

const CityField = ({ id, label, value, onChange, required = false, placeholder, labelStyle, inputStyle }) => {
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (skipNextSearch.current) { skipNextSearch.current = false; return undefined; }
    const query = value.trim();
    if (query.length < 2) { setOptions([]); setOpen(false); return undefined; }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchCities(query, controller.signal)
        .then((rows) => { setOptions(rows); setOpen(rows.length > 0); setActive(-1); })
        .catch(() => {});
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [value]);

  const choose = (commune) => {
    skipNextSearch.current = true;
    onChange(formatCity(commune));
    setOpen(false);
    setOptions([]);
  };

  const handleKeyDown = (e) => {
    if (!open || !options.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => (i + 1) % options.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => (i <= 0 ? options.length - 1 : i - 1)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); choose(options[active]); }
    else if (e.key === "Escape") { e.stopPropagation(); setOpen(false); }
  };

  const listId = `${id}-options`;
  return (
    <div style={{ position: "relative" }}>
      <label htmlFor={id} style={labelStyle}>{label}{required ? " *" : ""}</label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        value={value}
        maxLength={120}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={inputStyle}
      />
      {open && (
        <ul id={listId} role="listbox"
          style={{ position: "absolute", zIndex: 5, left: 0, right: 0, top: "100%", margin: "4px 0 0", padding: 0, listStyle: "none", background: "#140d06", border: `1px solid ${GOLD}`, borderRadius: "4px", maxHeight: "240px", overflowY: "auto", boxShadow: "0 12px 30px rgba(0,0,0,.5)" }}>
          {options.map((commune, index) => (
            <li
              key={`${commune.code || commune.nom}-${index}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(e) => { e.preventDefault(); choose(commune); }}
              style={{ padding: "0.75rem 0.8rem", cursor: "pointer", color: CREAM, fontFamily: "'Montserrat', sans-serif", fontSize: "14px", background: index === active ? "rgba(184,151,62,0.18)" : "transparent", borderBottom: index < options.length - 1 ? `1px solid ${GOLD}22` : "none" }}>
              {commune.nom}
              <span style={{ color: "rgba(245,240,232,0.55)", fontSize: "12px" }}>{" "}· {commune.departement?.nom || ""} ({commune.departement?.code || ""})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CityField;
