import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD } from "../constants.js";
import { useTr } from "../context.jsx";

const CookieBanner = () => {
  const t = useTr();
  const [visible, setVisible] = useState(() => !localStorage.getItem("gnz-cookies"));

  const handle = (v) => {
    localStorage.setItem("gnz-cookies", v);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          style={{ position: "fixed", bottom: "1.2rem", left: "1.2rem", right: "1.2rem", maxWidth: "420px", margin: "0 auto", zIndex: 9990, background: "#0f0a04", border: "1px solid rgba(184,151,62,0.22)", borderRadius: "14px", padding: "1.2rem 1.4rem", display: "flex", flexDirection: "column", gap: "0.9rem", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.65)", lineHeight: 1.7, margin: 0 }}>
            {t("cookie_text")}
          </p>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => handle("accepted")}
              style={{ flex: 1, background: GOLD, color: "#0a0602", border: "none", borderRadius: "30px", padding: "0.6rem", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>
              {t("cookie_accept")}
            </motion.button>
            <button onClick={() => handle("declined")}
              style={{ flex: 1, background: "none", color: "rgba(245,240,232,0.35)", border: "1px solid rgba(245,240,232,0.12)", borderRadius: "30px", padding: "0.6rem", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer" }}>
              {t("cookie_decline")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
