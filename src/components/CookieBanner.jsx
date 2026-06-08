import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD } from "../constants.js";
import { useTr } from "../context.jsx";
import { initGA } from "../services/analytics.js";

const CookieBanner = () => {
  const t = useTr();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("gnz-cookies")) return;
    const timer = window.setTimeout(() => setVisible(true), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  const handle = (v) => {
    localStorage.setItem("gnz-cookies", v);
    if (v === "accepted") initGA();
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
          style={{ position: "fixed", bottom: "max(0.85rem, env(safe-area-inset-bottom))", left: "0.85rem", right: "0.85rem", maxWidth: "440px", margin: "0 auto", zIndex: 640, background: "rgba(15,10,4,0.94)", backdropFilter: "blur(18px)", border: "1px solid rgba(184,151,62,0.2)", borderRadius: "12px", padding: "0.85rem 0.95rem", display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", boxShadow: "0 10px 28px rgba(0,0,0,0.34)" }}
        >
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(245,240,232,0.68)", lineHeight: 1.55, margin: 0 }}>
            {t("cookie_text")}
          </p>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => handle("accepted")}
              style={{ flex: 1, background: GOLD, color: "#0a0602", border: "none", borderRadius: "30px", padding: "0.55rem", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", minHeight: "40px" }}>
              {t("cookie_accept")}
            </motion.button>
            <button onClick={() => handle("declined")}
              style={{ flex: 1, background: "none", color: "rgba(245,240,232,0.75)", border: "1px solid rgba(245,240,232,0.14)", borderRadius: "30px", padding: "0.55rem", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", minHeight: "40px" }}>
              {t("cookie_decline")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
