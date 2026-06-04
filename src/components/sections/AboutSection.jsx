import { motion } from "framer-motion";
import { GOLD, CREAM } from "../../constants.js";
import { useTr } from "../../context.jsx";

const AboutSection = () => {
  const t = useTr();

  const aboutContent = {
    FR: {
      title: "Styliste & Habilleur à Paris",
      subtitle: "Expertise en sélection de tenues pour mariages, événements africains et galas",
      description: "Gaspardnz est un styliste et habilleur parisien spécialisé dans la sélection et la mise en place de looks sophistiqués. Avec plus de 7 ans d'expérience, il accompagne ses clients pour des mariages africains, des galas, des cérémonies et des événements haut-de-gamme. En tant que maître de cérémonie, il assure une coordination impeccable de chaque détail.",
      services: [
        "Styliste mariage à Paris",
        "Habilleur événements africains",
        "Conseiller style pour cérémonies",
        "Maître de cérémonie",
        "Sélection de tenues sur-mesure (partenaires)"
      ]
    },
    EN: {
      title: "Stylist & Dresser in Paris",
      subtitle: "Expertise in outfit selection for weddings, African events and galas",
      description: "Gaspardnz is a Parisian stylist and dresser specializing in selecting and styling sophisticated looks. With over 7 years of experience, he assists clients for African weddings, galas, ceremonies and high-end events. As a master of ceremonies, he ensures impeccable coordination of every detail.",
      services: [
        "Wedding stylist in Paris",
        "Dresser for African events",
        "Style advisor for ceremonies",
        "Master of ceremonies",
        "Outfit selection through partners"
      ]
    },
    ES: {
      title: "Estilista y Vestidor en París",
      subtitle: "Experiencia en selección de looks para bodas, eventos africanos y galas",
      description: "Gaspardnz es un estilista y vestidor parisino especializado en la selección y coordinación de looks sofisticados. Con más de 7 años de experiencia, acompaña a sus clientes en bodas africanas, galas, ceremonias y eventos de alto nivel. Como maestro de ceremonias, asegura una coordinación impecable de cada detalle.",
      services: [
        "Estilista de bodas en París",
        "Vestidor para eventos africanos",
        "Asesor de estilo para ceremonias",
        "Maestro de ceremonias",
        "Selección de atuendos a través de socios"
      ]
    },
    ZH: {
      title: "巴黎造型师与服装搭配师",
      subtitle: "婚礼、非洲活动和晚宴服装选择专家",
      description: "Gaspardnz 是一位巴黎造型师和服装搭配师，专门从事精致造型的选择和协调。拥有7年以上经验，为非洲婚礼、晚宴、典礼和高端活动的客户服务。作为仪式主持人，他确保每一个细节的完美协调。",
      services: [
        "巴黎婚礼造型师",
        "非洲活动服装搭配师",
        "典礼风格顾问",
        "仪式主持人",
        "通过合作伙伴的服装选择"
      ]
    }
  };

  const content = aboutContent[t?.lang || "FR"] || aboutContent.FR;

  return (
    <section style={{ background: "#0a0602", padding: "4rem 1.4rem", color: CREAM }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}>

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(32px, 8vw, 56px)",
            color: GOLD,
            margin: "0 0 1rem 0",
            letterSpacing: "0.04em"
          }}>
            {content.title}
          </h2>

          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(16px, 4vw, 20px)",
            fontStyle: "italic",
            color: "rgba(245,240,232,0.85)",
            marginBottom: "2rem",
            lineHeight: 1.6
          }}>
            {content.subtitle}
          </p>

          <p style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "14px",
            lineHeight: 1.8,
            color: "rgba(245,240,232,0.75)",
            marginBottom: "2.5rem",
            letterSpacing: "0.02em"
          }}>
            {content.description}
          </p>

          <div style={{
            borderLeft: `2px solid ${GOLD}`,
            paddingLeft: "1.5rem",
            marginTop: "2.5rem"
          }}>
            <h3 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "12px",
              color: GOLD,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              margin: "0 0 1.2rem 0"
            }}>
              Spécialités / Specialties
            </h3>
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0
            }}>
              {content.services.map((service, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "16px",
                    color: "rgba(245,240,232,0.8)",
                    marginBottom: "0.8rem",
                    lineHeight: 1.5
                  }}>
                  • {service}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
