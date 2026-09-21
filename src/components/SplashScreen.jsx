import { useEffect } from "react";
import { motion } from "framer-motion";
import { GOLD } from "../constants.js";

const SPLASH_MAX_MS = 700;
const SPLASH_IMG = (typeof import.meta !== "undefined" ? (import.meta.env.BASE_URL || "/") : "/") + "images/style-parisien.jpg";

const SplashScreen = ({ onDone, loading }) => {
  useEffect(() => {
    const fallback = setTimeout(onDone, SPLASH_MAX_MS);
    return () => clearTimeout(fallback);
  }, [onDone]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#070400", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2.4rem", overflow: "hidden" }}>

    {/* Photo de fond */}
    <motion.img
      src={SPLASH_IMG}
      width="1200"
      height="1600"
      alt="Gaspardnz splash screen background - styliste parisien"
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 0.45, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
    />
    {/* Overlay sombre */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(4,2,0,0.5) 0%, rgba(4,2,0,0.3) 40%, rgba(4,2,0,0.6) 100%)" }} />

    {/* Bouton Passer */}
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.6 }}
      onClick={onDone}
      aria-label="Skip splash screen"
      style={{ position: "absolute", top: "2rem", right: "2rem", zIndex: 10, background: "rgba(184,151,62,0.15)", border: "1px solid rgba(184,151,62,0.4)", color: "rgba(245,240,232,0.88)", padding: "0.7rem 1.2rem", minHeight: "44px", minWidth: "44px", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px", transition: "all 0.3s ease" }}
      onHoverStart={{ background: "rgba(184,151,62,0.25)" }}>
      Passer
    </motion.button>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
      <motion.p
        initial={{ letterSpacing: "0.12em", opacity: 0 }}
        animate={{ letterSpacing: "0.38em", opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3.5rem", color: "#faf7f2", margin: 0, lineHeight: 1, textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
        GASPARDNZ
      </motion.p>
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, letterSpacing: "0.44em" }}
        transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: GOLD, textTransform: "uppercase", marginTop: "10px" }}>
        Paris
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
