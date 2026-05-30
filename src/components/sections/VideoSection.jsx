import { useContext, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD, TEXT } from "../../constants.js";
import { useTr } from "../../context.jsx";

const VideoSection = () => {
  const t = useTr();
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.5 });

  const VIDEO_URL = "https://res.cloudinary.com/dtzhbeebz/video/upload/Looks_demi-saison_ou_demi-_Dakar_arefgg.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isInView]);

  return (
    <section ref={sectionRef} style={{ background: "#0a0602", padding: "3rem 1.4rem" }}>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "8px",
          letterSpacing: "0.5em",
          color: GOLD,
          textTransform: "uppercase",
          marginBottom: "2rem",
          textAlign: "center",
        }}
      >
        {t("nav_galerie")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          aspectRatio: "9 / 16",
          maxHeight: "600px",
          margin: "0 auto",
          boxShadow: "0 8px 40px rgba(184,151,62,0.15)",
        }}
      >
        <video
          ref={videoRef}
          src={VIDEO_URL}
          controls
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            background: "#1c1208",
          }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.1rem",
          fontStyle: "italic",
          color: "rgba(245,240,232,0.65)",
          textAlign: "center",
          marginTop: "1.6rem",
          lineHeight: 1.6,
        }}
      >
        Découvrez les derniers looks et inspirations
      </motion.p>
    </section>
  );
};

export default VideoSection;
