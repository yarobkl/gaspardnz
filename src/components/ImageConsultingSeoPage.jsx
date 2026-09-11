import { CALENDLY_URL, WA_NUM } from "../constants.js";

const waHref = `https://wa.me/${WA_NUM}?text=${encodeURIComponent("Bonjour Gaspard, je souhaite clarifier mon style et mon image. J’aimerais échanger sur un accompagnement de conseil en image.")}`;

const navStyle = { color: "rgba(245,240,232,.74)", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: ".11em", textTransform: "uppercase" };
const buttonStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 50, padding: ".95rem 1.35rem", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", fontWeight: 600 };

const FAQ = [
  ["À quoi sert un conseil en image pour homme ?", "À clarifier les choix qui renforcent votre allure : coupes, proportions, couleurs, matières, associations et niveau de formalité. L’objectif est de construire une direction cohérente avec votre personnalité et les situations dans lesquelles vous évoluez."],
  ["Faut-il changer toute sa garde-robe ?", "Non. Le premier échange sert notamment à comprendre ce que vous portez déjà, ce qui fonctionne et ce qui crée de l’incohérence. Le conseil doit d’abord vous aider à mieux décider, pas à multiplier les achats."],
  ["Le conseil en image est-il réservé aux événements ?", "Non. Un événement peut être le déclencheur, mais les principes travaillés — coupes, couleurs, matières et associations — peuvent aussi aider à rendre votre image plus claire dans d’autres contextes personnels ou professionnels."],
  ["Que préparer avant le premier rendez-vous ?", "Vos objectifs, les contextes dans lesquels vous souhaitez mieux vous habiller, quelques tenues que vous portez déjà et, si vous en avez, des références visuelles. Cela permet d’identifier rapidement les priorités."],
];

