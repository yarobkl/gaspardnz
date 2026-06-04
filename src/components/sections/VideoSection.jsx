import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD, TEXT } from "../../constants.js";
import { useTr } from "../../context.jsx";

const VideoSection = () => {
  const t = useTr();
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const shouldLoad = useInView(sectionRef, { amount: 0.15, margin: "320px 0px" });
  const isInView = useInView(sectionRef, { amount: 0.5 });
  const [videoSrc, setVideoSrc] = useState("");
  const [soundBlocked, setSoundBlocked] = useState(false);

  const VIDEO_URL = "https://res.cloudinary.com/dtzhbeebz/video/upload/Looks_demi-saison_ou_demi-_Dakar_arefgg.mp4";

  const playWithSound = useCallback(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    video.muted = false;
    video.volume = 1;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setSoundBlocked(false))
        .catch(() => setSoundBlocked(true));
    }
  }, [videoSrc]);

  useEffect(() => {
    if (shouldLoad && !videoSrc) setVideoSrc(VIDEO_URL);
  }, [shouldLoad, videoSrc]);

  useEffect(() => {
    if (!videoSrc) return;
    const video = videoRef.current;
    if (!video) return;

    if (isInView) {
      video.muted = false;
      video.volume = 1;
      playWithSound();
    } else {
      video.pause();
      setSoundBlocked(false);
    }
  }, [isInView, videoSrc, playWithSound]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) {
        video.pause();
        return;
      }
      if (isInView) playWithSound();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isInView, videoSrc, playWithSound]);

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
          position: "relative",
        }}
      >
        <video
          ref={videoRef}
          className="gnz-video-player"
          src={videoSrc}
          controls
          playsInline
          autoPlay
          muted={false}
          preload="none"
          onLoadedMetadata={playWithSound}
          onCanPlay={playWithSound}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            background: "#1c1208",
          }}
        >
          <track kind="captions" src="/captions/gaspardnz-video-fr.vtt" srcLang="fr" label="Français" default />
        </video>
        {soundBlocked && isInView && (
          <button
            aria-label="Activer le son de la vidéo"
            onClick={playWithSound}
            style={{
              position: "absolute",
              left: "50%",
              bottom: "1rem",
              transform: "translateX(-50%)",
              zIndex: 5,
              border: `1px solid rgba(184,151,62,0.7)`,
              background: "rgba(10,6,2,0.82)",
              color: GOLD,
              padding: "0.75rem 1rem",
              borderRadius: "999px",
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "9px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
            }}
          >
            Activer le son
          </button>
        )}
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
