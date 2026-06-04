import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD, SOCIAL_LINKS } from "../../constants.js";

const TikTokViralSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  return (
    <section ref={ref} style={{ background: "#0a0602", padding: "4.5rem 0 5rem" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{ padding: "0 1.4rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.45em", color: "rgba(250,247,242,0.25)", textTransform: "uppercase", textAlign: "center", marginBottom: "16px" }}>2 797 commentaires · commentaire épinglé</p>
        <div style={{ background: "#161210", borderRadius: "14px", padding: "1.1rem 1.2rem", border: "1px solid rgba(184,151,62,0.18)", maxWidth: "340px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg,#1a237e,#283593)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(184,151,62,0.3)" }}>
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 700, color: "#faf7f2" }}>FI</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 700, color: "#faf7f2", margin: 0 }}>fallyipupa</p>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#20d5ec"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              </div>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(250,247,242,0.35)", margin: "2px 0 0" }}>Artiste certifié · 2023-02-22</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ opacity: 0.6 }}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.27 8.27 0 004.84 1.54V6.91a4.85 4.85 0 01-1.07-.22z"/></svg>
          </div>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "15px", color: "#faf7f2", lineHeight: 1.5, margin: "0 0 10px" }}>😂😂😂chic 👌</p>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(254,44,85,0.8)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(250,247,242,0.4)" }}>607</span>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.55 }}
        style={{ textAlign: "center", marginTop: "2.4rem" }}>
        <motion.a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer"
          whileTap={{ scale: 0.97 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "9px", border: `1px solid rgba(184,151,62,0.35)`, padding: "11px 24px", borderRadius: "24px", textDecoration: "none" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={GOLD}><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.27 8.27 0 004.84 1.54V6.91a4.85 4.85 0 01-1.07-.22z"/></svg>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase" }}>Suivre @gaspardnz</span>
        </motion.a>
      </motion.div>
    </section>
  );
};

export default TikTokViralSection;
