import { motion } from "framer-motion";
import { GOLD, CREAM } from "../../constants.js";
import { useTr } from "../../context.jsx";

const AboutSection = () => {
  const t = useTr();

  const aboutContent = {
    FR: {
      eyebrow: "Expérience client",
      title: "Du premier échange au jour J",
      subtitle: "L'objectif : trouver une allure forte, confortable et juste pour votre événement.",
      steps: [
        {
          n: "01",
          title: "Diagnostic du style",
          text: "On part de votre événement, votre morphologie, vos couleurs, votre rôle et l'image que vous voulez laisser."
        },
        {
          n: "02",
          title: "Sélection du look",
          text: "Gaspard compose les pièces, les associations et les détails : costume, chemise, chaussures, accessoires et finitions."
        },
        {
          n: "03",
          title: "Présence et coordination",
          text: "Pour les mariages, galas et cérémonies, l'accompagnement peut aller jusqu'à la mise en place et la coordination du jour J."
        }
      ],
      highlights: [
        "Mariage",
        "Gala",
        "Cérémonie",
        "Conseil image"
      ]
    },
    EN: {
      eyebrow: "Client experience",
      title: "From first call to event day",
      subtitle: "The goal: a strong, comfortable and accurate look for your occasion.",
      steps: [
        { n: "01", title: "Style diagnosis", text: "We start from your event, body shape, colors, role and the impression you want to leave." },
        { n: "02", title: "Look selection", text: "Gaspard builds the outfit: suit, shirt, shoes, accessories and finishing details." },
        { n: "03", title: "Presence and coordination", text: "For weddings, galas and ceremonies, support can include setup and coordination on the day." }
      ],
      highlights: [
        "Wedding",
        "Gala",
        "Ceremony",
        "Image advice"
      ]
    },
    ES: {
      eyebrow: "Experiencia cliente",
      title: "De la primera llamada al evento",
      subtitle: "El objetivo: una presencia fuerte, cómoda y justa para la ocasión.",
      steps: [
        { n: "01", title: "Diagnóstico de estilo", text: "Partimos del evento, la morfología, los colores, el rol y la imagen que quieres proyectar." },
        { n: "02", title: "Selección del look", text: "Gaspard compone las piezas: traje, camisa, zapatos, accesorios y acabados." },
        { n: "03", title: "Presencia y coordinación", text: "Para bodas, galas y ceremonias, el acompañamiento puede incluir coordinación el día del evento." }
      ],
      highlights: [
        "Boda",
        "Gala",
        "Ceremonia",
        "Imagen"
      ]
    },
    ZH: {
      eyebrow: "客户体验",
      title: "从第一次沟通到活动当天的清晰陪伴",
      subtitle: "目标：为你的场合打造有力量、舒适且准确的形象。",
      steps: [
        { n: "01", title: "风格诊断", text: "从活动、身形、颜色、角色和你想留下的印象开始。" },
        { n: "02", title: "造型选择", text: "Gaspard 组合西装、衬衫、鞋履、配饰和细节。" },
        { n: "03", title: "现场协调", text: "婚礼、晚宴和仪式可提供当天造型与流程协调。" }
      ],
      highlights: [
        "婚礼",
        "晚宴",
        "仪式",
        "形象建议"
      ]
    }
  };

  const content = aboutContent[t?.lang || "FR"] || aboutContent.FR;

  return (
    <section style={{ background: "#0a0602", padding: "4rem 1.4rem 4.6rem", color: CREAM }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}>

          <p style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "7px",
            letterSpacing: "0.55em",
            color: GOLD,
            textTransform: "uppercase",
            margin: "0 0 0.9rem"
          }}>
            {content.eyebrow}
          </p>

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(34px, 9vw, 64px)",
            color: "#faf7f2",
            margin: "0 0 1rem 0",
            letterSpacing: "0.04em",
            lineHeight: 0.95
          }}>
            {content.title}
          </h2>

          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(16px, 4vw, 20px)",
            fontStyle: "italic",
            color: "rgba(245,240,232,0.78)",
            marginBottom: "2.2rem",
            lineHeight: 1.6
          }}>
            {content.subtitle}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.85rem" }}>
            {content.steps.map((step) => (
              <motion.article
                key={step.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: Number(step.n) * 0.08 }}
                viewport={{ once: true }}
                style={{
                  border: "1px solid rgba(184,151,62,0.24)",
                  background: "linear-gradient(180deg, rgba(245,240,232,0.055), rgba(184,151,62,0.045))",
                  padding: "1.15rem",
                  minHeight: "190px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: GOLD, letterSpacing: "0.08em", lineHeight: 1 }}>
                  {step.n}
                </span>
                <div>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.18em", color: "#faf7f2", textTransform: "uppercase", margin: "0 0 0.75rem", lineHeight: 1.5 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", lineHeight: 1.6, color: "rgba(245,240,232,0.72)", margin: 0 }}>
                    {step.text}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginTop: "1.35rem" }}>
            {content.highlights.map((item) => (
              <span key={item} style={{
                border: "1px solid rgba(184,151,62,0.34)",
                color: GOLD,
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "8px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "0.65rem 0.75rem"
              }}>
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
