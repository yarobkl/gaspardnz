import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { WA_CHANNEL_URL } from "../../data/styleDuMoisData.js";

const HeartbeatLine = () => {
  const beat = (x) =>
    `L${x},15 L${x+3},13 L${x+6},2 L${x+9},28 L${x+12},12 L${x+15},15`;
  const d = `M0,15 ${beat(12)} L70,15 ${beat(82)} L140,15 ${beat(152)} L210,15 ${beat(222)} L280,15`;

  return (
    <div style={{
      margin: "1.4rem auto",
      WebkitMaskImage: "linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)",
      maskImage: "linear-gradient(90deg, transparent, #000 22%, #000 78%, transparent)",
    }}>
      <svg viewBox="0 0 280 30" style={{ width: "100%", maxWidth: "260px", height: "30px", display: "block", margin: "0 auto", overflow: "visible" }}>
        <motion.path
          d={d}
          fill="none"
          stroke={GOLD}
          strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 4px ${GOLD}) drop-shadow(0 0 10px rgba(184,151,62,0.35))` }}
          initial={{ pathLength: 0.25, pathOffset: 0 }}
          animate={{ pathOffset: [0, 0.25] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
};

const CommunauteSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });

  return (
    <section ref={ref} style={{ background: "#0a0602", padding: "4.5rem 1.4rem 5rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ background: "linear-gradient(135deg,rgba(184,151,62,0.08),rgba(184,151,62,0.02))", border: "1px solid rgba(184,151,62,0.22)", borderRadius: "20px", padding: "2.2rem 1.4rem", textAlign: "center" }}>

        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "60px", height: "60px", background: "linear-gradient(135deg,#25D366,#128C7E)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.4rem" }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.032a.75.75 0 0 0 .921.921l5.18-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.355l-.355-.212-3.676 1.047 1.047-3.608-.23-.372A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
          </svg>
        </motion.div>

        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>COMMUNAUTÉ</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "26px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, marginBottom: 0 }}>Rejoignez la communauté</p>

        <HeartbeatLine />

        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,232,0.5)", lineHeight: 1.65, marginBottom: "1.8rem" }}>
          Conseils style exclusifs, avant-premières, looks de la semaine et coulisses des shootings — uniquement sur WhatsApp.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "1.2rem" }}>
          {["Style hebdo", "Avant-premières", "Conseils exclusifs"].map((tag, i) => (
            <span key={i} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.2em", color: GOLD, background: "rgba(184,151,62,0.1)", border: "1px solid rgba(184,151,62,0.25)", borderRadius: "20px", padding: "4px 10px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{tag}</span>
          ))}
        </div>

        <motion.a
          href={WA_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.97 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "#25D366", color: "white", padding: "0.9rem 1.8rem", borderRadius: "30px", textDecoration: "none", fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.032a.75.75 0 0 0 .921.921l5.18-1.475A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 0 1-4.953-1.355l-.355-.212-3.676 1.047 1.047-3.608-.23-.372A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
          Rejoindre le canal
        </motion.a>
      </motion.div>
    </section>
  );
};

export default CommunauteSection;
