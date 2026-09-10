import { useContext, useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD, CDN_BASE } from "../../constants.js";
import { LangCtx, useTr } from "../../context.jsx";
import useCompactMobile from "../../hooks/useCompactMobile.js";

const COPY = {
  FR: { more: "Voir la vidéo en plein format", less: "Réduire la vidéo", caption: "Découvrez les derniers looks et inspirations" },
  EN: { more: "View full video", less: "Collapse video", caption: "Discover the latest looks and inspirations" },
  ES: { more: "Ver vídeo completo", less: "Reducir vídeo", caption: "Descubre los últimos looks e inspiraciones" },
  ZH: { more: "查看完整视频", less: "收起视频", caption: "探索最新造型与灵感" },
};

const VideoSection = () => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const isCompactMobile = useCompactMobile();
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const shouldLoad = useInView(sectionRef, { amount: 0.15, margin: "320px 0px" });
  const isInView = useInView(sectionRef, { amount: 0.5 });
  const [videoSrc, setVideoSrc] = useState("");
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const copy = COPY[lang] || COPY.FR;

  const VIDEO_URL = `${CDN_BASE}/video/upload/Looks_demi-saison_ou_demi-_Dakar_arefgg.mp4`;

  const playVideo = useCallback((withSound = false) => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    video.muted = !withSound;
    video.volume = withSound ? 1 : 0;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setSoundBlocked(false);
          if (withSound) setSoundEnabled(true);
        })
        .catch(() => setSoundBlocked(withSound));
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
      playVideo(soundEnabled);
    } else {
      video.pause();
      setSoundBlocked(false);
    }
  }, [isInView, videoSrc, playVideo, soundEnabled]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) {
        video.pause();
        return;
      }
      if (isInView) playVideo(soundEnabled);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isInView, videoSrc, playVideo, soundEnabled]);

  const compactVideo = isCompactMobile && !expanded;

  return (
    <section ref={sectionRef} style={{ background: "#0a0602", padding: isCompactMobile ? "2.2rem 1.4rem 2.6rem" : "3rem 1.4rem" }}>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.4em",
          color: GOLD,
          textTransform: "uppercase",
          marginBottom: isCompactMobile ? "1.35rem" : "2rem",
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
          aspectRatio: compactVideo ? "4 / 5" : "9 / 16",
          maxHeight: compactVideo ? "480px" : "600px",
          margin: "0 auto",
          boxShadow: "0 8px 40px rgba(184,151,62,0.15)",
          position: "relative",
          transition: "aspect-ratio .28s ease, max-height .28s ease",
        }}
      >
        <video
          ref={videoRef}
          className="gnz-video-player"
          src={videoSrc}
          controls
          playsInline
          autoPlay
          muted
          preload="metadata"
          aria-label="Sélection de looks GaspardNZ"
          onVolumeChange={(event) => setSoundEnabled(!event.currentTarget.muted && event.currentTarget.volume > 0)}
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
        {isInView && !soundEnabled && (
          <button
            aria-label="Activer le son de la vidéo"
            onClick={() => playVideo(true)}
            style={{
              position: "absolute",
              left: "50%",
              bottom: "4rem",
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
            {soundBlocked ? "Touchez pour activer le son" : "Activer le son"}
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
          margin: isCompactMobile ? "1.1rem 0 .9rem" : "1.6rem 0 0",
          lineHeight: 1.6,
        }}
      >
        {copy.caption}
      </motion.p>

      {isCompactMobile && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            style={{ minHeight:44, border:"1px solid rgba(184,151,62,.36)", borderRadius:999, background:"rgba(184,151,62,.06)", color:GOLD, padding:"0 1.2rem", fontFamily:"'Montserrat',sans-serif", fontSize:9, fontWeight:600, letterSpacing:".18em", textTransform:"uppercase", cursor:"pointer" }}>
            {expanded ? copy.less : copy.more}
          </button>
        </div>
      )}
    </section>
  );
};

export default VideoSection;
