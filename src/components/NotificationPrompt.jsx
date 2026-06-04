import { motion, AnimatePresence } from "framer-motion";
import { GOLD } from "../constants.js";
import { useTr } from "../context.jsx";

const NotificationPrompt = ({ visible, onAccept, onDecline }) => {
  const t = useTr();
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: "fixed", left: "0.9rem", right: "0.9rem", bottom: "max(1rem, env(safe-area-inset-bottom))", zIndex: 650, display: "flex", alignItems: "flex-end", justifyContent: "center", pointerEvents: "none" }}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            style={{ background: "rgba(15,10,4,0.96)", backdropFilter: "blur(18px)", border: "1px solid rgba(184,151,62,0.25)", borderRadius: "16px", padding: "1.15rem", maxWidth: "380px", width: "100%", textAlign: "center", boxShadow: "0 18px 48px rgba(0,0,0,0.36)", pointerEvents: "auto" }}
          >
            <motion.div
              animate={{ boxShadow: ["0 0 4px 1px rgba(184,151,62,0.2)", "0 0 12px 4px rgba(184,151,62,0.6)", "0 0 4px 1px rgba(184,151,62,0.2)"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "8px", height: "8px", border: `1px solid rgba(184,151,62,0.8)`, background: "rgba(184,151,62,0.25)", transform: "rotate(45deg)", margin: "0 auto 0.9rem" }}
            />

            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.38em", color: GOLD, textTransform: "uppercase", marginBottom: "0.65rem" }}>
              {t("notif_label")}
            </p>

            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.25rem, 5vw, 1.55rem)", fontWeight: 300, color: "#faf7f2", lineHeight: 1.15, margin: "0 0 0.55rem" }}>
              {t("notif_title_l1")}<br />{t("notif_title_l2")}
            </h3>

            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.92rem", color: "rgba(245,240,232,0.56)", lineHeight: 1.55, marginBottom: "1rem" }}>
              {t("notif_desc")}
            </p>

            <motion.button
              onClick={onAccept}
              whileTap={{ scale: 0.97 }}
              style={{ display: "block", width: "100%", background: GOLD, color: "#0a0602", border: "none", borderRadius: "50px", padding: "0.78rem", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.5rem" }}
            >
              {t("notif_accept")}
            </motion.button>

            <button
              onClick={onDecline}
              style={{ display: "block", width: "100%", background: "none", color: "rgba(245,240,232,0.28)", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.25em", textTransform: "uppercase", padding: "0.4rem" }}
            >
              {t("notif_decline")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPrompt;