export default function ImageConsultingSeoPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0602", color: "#f5f0e8" }}>
      <header style={{ borderBottom: "1px solid rgba(184,151,62,.2)", padding: "1rem 1.25rem" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ color: "#f5f0e8", textDecoration: "none", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.7rem", letterSpacing: ".14em" }}>GASPARDNZ</a>
          <nav aria-label="Navigation principale" style={{ display: "flex", flexWrap: "wrap", gap: 17 }}>
            <a href="/services" style={navStyle}>Services</a>
            <a href="/styliste-mariage-homme-paris" style={navStyle}>Mariage</a>
            <a href="/lookbook" style={navStyle}>Lookbook</a>
            <a href="/contact" style={navStyle}>Contact</a>
          </nav>
        </div>
      </header>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(4rem,9vw,8rem) 1.25rem 4rem" }}>
        <p style={{ color: "#b8973e", fontFamily: "'Montserrat', sans-serif", fontSize: 11, letterSpacing: ".28em", textTransform: "uppercase", margin: "0 0 1rem" }}>Conseil en image · Homme · Paris</p>
        <h1 style={{ maxWidth: 920, fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3.2rem,8vw,6.8rem)", fontWeight: 300, lineHeight: .96, margin: 0 }}>Conseil en image homme à Paris</h1>
        <p style={{ maxWidth: 790, color: "rgba(245,240,232,.77)", fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(.96rem,2vw,1.06rem)", lineHeight: 1.9, margin: "2rem 0 0" }}>Vous pouvez avoir de belles pièces et malgré tout hésiter devant votre tenue. Le problème vient souvent moins du vêtement que de la cohérence entre les coupes, les couleurs, les matières, les proportions et le contexte. GaspardNZ accompagne les hommes qui souhaitent clarifier leur image et construire des silhouettes plus lisibles, sans leur imposer un personnage qui ne leur ressemble pas.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: "2rem" }}>
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" data-track="booking_start" style={{ ...buttonStyle, background: "#b8973e", color: "#1c1208", border: "1px solid #b8973e" }}>Prendre rendez-vous</a>
          <a href={waHref} target="_blank" rel="noopener noreferrer" data-track="whatsapp_click" style={{ ...buttonStyle, color: "#f5f0e8", border: "1px solid rgba(245,240,232,.3)" }}>Échanger sur WhatsApp</a>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.25rem 5rem" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 400, marginBottom: "1rem" }}>Donner une direction claire à votre style</h2>
        <p style={{ maxWidth: 800, fontFamily: "'Montserrat', sans-serif", color: "rgba(245,240,232,.68)", lineHeight: 1.85 }}>Le conseil en image ne consiste pas à accumuler des règles. Il sert à réduire les hésitations et à comprendre pourquoi certaines silhouettes fonctionnent mieux que d’autres pour vous. La méthode part de vos besoins réels : votre rythme de vie, les situations dans lesquelles vous souhaitez être plus juste, les pièces que vous portez déjà et l’image que vous voulez transmettre.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14, marginTop: 28 }}>
          {[
            ["01", "Clarifier l’objectif", "Identifier les situations, les attentes et les points de blocage qui rendent vos choix vestimentaires difficiles."],
            ["02", "Travailler les proportions", "Lire les coupes, longueurs et volumes qui construisent une silhouette équilibrée selon votre morphologie et le contexte."],
            ["03", "Créer des associations cohérentes", "Relier couleurs, matières, chaussures et accessoires pour que chaque élément serve l’ensemble plutôt que de fonctionner seul."],
            ["04", "Rendre les choix reproductibles", "Comprendre les principes qui vous permettent ensuite de composer plus facilement une tenue adaptée à chaque situation."],
          ].map(([n, title, text]) => <article key={n} style={{ border: "1px solid rgba(184,151,62,.22)", padding: "1.5rem", background: "rgba(255,255,255,.025)" }}><span style={{ color: "#b8973e", fontFamily: "'Montserrat', sans-serif", fontSize: 10, letterSpacing: ".18em" }}>{n}</span><h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.55rem", margin: ".7rem 0" }}>{title}</h3><p style={{ fontFamily: "'Montserrat', sans-serif", color: "rgba(245,240,232,.67)", fontSize: ".87rem", lineHeight: 1.75, margin: 0 }}>{text}</p></article>)}
        </div>
      </section>

      <section style={{ background: "#f5f0e8", color: "#1c1208" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "4.8rem 1.25rem" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,5.5vw,4.4rem)", fontWeight: 400, margin: 0 }}>Une image adaptée à vos vrais contextes</h2>
          <p style={{ maxWidth: 790, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.85, color: "rgba(28,18,8,.72)", margin: "1.2rem 0" }}>Un style cohérent n’est pas identique partout. La tenue attendue pour un rendez-vous important, un dîner, une cérémonie ou un environnement professionnel peut changer, tout en conservant une même identité. L’enjeu est de construire une base suffisamment claire pour adapter le niveau de formalité sans repartir de zéro.</p>
          <p style={{ maxWidth: 790, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.85, color: "rgba(28,18,8,.72)", margin: 0 }}>Si votre besoin est spécifiquement lié à un mariage, la page dédiée détaille le travail autour de la mairie, de la cérémonie et du jour J. Pour un besoin plus large, ce rendez-vous de conseil en image sert à poser la direction générale et les priorités.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 30 }}>
            <a href="/styliste-mariage-homme-paris" style={{ ...navStyle, color: "#1c1208" }}>Conseil mariage</a>
            <a href="/lookbook" style={{ ...navStyle, color: "#1c1208" }}>Voir le lookbook</a>
            <a href="/galerie" style={{ ...navStyle, color: "#1c1208" }}>Voir la galerie</a>
            <a href="/services" style={{ ...navStyle, color: "#1c1208" }}>Tous les services</a>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 980, margin: "0 auto", padding: "5rem 1.25rem" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,5.5vw,4.2rem)", fontWeight: 400, marginBottom: "2rem" }}>Questions fréquentes</h2>
        <div style={{ display: "grid", gap: 14 }}>{FAQ.map(([q, a]) => <details key={q} style={{ border: "1px solid rgba(184,151,62,.22)", padding: "1.25rem 1.35rem" }}><summary style={{ cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem" }}>{q}</summary><p style={{ fontFamily: "'Montserrat', sans-serif", color: "rgba(245,240,232,.68)", lineHeight: 1.8, fontSize: ".88rem", margin: "1rem 0 0" }}>{a}</p></details>)}</div>
      </section>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "1rem 1.25rem 5.5rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem,6vw,4.4rem)", fontWeight: 300, margin: 0 }}>Clarifions votre image</h2>
        <p style={{ maxWidth: 650, margin: "1.25rem auto 2rem", fontFamily: "'Montserrat', sans-serif", color: "rgba(245,240,232,.7)", lineHeight: 1.8 }}>Présentez les situations dans lesquelles vous souhaitez être plus à l’aise et les difficultés que vous rencontrez aujourd’hui. Le premier échange permettra d’identifier la manière la plus utile de vous accompagner.</p>
        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" data-track="booking_start" style={{ ...buttonStyle, background: "#b8973e", color: "#1c1208", border: "1px solid #b8973e" }}>Choisir un créneau</a>
      </section>
    </main>
  );
}
