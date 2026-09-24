import { useContext, useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD, CDN_BASE } from "../../constants.js";
import { LangCtx, useTr } from "../../context.jsx";
import useCompactMobile from "../../hooks/useCompactMobile.js";

const COPY = {
  FR: { more: "Voir la vidéo en plein format", less: "Réduire la vidéo", caption: "Découvrez les derniers looks et inspirations", play: "Lancer la vidéo", lowPower: "Mode économie d'énergie activé : l'iPhone bloque la lecture automatique. Touchez pour lancer la vidéo." },
  EN: { more: "View full video", less: "Collapse video", caption: "Discover the latest looks and inspirations", play: "Play the video", lowPower: "Low Power Mode is on: your iPhone blocks autoplay. Tap to play the video." },
  ES: { more: "Ver vídeo completo", less: "Reducir vídeo", caption: "Descubre los últimos looks e inspiraciones", play: "Reproducir el vídeo", lowPower: "Modo de bajo consumo activado: el iPhone bloquea la reproducción automática. Toca para reproducir el vídeo." },
  ZH: { more: "查看完整视频", less: "收起视频", caption: "探索最新造型与灵感", play: "播放视频", lowPower: "已开启低电量模式：iPhone 会阻止自动播放。轻触即可播放视频。" },
};

const VIDEO_URL = `${CDN_BASE}/video/upload/Looks_demi-saison_ou_demi-_Dakar_arefgg.mp4`;
// Image tirée de la vidéo (1 s) par Cloudinary : sans elle, une vidéo que
// le téléphone refuse de lancer seul reste un cadre entièrement noir.
const POSTER_URL = `${CDN_BASE}/video/upload/so_1,w_720,q_auto/Looks_demi-saison_ou_demi-_Dakar_arefgg.jpg`;

const detectIOS = () => typeof navigator !== "undefined"
  && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

const VideoSection = () => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const isCompactMobile = useCompactMobile();
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const playPromiseRef = useRef(null);
  const shouldLoad = useInView(sectionRef, { amount: 0.15, margin: "320px 0px" });
  const isInView = useInView(sectionRef, { amount: 0.5 });
  const [videoSrc, setVideoSrc] = useState("");
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Lecture automatique refusée par le téléphone (mode économie d'énergie
  // sur iPhone, typiquement) ou vidéo en erreur : on affiche alors un vrai
  // bouton de lecture, car seul un toucher de l'utilisateur la débloque.
  const [blocked, setBlocked] = useState(false);
  const [isIOS] = useState(detectIOS);
  const copy = COPY[lang] || COPY.FR;

  const playVideo = useCallback((withSound = false) => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    video.muted = !withSound;
    video.volume = withSound ? 1 : 0;
    const playPromise = video.play();
    playPromiseRef.current = playPromise || null;
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setBlocked(false);
          setSoundBlocked(false);
          if (withSound) setSoundEnabled(true);
        })
        .catch(() => {
          if (withSound) setSoundBlocked(true);
          else setBlocked(true);
        })
        .finally(() => { if (playPromiseRef.current === playPromise) playPromiseRef.current = null; });
    }
  }, [videoSrc]);

  const playByTap = () => {
    const video = videoRef.current;
    if (video?.error) video.load();
    playVideo(true);
  };

  // En ouvrant l'onglet "Vidéos", la section défile jusqu'à sa position
  // stable (voir scrollToStableTarget dans App.jsx) : isInView peut donc
  // basculer plusieurs fois très vite pendant cette animation. Appeler
  // video.pause() alors qu'un play() est encore en attente interrompt sa
  // promesse : un piège classique de l'API <video> : et laissait la vidéo
  // bloquée en erreur (code 4, plus aucune lecture possible) : c'était le
  // vrai bug derrière "la vidéo ne s'affiche pas". On attend que le play()
  // en cours se résolve avant de mettre en pause.
  const pauseVideoSafely = useCallback(() => {
    const video = videoRef.current;
    // Un pause() sur une vidéo qui n'a encore jamais démarré (rien n'a
    // encore appelé play(), donc déjà "paused" par défaut) annule le
    // chargement des métadonnées en cours (preload="metadata") : la vidéo
    // finissait alors bloquée en erreur avant même d'avoir pu démarrer.
    if (!video || video.paused) return;
    const pending = playPromiseRef.current;
    if (pending) pending.finally(() => video.pause());
    else video.pause();
    setSoundBlocked(false);
  }, []);

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
      pauseVideoSafely();
    }
  }, [isInView, videoSrc, playVideo, pauseVideoSafely, soundEnabled]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) {
        pauseVideoSafely();
        return;
      }
      if (isInView) playVideo(soundEnabled);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isInView, videoSrc, playVideo, pauseVideoSafely, soundEnabled]);

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
        {t("nav_videos_title")}
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
          poster={POSTER_URL}
          controls
          playsInline
          muted
          preload="metadata"
          aria-label="Sélection de looks GaspardNZ"
          onPlaying={() => setBlocked(false)}
          onError={() => setBlocked(true)}
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
        {blocked && (
          <button
            type="button"
            onClick={playByTap}
            aria-label={copy.play}
            style={{ position: "absolute", inset: 0, zIndex: 6, border: 0, cursor: "pointer", background: "rgba(10,6,2,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "1.5rem" }}
          >
            <span aria-hidden="true" style={{ width: 72, height: 72, borderRadius: "50%", border: `1.5px solid ${GOLD}`, background: "rgba(10,6,2,0.75)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill={GOLD}><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: GOLD }}>{copy.play}</span>
            {isIOS && (
              <span style={{ maxWidth: 260, fontFamily: "'Montserrat', sans-serif", fontSize: "11px", lineHeight: 1.6, color: "rgba(245,240,232,0.9)", textAlign: "center", background: "rgba(10,6,2,0.7)", padding: "0.6rem 0.85rem", borderRadius: 10 }}>{copy.lowPower}</span>
            )}
          </button>
        )}
        {isInView && !soundEnabled && !blocked && (
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
