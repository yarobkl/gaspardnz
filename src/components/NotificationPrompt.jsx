import { motion, AnimatePresence } from "framer-motion";
import { GOLD } from "../constants.js";
import { useTr } from "../context.jsx";

const NotificationPrompt = ({ visible, onAccept, onDecline }) => {
  const t = useTr();
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 2.4rem" }}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            style={{ background: "#0f0a04", border: "1px solid rgba(184,151,62,0.25)", borderRadius: "20px", padding: "2rem 1.6rem", maxWidth: "360px", width: "calc(100% - 2.4rem)", textAlign: "center" }}
          >
            <motion.div
              animate={{ boxShadow: ["0 0 4px 1px rgba(184,151,62,0.2)", "0 0 12px 4px rgba(184,151,62,0.6)", "0 0 4px 1px rgba(184,151,62,0.2)"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "10px", height: "10px", border: `1px solid rgba(184,151,62,0.8)`, background: "rgba(184,151,62,0.25)", transform: "rotate(45deg)", margin: "0 auto 1.6rem" }}
            />
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.45em", color: GOLD, textTransform: "uppercase", marginBottom: "0.9rem" }}>{t("notif_label")}</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.5rem, 6vw, 1.8rem)", fontWeight: 300, color: "#faf7f2", lineHeight: 1.15, margin: "0 0 0.9rem" }}>{t("notif_title_l1")}<br />{t("notif_title_l2")}</h3>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,232,0.5)", lineHeight: 1.7, marginBottom: "1.8rem" }}>{t("notif_desc")}</p>
            <motion.button onClick={onAccept} whileTap={{ scale: 0.97 }}
              style={{ display: "block", width: "100%", background: GOLD, color: "#0a0602", border: "none", borderRadius: "50px", padding: "0.9rem", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.85rem" }}>
              {t("notif_accept")}
            </motion.button>
            <button onClick={onDecline}
              style={{ display: "block", width: "100%", background: "none", color: "rgba(245,240,232,0.28)", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.25em", textTransform: "uppercase", padding: "0.4rem" }}>
              {t("notif_decline")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPrompt;
