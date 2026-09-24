import { CREAM } from "../constants.js";

// Les 5 pages SEO (ImageConsultingSeoPage, MarriageSeoPage, ServicesRoutePage,
// SeoRoutePage, SecondarySeoRoutePage) n'avaient AUCUNE ne renvoyant vers les
// pages légales (mentions légales, confidentialité, CGV) — un vrai manque,
// pas seulement un défaut de cohérence visuelle. Ce layout partagé garantit
// que ce pied de page légal est présent partout, sans dupliquer son contenu
// dans chaque fichier.
const legalLink = { color: "rgba(245,240,232,.6)", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase" };

const SeoLayout = ({ children }) => (
  <main style={{ minHeight: "100vh", background: "#0a0602", color: CREAM }}>
    {children}
    <footer style={{ borderTop: "1px solid rgba(184,151,62,.15)", padding: "2.2rem 1.25rem" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 22 }}>
        <a href="/mentions-legales.html" target="_blank" rel="noopener noreferrer" style={legalLink}>Mentions légales</a>
        <a href="/confidentialite.html" target="_blank" rel="noopener noreferrer" style={legalLink}>Confidentialité</a>
        <a href="/cgv.html" target="_blank" rel="noopener noreferrer" style={legalLink}>CGV</a>
      </div>
    </footer>
  </main>
);

export default SeoLayout;
