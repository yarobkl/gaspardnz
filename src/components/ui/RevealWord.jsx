import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export const RevealWord = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  return (
    <span ref={ref} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.28em" }}>
      <motion.span
        style={{ display: "inline-block" }}
        initial={{ y: "110%" }}
        animate={inView ? { y: 0 } : { y: "110%" }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
};

export const RevealLine = ({ text, delay = 0, style = {} }) => (
  <span style={{ display: "inline-block", overflow: "hidden" }}>
    <motion.span
      style={{ display: "inline-block", ...style }}
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {text}
    </motion.span>
  </span>
);

export default RevealWord;
