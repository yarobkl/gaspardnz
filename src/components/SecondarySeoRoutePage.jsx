import { CALENDLY_URL } from "../constants.js";

const ROUTES = {
  "/actualites": {
    eyebrow: "Journal · Style · Événements",
    title: "Actualités GaspardNZ : style, événements et inspirations",
    intro:
      "Les actualités GaspardNZ réunissent les nouveautés de l’univers, les inspirations de style, les événements et les contenus qui permettent de suivre l’évolution de la marque sans perdre de vue l’essentiel : l’allure, le contexte et les détails.",
    blocks: [
      ["Nouveautés de l’univers", "Cette page permet de retrouver les publications et mises à jour liées à GaspardNZ, aux projets en cours et aux temps forts présentés sur le site."],
      ["Inspirations à décrypter", "Une actualité peut aussi servir de référence pour comprendre une silhouette, une association de couleurs, une matière ou un niveau de formalité adapté à un événement."],
      ["Passer de l’idée au rendez-vous", "Si une publication correspond à votre mariage, gala ou événement, le rendez-vous permet de traduire l’inspiration en choix adaptés à votre situation."],
    ],
  },
  "/videos": {
    eyebrow: "Vidéos · Looks · Coulisses",
    title: "Vidéos GaspardNZ : looks, détails et inspirations en mouvement",
    intro:
      "La vidéo permet d’observer une tenue autrement qu’en photo : tombé des matières, proportions, mouvement, accessoires et présence générale. Les contenus GaspardNZ servent de références pour mieux visualiser une allure avant un accompagnement personnalisé.",
    blocks: [
      ["Observer les silhouettes en mouvement", "Une coupe peut paraître différente lorsque l’on marche, s’assoit ou change de posture. Les vidéos aident à regarder la tenue dans des conditions plus proches d’un événement réel."],
      ["Comprendre le rôle des détails", "Chaussures, accessoires, revers, longueurs et contrastes prennent davantage de sens lorsqu’ils sont vus dans l’ensemble d’une silhouette."],
      ["Préparer votre propre projet", "Les vidéos servent d’inspiration. Le rendez-vous permet ensuite de sélectionner ce qui est pertinent pour votre morphologie, votre rôle et le contexte de l’événement."],
    ],
  },
  "/partenaires": {
    eyebrow: "Événement · Réseau · Expérience",
    title: "Partenaires GaspardNZ : construire une expérience événementielle cohérente",
    intro:
      "Un mariage ou un événement réussi réunit souvent plusieurs métiers. L’univers GaspardNZ peut s’inscrire aux côtés d’autres intervenants, avec un objectif simple : préserver une cohérence entre l’image, le déroulé et l’expérience globale.",
    blocks: [
      ["Des métiers complémentaires", "Photographie, beauté, décoration, lieux, animation ou autres prestations événementielles peuvent intervenir autour d’un même projet sans se substituer au travail de stylisme."],
      ["Une cohérence autour du client", "Lorsque plusieurs intervenants participent au même événement, les informations utiles, le niveau de formalité et le calendrier doivent rester cohérents."],
      ["Préparer les bons échanges", "Le premier rendez-vous GaspardNZ aide à identifier les contraintes de votre projet et les points qui doivent être coordonnés avec les autres prestataires."],
    ],
  },
  "/style-du-mois": {
    eyebrow: "Sélection · Détails · Inspiration",
    title: "Style du mois GaspardNZ : une lecture concrète de l’élégance masculine",
    intro:
      "Le Style du Mois met en avant une direction visuelle, une pièce ou une association afin d’expliquer ce qui crée l’équilibre d’une silhouette. L’objectif n’est pas de reproduire un look à l’identique, mais de comprendre pourquoi il fonctionne.",
    blocks: [
      ["Une silhouette à observer", "Couleurs, volumes et niveau de formalité sont analysés ensemble afin de montrer comment une tenue gagne en cohérence."],
      ["Les détails qui changent l’ensemble", "Chaussures, accessoires, textures et finitions peuvent renforcer une silhouette à condition de rester au service de l’ensemble."],
      ["Adapter plutôt que copier", "Une inspiration devient pertinente lorsqu’elle est adaptée à la morphologie, au contexte, à la saison et à la personnalité de celui qui la porte."],
    ],
  },
};

