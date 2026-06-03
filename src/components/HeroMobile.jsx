import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { GOLD, CREAM } from "../constants.js";
import { useTr } from "../context.jsx";

const _HERO_SRC = (typeof import.meta !== "undefined" ? (import.meta.env.BASE_URL || "/") : "/") + "hero.mp4";
const _VIDEO_STYLE = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "brightness(0.82) contrast(1.05) saturate(1.0)" };

const HeroVideoLoop = () => {
  const ref = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const play    = () => v.play().catch(() => {});
    const onCanPlay = () => { setVideoReady(true); play(); };
    const onPause = () => { if (!document.hidden) setTimeout(play, 300); };
    const onStall = () => setTimeout(play, 500);
    const onVis   = () => { if (!document.hidden && videoReady) play(); };

    v.addEventListener("canplay",    onCanPlay);
    v.addEventListener("loadeddata", onCanPlay);
    v.addEventListener("pause",      onPause);
    v.addEventListener("stalled",    onStall);
    document.addEventListener("touchstart",        play,  { once: true });
    document.addEventListener("visibilitychange",  onVis);
    return () => {
      v.removeEventListener("canplay",    onCanPlay);
      v.removeEventListener("loadeddata", onCanPlay);
      v.removeEventListener("pause",      onPause);
      v.removeEventListener("stalled",    onStall);
      document.removeEventListener("touchstart",       play);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [videoReady]);
  return (
    <video
      ref={ref}
      src={_HERO_SRC}
      muted playsInline loop
      disablePictureInPicture disableRemotePlayback
      preload="none"
      controls={false}
      x-webkit-airplay="deny"
      controlsList="nodownload nofullscreen noremoteplayback"
      onEnded={e => { e.target.currentTime = 0; e.target.play().catch(() => {}); }}
      style={{ ..._VIDEO_STYLE, background: "#1c1208" }}
    />
  );
};

const HeroMobile = ({ onScrollDown }) => {
  const t = useTr();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroTextRef = useRef(null);
  const heroInView = useInView(heroTextRef, { once: false, margin: "-10% 0px" });


  return (
    <section style={{ height: "100dvh", position: "relative", overflow: "hidden", background: "#1c1208" }}>
      {/* Vidéo background - position absolute, z-index 0 */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", inset: 0, willChange: "transform", zIndex: 0 }}
      >
        <HeroVideoLoop />
      </motion.div>

      {/* Overlay sombre modéré - z-index 1 */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, transparent 40%, rgba(0,0,0,0.35) 100%)", zIndex: 1, pointerEvents: "none" }} />

      {/* Contenu texte - position relative, z-index 20 */}
      <div style={{ position: "relative", zIndex: 20, height: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-end", padding: "0 1.4rem 5.5rem", width: "100%", minHeight: "100vh" }}>

        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.6em", color: GOLD, textTransform: "uppercase", marginBottom: "1.2rem", margin: 0, opacity: 1 }}>
          {t("hero_maison")}
        </p>

        <div style={{ lineHeight: 0.88, marginBottom: "1.8rem" }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(68px, 22vw, 120px)", letterSpacing: "0.04em", color: CREAM, display: "block", margin: 0, textShadow: "0 2px 24px rgba(0,0,0,0.6)", opacity: 1 }}>
            GASPARD
          </h1>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(68px, 22vw, 120px)", letterSpacing: "0.04em", color: "transparent", WebkitTextStroke: `2.5px ${GOLD}`, display: "block", margin: 0, filter: "drop-shadow(0 0 12px rgba(184,151,62,0.5))", opacity: 1 }}>
            NZ
          </h1>
        </div>

        <div style={{ height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginBottom: "1.4rem", width: "180px" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.9rem" }}>
          <p ref={heroTextRef} style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(18px, 5vw, 24px)", color: "rgba(245,240,232,0.97)", lineHeight: 1.3, letterSpacing: "0.06em", margin: 0, opacity: 1 }}>
            {t("hero_subtitle")}
          </p>
          <button onClick={onScrollDown}
            style={{ position: "relative", overflow: "hidden", background: "none", border: "1px solid rgba(245,240,232,0.65)", color: "rgba(245,240,232,0.95)", cursor: "pointer", padding: "0.7rem 1.4rem", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.35em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {t("hero_cta")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroMobile;
