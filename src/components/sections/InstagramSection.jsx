import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TEXT } from "../../constants.js";
import { useTr } from "../../context.jsx";
import { useSettings } from "../../hooks/useSettings.js";

const InstagramSection = () => {
  const t = useTr();
  const settings = useSettings();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const igUrl = settings.instagramUrl || "https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq";
  const posts = [
    { src: `${import.meta.env.BASE_URL}images/costume-creme.jpg`,      label: t("gal_1") },
    { src: `${import.meta.env.BASE_URL}images/smoking-dore.jpg`,       label: t("gal_13") },
    { src: `${import.meta.env.BASE_URL}images/veste-bleue.jpg`,        label: t("gal_6") },
    { src: `${import.meta.env.BASE_URL}images/costume-bordeaux.jpg`,   label: t("gal_11") },
    { src: `${import.meta.env.BASE_URL}images/elegance-blanche.jpg`,   label: t("gal_2") },
    { src: `${import.meta.env.BASE_URL}images/promenade-blanche.jpg`,  label: t("gal_12") },
  ];
  return (
    <section ref={ref} style={{ background: "#faf7f2", padding: "4rem 0 4.5rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.4rem", marginBottom: "1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", fontWeight: 700, color: TEXT }}>@gaspardnz_</p>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(28,18,8,0.45)" }}>{t("ig_role")}</p>
          </div>
        </div>
        <motion.a href={igUrl} target="_blank" rel="noopener noreferrer"
          whileTap={{ scale: 0.95 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.1em", color: "#faf7f2", background: "linear-gradient(90deg,#dc2743,#bc1888)", padding: "8px 14px", borderRadius: "20px", textDecoration: "none", fontWeight: 600 }}>
          {t("ig_follow")}
        </motion.a>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
        {posts.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", cursor: "pointer" }}
            onClick={() => window.open(igUrl, "_blank")}>
            <img src={p.src} alt={`Look Gaspardnz — ${p.label}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} loading="lazy" />
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.5 }}
        style={{ textAlign: "center", marginTop: "1.6rem", padding: "0 1.4rem" }}>
        <motion.a href={IG_URL} target="_blank" rel="noopener noreferrer"
          whileTap={{ scale: 0.97 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9.5px", letterSpacing: "0.2em", color: TEXT, textTransform: "uppercase", textDecoration: "none", borderBottom: "1px solid #b8973e", paddingBottom: "2px" }}>
          {t("ig_all")}
        </motion.a>
      </motion.div>
    </section>
  );
};

export default InstagramSection;