const navLink = {
  color: "rgba(245,240,232,.72)",
  textDecoration: "none",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 11,
  letterSpacing: ".12em",
  textTransform: "uppercase",
};

const button = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 50,
  padding: ".9rem 1.3rem",
  textDecoration: "none",
  fontFamily: "'Montserrat', sans-serif",
  fontSize: 11,
  letterSpacing: ".15em",
  textTransform: "uppercase",
  fontWeight: 600,
};

export default function SecondarySeoRoutePage() {
  const path = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/, "") || "/" : "/";
  const page = ROUTES[path] || ROUTES["/actualites"];

  return (
    <main style={{ minHeight: "100vh", background: "#0a0602", color: "#f5f0e8" }}>
      <header style={{ borderBottom: "1px solid rgba(184,151,62,.2)", padding: "1rem 1.25rem" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ color: "#f5f0e8", textDecoration: "none", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", letterSpacing: ".14em" }}>GASPARDNZ</a>
          <nav aria-label="Navigation principale" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
            <a href="/services" style={navLink}>Services</a>
            <a href="/styliste-mariage-homme-paris" style={navLink}>Mariage</a>
            <a href="/lookbook" style={navLink}>Lookbook</a>
            <a href="/contact" style={navLink}>Contact</a>
          </nav>
        </div>
      </header>

      <section style={{ maxWidth: 1050, margin: "0 auto", padding: "clamp(4rem,9vw,7.5rem) 1.25rem 3.5rem" }}>
        <p style={{ color: "#b8973e", fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: ".26em", textTransform: "uppercase", margin: "0 0 1rem" }}>{page.eyebrow}</p>
        <h1 style={{ maxWidth: 900, fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem,7vw,6rem)", fontWeight: 300, lineHeight: 1, margin: 0 }}>{page.title}</h1>
        <p style={{ maxWidth: 780, color: "rgba(245,240,232,.76)", fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(.95rem,2vw,1.05rem)", lineHeight: 1.9, margin: "2rem 0 0" }}>{page.intro}</p>
      </section>

      <section style={{ maxWidth: 1050, margin: "0 auto", padding: "0 1.25rem 4rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        {page.blocks.map(([title, text], index) => (
          <article key={title} style={{ border: "1px solid rgba(184,151,62,.22)", padding: "1.5rem", background: "rgba(255,255,255,.025)" }}>
            <span style={{ color: "#b8973e", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: ".18em" }}>0{index + 1}</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.65rem", fontWeight: 500, margin: ".65rem 0 .75rem" }}>{title}</h2>
            <p style={{ color: "rgba(245,240,232,.68)", fontFamily: "'Montserrat', sans-serif", fontSize: ".88rem", lineHeight: 1.75, margin: 0 }}>{text}</p>
          </article>
        ))}
      </section>

      <section style={{ background: "#f5f0e8", color: "#1c1208" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "4.5rem 1.25rem", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,6vw,4rem)", fontWeight: 400, margin: 0 }}>Transformez l’inspiration en projet</h2>
          <p style={{ maxWidth: 650, margin: "1rem auto 2rem", fontFamily: "'Montserrat', sans-serif", color: "rgba(28,18,8,.68)", lineHeight: 1.75 }}>Découvrez les services GaspardNZ ou choisissez un créneau pour parler de votre mariage, gala ou événement.</p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
            <a href="/services" style={{ ...button, color: "#1c1208", border: "1px solid rgba(28,18,8,.3)" }}>Voir les services</a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" data-track="booking_start" style={{ ...button, background: "#b8973e", border: "1px solid #b8973e", color: "#1c1208" }}>Prendre rendez-vous</a>
          </div>
        </div>
      </section>

      <footer style={{ maxWidth: 1050, margin: "0 auto", padding: "2.5rem 1.25rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <a href="/services" style={navLink}>Services</a>
        <a href="/styliste-mariage-homme-paris" style={navLink}>Mariage</a>
        <a href="/lookbook" style={navLink}>Lookbook</a>
        <a href="/galerie" style={navLink}>Galerie</a>
        <a href="/contact" style={navLink}>Contact</a>
      </footer>
    </main>
  );
}
