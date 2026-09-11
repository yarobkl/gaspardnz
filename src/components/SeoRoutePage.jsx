import { CALENDLY_URL, WA_NUM } from "../constants.js";

const ROUTES = {
  "/a-propos": {
    eyebrow: "GaspardNZ · Paris",
    title: "L’univers GaspardNZ : style, habillage et élégance masculine",
    intro: "GaspardNZ développe un univers consacré à l’élégance masculine pour les mariages, galas et événements. L’approche associe conseil en image, composition de silhouettes et attention portée aux détails qui donnent de la cohérence à une tenue.",
    blocks: [
      ["Une vision du style", "Le travail commence par le contexte : type d’événement, rôle du client, niveau de formalité, saison et image recherchée. L’objectif n’est pas d’accumuler les pièces, mais de construire une allure lisible et juste."],
      ["Mariages et événements", "Pour un mariage ou un gala, les choix doivent fonctionner ensemble du premier rendez-vous jusqu’au jour J : costume, chemise, accessoires, chaussures et éventuels changements de tenue."],
      ["Un accompagnement personnalisé", "Chaque échange sert à préciser le besoin et le niveau d’accompagnement pertinent, du simple conseil jusqu’à une présence plus complète autour de l’événement."],
    ],
  },
  "/lookbook": {
    eyebrow: "Inspirations · Silhouettes · Détails",
    title: "Lookbook GaspardNZ : inspirations pour mariage, gala et événement",
    intro: "Le lookbook GaspardNZ rassemble des pistes de style pour aider à visualiser une silhouette complète : volumes, associations, couleurs, accessoires et niveau de formalité. Il sert de point de départ avant un échange personnalisé.",
    blocks: [
      ["Silhouettes de mariage", "Des inspirations pensées pour la mairie, la cérémonie et la soirée, avec une attention particulière à la cohérence entre les différentes étapes de la journée."],
      ["Allure de gala", "Des propositions plus formelles pour travailler la présence, le contraste, les matières et les détails sans perdre l’équilibre général de la tenue."],
      ["Du look à votre projet", "Une inspiration devient réellement utile lorsqu’elle est adaptée à votre morphologie, au lieu, à la saison et à votre rôle dans l’événement."],
    ],
  },
  "/contact": {
    eyebrow: "Rendez-vous · Paris",
    title: "Prendre rendez-vous avec GaspardNZ",
    intro: "Vous préparez un mariage, un gala, une cérémonie ou un autre événement important ? Un premier échange permet de préciser la date, le contexte, votre rôle, vos attentes et le niveau d’accompagnement adapté.",
    blocks: [
      ["Avant le rendez-vous", "Préparez si possible la date de l’événement, le type de cérémonie, votre rôle, les tenues déjà disponibles et quelques références de style. Cela permet d’aller rapidement vers des propositions pertinentes."],
      ["Réserver un créneau", "Le calendrier en ligne permet de choisir directement un créneau disponible pour présenter votre projet et déterminer la suite de l’accompagnement."],
      ["Une question rapide ?", "Pour une première question ou pour vérifier qu’une prestation correspond bien à votre besoin, vous pouvez également contacter GaspardNZ via WhatsApp."],
    ],
    contact: true,
  },
  "/galerie": {
    eyebrow: "Looks · Inspirations · Événements",
    title: "Galerie GaspardNZ : looks, détails et inspirations de style",
    intro: "La galerie GaspardNZ permet d’explorer l’univers visuel de la marque et d’identifier des pistes pour un mariage, un gala ou un événement. Les images servent surtout de références : le choix final doit rester adapté à la personne et au contexte.",
    blocks: [
      ["Observer les proportions", "Une silhouette réussie dépend autant des proportions et des coupes que des couleurs. La galerie aide à repérer les équilibres qui fonctionnent visuellement."],
      ["Repérer les détails", "Cravate, nœud, chaussures, boutons, textures et accessoires peuvent renforcer une tenue lorsqu’ils restent cohérents avec l’ensemble."],
      ["Construire votre propre allure", "Les références visuelles sont un point de départ. Le rendez-vous permet ensuite de traduire ces inspirations en choix adaptés à votre événement."],
    ],
  },
};

const waHref = `https://wa.me/${WA_NUM}?text=${encodeURIComponent("Bonjour Gaspard, je souhaite échanger au sujet de mon événement.")}`;

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

export default function SeoRoutePage() {
  const path = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/, "") || "/" : "/";
  const page = ROUTES[path] || ROUTES["/a-propos"];

  return (
    <main style={{ minHeight: "100vh", background: "#0a0602", color: "#f5f0e8" }}>
      <header style={{ borderBottom: "1px solid rgba(184,151,62,.2)", padding: "1rem 1.25rem" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ color: "#f5f0e8", textDecoration: "none", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", letterSpacing: ".14em" }}>GASPARDNZ</a>
          <nav aria-label="Navigation principale" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 18 }}>
            <a href="/services" style={navLink}>Services</a>
            <a href="/lookbook" style={navLink}>Lookbook</a>
            <a href="/galerie" style={navLink}>Galerie</a>
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
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,6vw,4rem)", fontWeight: 400, margin: 0 }}>{page.contact ? "Présentez votre projet" : "Passez de l’inspiration à votre projet"}</h2>
          <p style={{ maxWidth: 650, margin: "1rem auto 2rem", fontFamily: "'Montserrat', sans-serif", color: "rgba(28,18,8,.68)", lineHeight: 1.75 }}>Découvrez les services GaspardNZ ou choisissez directement un créneau pour parler de votre mariage, gala ou événement.</p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
            <a href="/services" style={{ ...button, color: "#1c1208", border: "1px solid rgba(28,18,8,.3)" }}>Voir les services</a>
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" data-track="booking_start" style={{ ...button, background: "#b8973e", border: "1px solid #b8973e", color: "#1c1208" }}>Prendre rendez-vous</a>
            {page.contact && <a href={waHref} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" style={{ ...button, color: "#1c1208", border: "1px solid rgba(28,18,8,.3)" }}>WhatsApp</a>}
          </div>
        </div>
      </section>

      <footer style={{ maxWidth: 1050, margin: "0 auto", padding: "2.5rem 1.25rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <a href="/a-propos" style={navLink}>À propos</a>
        <a href="/services" style={navLink}>Services</a>
        <a href="/lookbook" style={navLink}>Lookbook</a>
        <a href="/galerie" style={navLink}>Galerie</a>
        <a href="/contact" style={navLink}>Contact</a>
      </footer>
    </main>
  );
}
