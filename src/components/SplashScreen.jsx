import { useEffect } from "react";
import { motion } from "framer-motion";
import { GOLD } from "../constants.js";

const SPLASH_MAX_MS = 900;

const SplashScreen = ({ onDone, loading }) => {
  useEffect(() => {
    const fallback = setTimeout(onDone, SPLASH_MAX_MS);
    return () => clearTimeout(fallback);
  }, [onDone]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "radial-gradient(circle at 50% 42%, #3a291b 0%, #170f09 72%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.2rem", overflow: "hidden" }}>

    {/* Bouton Passer */}
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.35 }}
      onClick={onDone}
      aria-label="Skip splash screen"
      style={{ position: "absolute", top: "2rem", right: "2rem", zIndex: 10, background: "transparent", border: "1px solid rgba(220,178,91,0.42)", color: "rgba(245,240,232,0.88)", padding: "0.7rem 1.2rem", minHeight: "44px", minWidth: "44px", fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", borderRadius: "999px", transition: "all 0.3s ease" }}
      onHoverStart={{ background: "rgba(184,151,62,0.25)" }}>
      Passer
    </motion.button>

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
      <motion.p
        initial={{ letterSpacing: "0.08em", opacity: 0 }}
        animate={{ letterSpacing: "0.16em", opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: "'Snell Roundhand', 'Apple Chancery', cursive", fontSize: "clamp(5.4rem, 24vw, 8rem)", fontWeight: 700, color: "#e2b75f", margin: 0, lineHeight: 0.9, textShadow: "0 0 12px rgba(226,183,95,.35), 0 3px 26px rgba(0,0,0,.55)" }}>
        GNZ
      </motion.p>
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, letterSpacing: "0.16em" }}
        transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: "Georgia, serif", fontSize: "13px", color: "#f5e7cf", marginTop: "17px", fontStyle: "italic" }}>
        S'habiller autrement !
      </motion.p>
    </motion.div>

    <div style={{ width: "140px", height: "1px", background: "rgba(184,151,62,0.15)", position: "relative", overflow: "hidden", zIndex: 1 }}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.05, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onAnimationComplete={onDone}
        style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${GOLD}, #d4ae5a)`, transformOrigin: "left" }} />
    </div>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.45, 0.25, 0.45] }}
      transition={{ duration: 1.2, delay: 0.25, times: [0, 0.3, 0.6, 1] }}
      style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.42em", color: "rgba(245,240,232,0.7)", textTransform: "uppercase", position: "relative", zIndex: 1 }}>
      {loading}
    </motion.p>
    </motion.div>
  );
};

export default SplashScreen;

