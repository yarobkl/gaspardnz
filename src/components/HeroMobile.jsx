import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { GOLD, CREAM } from "../constants.js";
import { useTr } from "../context.jsx";

const _HERO_SRC = (typeof import.meta !== "undefined" ? (import.meta.env.BASE_URL || "/") : "/") + "hero.mp4";
const _VIDEO_STYLE = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", filter: "brightness(0.82) contrast(1.05) saturate(1.0)" };

const HeroVideoLoop = () => {
  const ref = useRef(null);
  const readyRef = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "video";
    preloadLink.href = _HERO_SRC;
    preloadLink.type = "video/mp4";
    document.head.appendChild(preloadLink);
    const play = () => {
      if (document.hidden || !v.paused) return;
      v.play().catch(() => {});
    };
    const loadAndPlay = () => {
      v.load();
      play();
      window.setTimeout(play, 180);
      window.setTimeout(play, 650);
    };
    const onCanPlay = () => { readyRef.current = true; play(); };
    const onPause = () => { if (!document.hidden) setTimeout(play, 250); };
    const onStall = () => setTimeout(play, 350);
    const onVis   = () => { if (!document.hidden && readyRef.current) play(); };

    loadAndPlay();
    v.addEventListener("canplay",    onCanPlay);
    v.addEventListener("loadeddata", onCanPlay);
    v.addEventListener("loadedmetadata", onCanPlay);
    v.addEventListener("pause",      onPause);
    v.addEventListener("stalled",    onStall);
    window.addEventListener("focus", play);
    document.addEventListener("touchstart",        play,  { once: true });
    document.addEventListener("visibilitychange",  onVis);
    return () => {
      v.removeEventListener("canplay",    onCanPlay);
      v.removeEventListener("loadeddata", onCanPlay);
      v.removeEventListener("loadedmetadata", onCanPlay);
      v.removeEventListener("pause",      onPause);
      v.removeEventListener("stalled",    onStall);
      window.removeEventListener("focus", play);
      document.removeEventListener("touchstart",       play);
      document.removeEventListener("visibilitychange", onVis);
      preloadLink.remove();
    };
  }, []);
  return (
    <video
      ref={ref}
      src={_HERO_SRC}
      autoPlay muted playsInline loop
      disablePictureInPicture disableRemotePlayback
      preload="auto"
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
    <section style={{ height: "100dvh", position: "relative", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center", background: "#1c1208" }}>
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", inset: 0, willChange: "transform" }}
      >
        <HeroVideoLoop />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.65) 100%)" }} />
      </motion.div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(to bottom, transparent 0%, #f5f0e8 100%)", zIndex: 8, pointerEvents: "none" }} />

      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }} />

      <motion.div style={{ position: "relative", zIndex: 10, width: "100%", padding: "0 1.4rem 5.5rem", opacity }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.6em", color: GOLD, textTransform: "uppercase", marginBottom: "1.2rem" }}
        >
          {t("hero_maison")}
        </motion.p>

        <div style={{ lineHeight: 0.88, marginBottom: "1.8rem" }}>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "105%" }} animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(68px, 22vw, 120px)", letterSpacing: "0.04em", color: CREAM, display: "block", margin: 0, textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}
            >GASPARD</motion.h1>
          </div>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "105%" }} animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(68px, 22vw, 120px)", letterSpacing: "0.04em", color: "transparent", WebkitTextStroke: `2.5px ${GOLD}`, display: "block", margin: 0, filter: "drop-shadow(0 0 12px rgba(184,151,62,0.5))" }}
            >NZ</motion.h1>
          </div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginBottom: "1.4rem", width: "180px", transformOrigin: "left" }}
        />

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.9rem" }}
        >
          <motion.p ref={heroTextRef}
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={heroInView ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
            transition={{ duration: 1.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "clamp(18px, 5vw, 24px)", color: "rgba(245,240,232,0.97)", lineHeight: 1.3, letterSpacing: "0.06em" }}>
            {t("hero_subtitle")}
          </motion.p>
          <motion.button onClick={onScrollDown}
            animate={{ boxShadow: ["0 0 0px rgba(184,151,62,0)", "0 0 14px rgba(184,151,62,0.55)", "0 0 0px rgba(184,151,62,0)"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "relative", overflow: "hidden", background: "none", border: "1px solid rgba(245,240,232,0.65)", color: "rgba(245,240,232,0.95)", cursor: "pointer", padding: "0.7rem 1.4rem", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.35em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            <motion.span
              animate={{ x: ["-130%", "230%"] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              style={{ position: "absolute", top: 0, left: 0, width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(184,151,62,0.5), transparent)", pointerEvents: "none" }} />
            {t("hero_cta")}
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroMobile;
