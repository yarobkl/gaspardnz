import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { useTr } from "../../context.jsx";

const reviews = [
  { id: 1, platform: "tiktok", handle: "@rodrin_b", initials: "RB", gradient: "linear-gradient(135deg,#1e3a5f,#2d6a9f)", text: "Franchement Gaspard m'a transformé pour mon mariage. Le costume était parfait, la coupe impeccable. Tous mes invités ont demandé qui m'avait habillé.", stars: 5 },
  { id: 2, platform: "instagram", handle: "@cedric.monaco", initials: "CM", gradient: "linear-gradient(135deg,#4a1942,#8b2fc9)", text: "Service VIP de bout en bout. Gaspard a une vraie vision artistique. Il ne fait pas que vêtir, il construit une identité.", stars: 5 },
  { id: 3, platform: "tiktok", handle: "@yannick.b", initials: "YB", gradient: "linear-gradient(135deg,#1a3a1a,#2d6b2d)", text: "Pour mon gala à Lyon, j'avais besoin d'un look qui claque. Résultat : 200+ commentaires sur ma photo. Un vrai professionnel.", stars: 5 },
  { id: 4, platform: "whatsapp", handle: "Alexis N.", initials: "AN", gradient: "linear-gradient(135deg,#3d1a00,#8b3d00)", text: "Disponible, à l'écoute et ultra professionnel. Le costume livré à Dubaï était exactement ce que je voulais. Je recommande les yeux fermés.", stars: 5 },
];

const StarRow = ({ n = 5 }) => (
  <div style={{ display: "flex", gap: "3px" }}>
    {Array.from({ length: n }).map((_, i) => (
      <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={GOLD}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    ))}
  </div>
);

const TestimonialsSection = () => {
  const t = useTr();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  return (
    <section ref={ref} style={{ background: "#0a0602", padding: "4.5rem 0 5rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ padding: "0 1.4rem", marginBottom: "2.4rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.42em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>{t("testimonials_eyebrow")}</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 }}>{t("testimonials_title")}</p>
        <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginTop: "14px" }} />
      </motion.div>

      <div style={{ padding: "0 1.4rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {reviews.map((r, i) => (
          <motion.div key={r.id}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-6% 0px" }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: "#161210", borderRadius: "14px", padding: "1.2rem", border: "1px solid rgba(184,151,62,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: r.gradient, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(184,151,62,0.25)" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", fontWeight: 500, color: GOLD }}>{r.initials}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", fontWeight: 600, color: "#faf7f2", margin: 0 }}>{r.handle}</p>
                <StarRow n={r.stars} />
              </div>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase" }}>{r.platform}</span>
            </div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,232,0.72)", lineHeight: 1.65, margin: 0 }}>« {r.text} »</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
