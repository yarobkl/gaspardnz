import { motion } from "framer-motion";
import { GOLD } from "../../constants.js";

const SectionDivider = ({ from, to }) => (
  <div style={{ position: "relative", height: "56px", background: `linear-gradient(to bottom, ${from}, ${to})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "absolute", left: "2.5rem", right: "2.5rem", height: "1px", background: `linear-gradient(90deg, transparent, rgba(184,151,62,0.25), rgba(184,151,62,0.55), rgba(184,151,62,0.25), transparent)` }} />
    <motion.div
      initial={{ opacity: 0, rotate: 0 }} whileInView={{ opacity: 1, rotate: 45 }} viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: "6px", height: "6px", background: GOLD, position: "relative", zIndex: 1, boxShadow: `0 0 6px rgba(184,151,62,0.6)` }}
    />
  </div>
);

export default SectionDivider;
