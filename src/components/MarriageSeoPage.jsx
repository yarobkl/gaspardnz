import { CALENDLY_URL, WA_NUM } from "../constants.js";

const waHref = `https://wa.me/${WA_NUM}?text=${encodeURIComponent("Bonjour Gaspard, je prépare un mariage et je souhaite être accompagné pour ma tenue et mon style.")}`;

const navStyle = { color: "rgba(245,240,232,.74)", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: ".11em", textTransform: "uppercase" };
const buttonStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: ".95rem 1.35rem", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600 };

const FAQ = [
  ["Quand prendre rendez-vous avant le mariage ?", "Le plus tôt est le mieux lorsque plusieurs tenues ou temps forts sont prévus. Un premier échange permet surtout de poser le calendrier, de vérifier ce qui existe déjà et d’identifier les décisions à prendre."],
  ["GaspardNZ fabrique-t-il les costumes ?", "Cette page présente un accompagnement de stylisme, d’habillage et de conseil en image. L’objectif est de construire et coordonner votre allure. Les pièces peuvent provenir de votre dressing ou de maisons et partenaires adaptés au projet."],
  ["Peut-on prévoir plusieurs looks ?", "Oui. Un mariage peut demander des niveaux de formalité différents entre la mairie, la cérémonie, le dîner et la soirée. L’accompagnement peut servir à créer une continuité entre ces moments sans répéter exactement la même silhouette."],
  ["L’accompagnement est-il uniquement pour le marié ?", "Le besoin peut concerner un marié, un témoin, un membre de la famille ou un invité qui occupe un rôle important. Le point de départ reste toujours le contexte et l’image recherchée."],
];

