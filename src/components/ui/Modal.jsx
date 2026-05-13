import { motion, AnimatePresence } from "framer-motion";
import { GOLD } from "../../constants.js";

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", backdropFilter: "blur(8px)" }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.7 }}
          onClick={e => e.stopPropagation()}
          style={{ width: "100%", maxWidth: "560px", background: "#faf7f2", border: `1px solid rgba(184,151,62,0.2)`, position: "relative", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        >
          <div style={{ padding: "1.6rem 2.5rem 1.2rem", borderBottom: `1px solid rgba(184,151,62,0.15)`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase" }}>{title}</p>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(28,18,8,0.5)", cursor: "pointer", padding: "4px 8px", fontSize: "22px", lineHeight: 1, flexShrink: 0 }}>×</button>
          </div>
          <div style={{ overflowY: "auto", padding: "2rem 2.5rem 2.5rem", flex: 1 }}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Modal;
