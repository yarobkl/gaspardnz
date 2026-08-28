import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform, useInView } from "framer-motion";
import { GOLD, CREAM } from "../constants.js";
import { useTr } from "../context.jsx";
import PromotionBanner from "./PromotionBanner.jsx";

const _HERO_SRC = (typeof import.meta !== "undefined" ? (import.meta.env.BASE_URL || "/") : "/") + "hero.mp4";
const _VIDEO_STYLE = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "brightness(0.82) contrast(1.05) saturate(1.0)" };

const HeroVideoLoop = () => {
  const t = useTr();
  const ref = useRef(null);
  const readyRef = useRef(false);
  const [videoSrc] = useState(_HERO_SRC);
  const playIntervalRef = useRef(null);
  const [showPausedNotice, setShowPausedNotice] = useState(false);

  useEffect(() => {
    if (!videoSrc) return;
    const v = ref.current;
    if (!v) return;
    const play = () => { if (document.hidden || !v.paused) return; v.play().catch(() => {}); };
    const attemptPlayAndCheck = () => {
      const result = v.play();
      if (result && typeof result.catch === "function") result.then(() => { setTimeout(() => { if (!v.paused) setShowPausedNotice(false); }, 600); }).catch(() => setShowPausedNotice(true));
      setTimeout(() => { if (v.paused) setShowPausedNotice(true); }, 600);
    };
    const loadAndPlay = () => { v.load(); play(); window.setTimeout(play, 180); window.setTimeout(attemptPlayAndCheck, 650); };
    const onCanPlay = () => { readyRef.current = true; play(); };
    const onPlaying = () => setShowPausedNotice(false);
    const onPause = () => { if (!document.hidden) setTimeout(play, 250); };
    const onStall = () => setTimeout(play, 350);
    const onVis = () => { if (!document.hidden && readyRef.current) play(); };

    loadAndPlay();
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadeddata", onCanPlay);
    v.addEventListener("loadedmetadata", onCanPlay);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("pause", onPause);
    v.addEventListener("stalled", onStall);
    window.addEventListener("focus", play);
    document.addEventListener("touchstart", play, { once: true });
    document.addEventListener("visibilitychange", onVis);
    playIntervalRef.current = setInterval(() => { if (!document.hidden && v.paused && readyRef.current) v.play().catch(() => {}); if (!v.paused) setShowPausedNotice(false); }, 500);

    return () => {
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadeddata", onCanPlay);
      v.removeEventListener("loadedmetadata", onCanPlay);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("stalled", onStall);
      window.removeEventListener("focus", play);
      document.removeEventListener("touchstart", play);
      document.removeEventListener("visibilitychange", onVis);
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [videoSrc]);

  const retryPlay = () => {
    const v = ref.current;
    if (!v) return;
    const result = v.play();
    if (result && typeof result.catch === "function") result.then(() => setTimeout(() => { if (!v.paused) setShowPausedNotice(false); }, 300)).catch(() => setShowPausedNotice(true));
  };

  return <>
    <video ref={ref} src={videoSrc} autoPlay muted playsInline loop disablePictureInPicture disableRemotePlayback preload="auto" controls={false} x-webkit-airplay="deny" controlsList="nodownload nofullscreen noremoteplayback" onEnded={e => { e.target.currentTime = 0; e.target.play().catch(() => {}); }} style={{ ..._VIDEO_STYLE, background: "#1c1208" }}><track kind="captions" src="/captions/hero-fr.vtt" srcLang="fr" label="Français" /></video>
    {showPausedNotice && <button onClick={retryPlay} aria-label={t("hero_video_paused")} style={{ position: "absolute", bottom: "14px", left: "50%", transform: "translateX(-50%)", zIndex: 9, maxWidth: "min(88vw, 420px)", background: "rgba(20,13,6,0.45)", backdropFilter: "blur(2px)", border: "1px solid rgba(184,151,62,0.3)", borderRadius: "999px", padding: "0.5rem 1rem", fontFamily: "'Montserrat', sans-serif", fontSize: "10.5px", lineHeight: 1.4, letterSpacing: "0.02em", color: "rgba(245,240,232,0.85)", textShadow: "0 1px 3px rgba(0,0,0,0.6)", cursor: "pointer", textAlign: "center" }}>{t("hero_video_paused")}</button>}
  </>;
};

const HeroMobile = ({ onScrollDown }) => {
  const t = useTr();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroTextRef = useRef(null);
  const heroInView = useInView(heroTextRef, { once: false, margin: "-10% 0px" });

  return (
    <section style={{ minHeight: "100svh", height: "100dvh", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", background: "#1c1208" }}>
      <motion.div initial={reduceMotion ? false : { scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: reduceMotion ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }} style={{ position: "absolute", inset: 0, willChange: "transform" }}>
        <HeroVideoLoop />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.65) 100%)" }} />
      </motion.div>

      <PromotionBanner placement="home" />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(to bottom, transparent 0%, #f5f0e8 100%)", zIndex: 8, pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }} />

      <motion.div style={{ position: "relative", zIndex: 10, width: "100%", padding: "0 1.4rem 5.5rem", opacity }}>
        <motion.p initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 1, delay: reduceMotion ? 0 : 0.5 }} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.44em", color: GOLD, textTransform: "uppercase", marginBottom: "1.2rem" }}>{t("hero_maison")}</motion.p>
        <div style={{ lineHeight: 0.88, marginBottom: "1.8rem" }}>
          <div style={{ overflow: "hidden" }}><motion.h1 initial={reduceMotion ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: reduceMotion ? 0 : 1.1, delay: reduceMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(68px, 22vw, 120px)", letterSpacing: "0.04em", color: CREAM, display: "block", margin: 0, textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}>GASPARD</motion.h1></div>
          <div style={{ overflow: "hidden" }}><motion.h1 initial={reduceMotion ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: reduceMotion ? 0 : 1.1, delay: reduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(68px, 22vw, 120px)", letterSpacing: "0.04em", color: "transparent", WebkitTextStroke: `2.5px ${GOLD}`, display: "block", margin: 0, filter: "drop-shadow(0 0 12px rgba(184,151,62,0.5))" }}>NZ</motion.h1></div>
        </div>
        <motion.div initial={reduceMotion ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduceMotion ? 0 : 1.2, delay: reduceMotion ? 0 : 1.1, ease: [0.16, 1, 0.3, 1] }} style={{ height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginBottom: "1.4rem", width: "180px", transformOrigin: "left" }} />
        <motion.div initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduceMotion ? 0 : 1.5 }} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.9rem" }}>
          <motion.p ref={heroTextRef} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0.72, y: 4 }} transition={{ duration: reduceMotion ? 0 : 0.9, delay: reduceMotion ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }} style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(18px, 5vw, 24px)", color: "rgba(245,240,232,0.97)", lineHeight: 1.3, letterSpacing: "0.06em", maxWidth: "min(86vw, 360px)" }}>{t("hero_subtitle")}</motion.p>
          <motion.button onClick={onScrollDown} aria-label={t("hero_cta")} animate={reduceMotion ? {} : { boxShadow: ["0 0 0px rgba(184,151,62,0)", "0 0 14px rgba(184,151,62,0.55)", "0 0 0px rgba(184,151,62,0)"] }} transition={{ duration: reduceMotion ? 0 : 2.4, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut" }} style={{ position: "relative", overflow: "hidden", background: "none", border: "1px solid rgba(245,240,232,0.65)", color: "rgba(245,240,232,0.95)", cursor: "pointer", padding: "0.82rem 1.4rem", minHeight: "44px", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.35em", textTransform: "uppercase", whiteSpace: "nowrap" }}><motion.span animate={reduceMotion ? {} : { x: ["-130%", "230%"] }} transition={{ duration: reduceMotion ? 0 : 1.6, repeat: reduceMotion ? 0 : Infinity, repeatDelay: 2, ease: "easeInOut" }} style={{ position: "absolute", top: 0, left: 0, width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(184,151,62,0.5), transparent)", pointerEvents: "none" }} />{t("hero_cta")}</motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroMobile;