export default function MarriageSeoPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0602", color: "#f5f0e8" }}>
      <header style={{ borderBottom: "1px solid rgba(184,151,62,.2)", padding: "1rem 1.25rem" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ color: "#f5f0e8", textDecoration: "none", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", letterSpacing: ".14em" }}>GASPARDNZ</a>
          <nav aria-label="Navigation principale" style={{ display: "flex", flexWrap: "wrap", gap: 17 }}>
            <a href="/services" style={navStyle}>Services</a><a href="/lookbook" style={navStyle}>Lookbook</a><a href="/galerie" style={navStyle}>Galerie</a><a href="/contact" style={navStyle}>Contact</a>
          </nav>
        </div>
      </header>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(4rem,9vw,8rem) 1.25rem 4rem" }}>
        <p style={{ color: "#b8973e", fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", margin: "0 0 1rem" }}>Mariage · Paris · Conseil en style homme</p>
        <h1 style={{ maxWidth: 920, fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3.2rem,8vw,6.8rem)", fontWeight: 300, lineHeight: .96, margin: 0 }}>Styliste mariage homme à Paris</h1>
        <p style={{ maxWidth: 790, color: "rgba(245,240,232,.77)", fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(.96rem,2vw,1.06rem)", lineHeight: 1.9, margin: "2rem 0 0" }}>Pour un mariage, une tenue ne se résume pas au costume. Il faut penser la coupe, les proportions, la chemise, les chaussures, les accessoires, les couleurs et surtout la cohérence avec le lieu, la saison et votre rôle. GaspardNZ accompagne les hommes qui veulent construire une allure précise et élégante, sans se perdre dans une accumulation de choix.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: "2rem" }}>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" data-track="booking_start" style={{ ...buttonStyle, background: "#b8973e", color: "#1c1208", border: "1px solid #b8973e" }}>Prendre rendez-vous</a>
          <a href={waHref} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" style={{ ...buttonStyle, color: "#f5f0e8", border: "1px solid rgba(245,240,232,.3)" }}>Parler du mariage sur WhatsApp</a>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.25rem 5rem" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 400, marginBottom: "1rem" }}>Une silhouette pensée pour chaque temps fort</h2>
        <p style={{ maxWidth: 800, fontFamily: "'Montserrat', sans-serif", color: "rgba(245,240,232,.68)", lineHeight: 1.85 }}>La mairie, la cérémonie, les photos, le dîner et la soirée n’imposent pas toujours la même lecture. L’enjeu est de prévoir une continuité : une base forte, puis des variations de détails ou de tenue lorsque le programme le demande. Cette préparation permet aussi d’éviter les décisions de dernière minute et les associations qui fonctionnent séparément mais pas ensemble.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14, marginTop: 28 }}>
          {[
            ["01", "Comprendre votre mariage", "Date, lieux, dress code, rôle, déroulé de la journée, photos et niveau de formalité attendu."],
            ["02", "Composer la silhouette", "Coupes, couleurs, matières, chemise, accessoires et chaussures sont choisis comme un ensemble."],
            ["03", "Prévoir les transitions", "Lorsque plusieurs looks sont utiles, ils sont pensés pour rester cohérents entre mairie, cérémonie et soirée."],
            ["04", "Sécuriser le jour J", "Selon la formule, l’accompagnement peut aller jusqu’à l’habillage et la vérification des détails au moment clé."],
          ].map(([n, title, text]) => <article key={n} style={{ border: "1px solid rgba(184,151,62,.22)", padding: "1.5rem", background: "rgba(255,255,255,.025)" }}><span style={{ color: "#b8973e", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: ".18em" }}>{n}</span><h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.55rem", margin: ".7rem 0" }}>{title}</h3><p style={{ fontFamily: "'Montserrat', sans-serif", color: "rgba(245,240,232,.67)", fontSize: ".87rem", lineHeight: 1.75, margin: 0 }}>{text}</p></article>)}
        </div>
      </section>

      <section style={{ background: "#f5f0e8", color: "#1c1208" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "4.8rem 1.25rem" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,5.5vw,4.4rem)", fontWeight: 400, margin: 0 }}>À qui s’adresse cet accompagnement ?</h2>
          <p style={{ maxWidth: 790, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.85, color: "rgba(28,18,8,.72)", margin: "1.2rem 0" }}>Au marié qui veut une vision claire plutôt qu’une suite d’achats isolés, mais aussi au témoin, au père du marié, à un proche ou à un invité qui occupe une place importante. L’accompagnement est particulièrement utile lorsque vous hésitez entre plusieurs niveaux de formalité, lorsque vous souhaitez deux silhouettes dans la journée, ou lorsque vous avez déjà certaines pièces mais ne savez pas comment les coordonner.</p>
          <p style={{ maxWidth: 790, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.85, color: "rgba(28,18,8,.72)", margin: 0 }}>GaspardNZ travaille sur le stylisme et l’habillage : l’objectif n’est pas de vous imposer une esthétique, mais de traduire votre personnalité dans une silhouette adaptée au mariage. Le rendez-vous sert donc autant à éliminer les mauvaises options qu’à identifier les bonnes.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 30 }}><a href="/lookbook" style={{ ...navStyle, color: "#1c1208" }}>Voir le lookbook</a><a href="/galerie" style={{ ...navStyle, color: "#1c1208" }}>Voir la galerie</a><a href="/services" style={{ ...navStyle, color: "#1c1208" }}>Tous les services</a></div>
        </div>
      </section>

      <section style={{ maxWidth: 980, margin: "0 auto", padding: "5rem 1.25rem" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,5.5vw,4.2rem)", fontWeight: 400, marginBottom: "2rem" }}>Questions fréquentes</h2>
        <div style={{ display: "grid", gap: 14 }}>{FAQ.map(([q, a]) => <details key={q} style={{ border: "1px solid rgba(184,151,62,.22)", padding: "1.25rem 1.35rem" }}><summary style={{ cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem" }}>{q}</summary><p style={{ fontFamily: "'Montserrat', sans-serif", color: "rgba(245,240,232,.68)", lineHeight: 1.8, fontSize: ".88rem", margin: "1rem 0 0" }}>{a}</p></details>)}</div>
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "1rem 1.25rem 5.5rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,6vw,4.4rem)", fontWeight: 300, margin: 0 }}>Préparons votre allure pour le jour J</h2>
        <p style={{ maxWidth: 650, margin: "1.25rem auto 2rem", fontFamily: "'Montserrat', sans-serif", color: "rgba(245,240,232,.7)", lineHeight: 1.8 }}>Présentez la date, le déroulé et vos premières idées. Le premier échange permettra de définir la manière la plus utile de vous accompagner.</p>
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" data-track="booking_start" style={{ ...buttonStyle, background: "#b8973e", color: "#1c1208", border: "1px solid #b8973e" }}>Choisir un créneau</a>
      </section>
    </main>
  );
}
