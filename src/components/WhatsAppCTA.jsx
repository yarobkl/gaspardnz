import { motion } from "framer-motion";
import { useTr } from "../context.jsx";

const WhatsAppCTA = ({ waPhoneUrl = "https://wa.me/33612345678" }) => {
  const t = useTr();

  return (
    <motion.a
      href={waPhoneUrl}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2.5, duration: 0.6 }}
      style={{
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        boxShadow: "0 4px 20px rgba(37, 211, 102, 0.4)",
        cursor: "pointer",
        fontSize: "28px"
      }}
      title="Contacter via WhatsApp">
      💬
    </motion.a>
  );
};

export default WhatsAppCTA;
