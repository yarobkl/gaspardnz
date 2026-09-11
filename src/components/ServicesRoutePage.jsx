import { CALENDLY_URL, WA_NUM } from "../constants.js";

const SERVICES = [
  ["Styliste mariage homme à Paris", "Construction d’une silhouette cohérente pour la mairie, la cérémonie et la soirée : costume, chemise, accessoires, chaussures et coordination générale."],
  ["Habilleur mariage et événement", "Accompagnement le jour J pour sécuriser la tenue, les détails et les changements de look avant les moments clés de la cérémonie ou du gala."],
  ["Conseil en image masculin", "Sélection de coupes, matières, couleurs et associations adaptées à votre morphologie, votre événement et l’image que vous souhaitez transmettre."],
  ["Maître de cérémonie", "Accompagnement des temps forts de l’événement avec une attention portée au rythme, à la présentation et à l’élégance de l’ensemble."],
];
const waHref = `https://wa.me/${WA_NUM}?text=${encodeURIComponent("Bonjour Gaspard, je souhaite échanger au sujet d’un accompagnement pour mon événement.")}`;
const linkStyle = { color: "rgba(245,240,232,.72)", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" };
const buttonStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: "0.9rem 1.35rem", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none", fontWeight: 600 };

export default function ServicesRoutePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0602", color: "#f5f0e8" }}>
      <header style={{ borderBottom: "1px solid rgba(184,151,62,.2)", padding: "1rem 1.25rem" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ color: "#f5f0e8", textDecoration: "none", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", letterSpacing: ".14em" }}>GASPARDNZ</a>
          <nav aria-label="Navigation principale" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <a href="/lookbook" style={linkStyle}>Lookbook</a><a href="/galerie" style={linkStyle}>Galerie</a><a href="/a-propos" style={linkStyle}>À propos</a><a href="/contact" style={linkStyle}>Contact</a>
          </nav>
        </div>
      </header>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "clamp(4rem,9vw,8rem) 1.25rem 4rem" }}>
        <p style={{ margin: "0 0 1rem", color: "#b8973e", fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase" }}>Paris · Mariages · Galas · Événements</p>
        <h1 style={{ maxWidth: 900, margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem,8vw,6.8rem)", fontWeight: 300, lineHeight: .95 }}>Styliste mariage & habilleur homme à Paris</h1>
        <p style={{ maxWidth: 760, margin: "2rem 0 0", color: "rgba(245,240,232,.75)", fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(.95rem,2vw,1.05rem)", lineHeight: 1.9 }}>GaspardNZ accompagne les hommes qui veulent une allure maîtrisée pour un mariage, un gala ou un événement important. L’objectif : construire une silhouette cohérente, élégante et adaptée au contexte, puis sécuriser les détails jusqu’au jour J.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: "2rem" }}>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" data-track="booking_start" style={{ ...buttonStyle, background: "#b8973e", color: "#1c1208", border: "1px solid #b8973e" }}>Réserver un échange</a>
          <a href={waHref} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" style={{ ...buttonStyle, color: "#f5f0e8", border: "1px solid rgba(245,240,232,.32)" }}>Écrire sur WhatsApp</a>
        </div>
      </section>
      <section aria-labelledby="services-title" style={{ maxWidth: 1120, margin: "0 auto", padding: "1rem 1.25rem 5rem" }}>
        <h2 id="services-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.2rem,6vw,4rem)", letterSpacing: ".04em", marginBottom: "1.5rem" }}>Les services GaspardNZ</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          {SERVICES.map(([title, text], index) => <article key={title} style={{ border: "1px solid rgba(184,151,62,.22)", padding: "1.5rem", background: "rgba(255,255,255,.025)" }}><p style={{ color: "#b8973e", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: ".2em", margin: "0 0 .8rem" }}>0{index + 1}</p><h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.55rem", fontWeight: 500, lineHeight: 1.1, margin: "0 0 .8rem" }}>{title}</h3><p style={{ margin: 0, color: "rgba(245,240,232,.68)", fontFamily: "'Montserrat', sans-serif", fontSize: ".86rem", lineHeight: 1.75 }}>{text}</p></article>)}
        </div>
      </section>
      <section style={{ background: "#f5f0e8", color: "#1c1208" }}><div style={{ maxWidth: 1120, margin: "0 auto", padding: "4.5rem 1.25rem" }}><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,6vw,4.5rem)", fontWeight: 400, margin: "0 0 1.5rem" }}>Un accompagnement pensé autour de votre événement</h2><p style={{ maxWidth: 760, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.8, color: "rgba(28,18,8,.68)" }}>Le premier échange sert à comprendre le contexte, puis à construire et finaliser une silhouette cohérente. Selon la formule choisie, l’accompagnement peut se prolonger jusqu’au jour J.</p><div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 28 }}><a href="/lookbook" style={{ ...linkStyle, color: "#1c1208" }}>Voir le lookbook</a><a href="/galerie" style={{ ...linkStyle, color: "#1c1208" }}>Explorer la galerie</a><a href="/contact" style={{ ...linkStyle, color: "#1c1208" }}>Contacter GaspardNZ</a></div></div></section>
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "5rem 1.25rem", textAlign: "center" }}><h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,6vw,4.4rem)", fontWeight: 300, margin: 0 }}>Parlons de votre mariage ou de votre événement</h2><p style={{ color: "rgba(245,240,232,.7)", fontFamily: "'Montserrat', sans-serif", lineHeight: 1.8, margin: "1.3rem auto 2rem", maxWidth: 640 }}>Un premier échange permet de préciser votre besoin, votre calendrier et le niveau d’accompagnement adapté.</p><a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" data-track="booking_start" style={{ ...buttonStyle, background: "#b8973e", color: "#1c1208", border: "1px solid #b8973e" }}>Choisir un créneau</a></section>
    </main>
  );
}
