import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { getActualites } from "../../data/actualitesData.js";
import { usePublicCollection } from "../../hooks/usePublicCollection.js";
import { LangCtx, useTr } from "../../context.jsx";

const MOBILE_QUERY = "(max-width: 640px)";
const MOBILE_SLIDE_VARIANTS = {
  enter: direction => ({ opacity: 0, x: direction > 0 ? 42 : -42 }),
  center: { opacity: 1, x: 0 },
  exit: direction => ({ opacity: 0, x: direction > 0 ? -42 : 42 }),
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = event => setIsMobile(event.matches);
    setIsMobile(media.matches);
    if (media.addEventListener) media.addEventListener("change", update); else media.addListener(update);
    return () => { if (media.removeEventListener) media.removeEventListener("change", update); else media.removeListener(update); };
  }, []);
  return isMobile;
};

const remoteToNews = (row) => ({
  id: row.id,
  title: row.title,
  text: row.body || row.excerpt || "",
  location: row.metadata?.location || "Paris",
  date: row.metadata?.date_label || (row.published_at ? new Date(row.published_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : ""),
  tag: row.metadata?.tag || "Actualité",
  video: row.metadata?.video_url || null,
  photos: Array.isArray(row.gallery) && row.gallery.length ? row.gallery : row.cover_url ? [row.cover_url] : [],
});

// Un seul format pour toutes les cartes, photo ou vidéo : sinon la hauteur
// change selon le contenu et le carrousel devient irrégulier.
const MEDIA_ASPECT = "4 / 5";
const MEDIA_MAX_HEIGHT = { mobile: "480px", desktop: "600px" };

const ActuCard = ({ item, isMobile = false }) => {
  const t = useTr();
  const [expanded, setExpanded] = useState(false);
  const [photoCur, setPhotoCur] = useState(0);
  const videoRef = useRef(null);
  const photos = item.photos || [];
  const hasVideo = Boolean(item.video);
  const preview = String(item.text || "").split("\n\n")[0];
  const hasMoreText = String(item.text || "").length > preview.length;
  const multi = !hasVideo && photos.length > 1;
  // La vidéo est cadrée pour ce format (cover, sans perte visible) mais une
  // photo de groupe grand angle recadrée en "cover" coupait la moitié des
  // personnes présentes. "contain" garde l'image entière visible, quitte à
  // laisser une marge de part et d'autre — même format de carte, rien de
  // coupé.
  const mediaStyle = { width: "100%", aspectRatio: MEDIA_ASPECT, maxHeight: isMobile ? MEDIA_MAX_HEIGHT.mobile : MEDIA_MAX_HEIGHT.desktop, objectFit: "contain", objectPosition: "center", display: "block", background: "#0b0703" };

  const handleCta = () => {
    setExpanded((e) => !e);
    if (hasVideo && videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      videoRef.current.play?.()?.catch(() => {});
    }
  };

  return (
    <motion.article initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8% 0px" }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ width: "100%", maxWidth: "100%", minWidth: 0, background: "#111009", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(184,151,62,0.15)" }}>
      {(hasVideo || photos.length > 0) && (
        <div style={{ position: "relative", overflow: "hidden", background: "#050301", maxWidth: "100%" }}>
          {hasVideo ? (
            <video ref={videoRef} src={item.video} controls playsInline preload="metadata" aria-label={`Vidéo : ${item.title}`} style={{ ...mediaStyle, objectFit: "cover", background: "#050301" }}>
              <track kind="captions" src="/captions/jt-sape-fr.vtt" srcLang="fr" label="Français" default />
            </video>
          ) : multi ? (
            <div style={{ display: "flex", transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)", transform: `translateX(${-photoCur * 100}%)` }}>
              {photos.map((src, i) => <img key={i} src={src} alt={item.title} width="1200" height="900" loading="lazy" decoding="async" style={{ ...mediaStyle, flexShrink: 0 }} />)}
            </div>
          ) : (
            <img src={photos[0]} alt={item.title} width="1200" height="900" loading="lazy" decoding="async" style={mediaStyle} />
          )}
          <div style={{ position: "absolute", inset: 0, background: hasVideo ? "linear-gradient(to bottom, transparent 55%, rgba(17,16,9,0.9) 100%)" : "linear-gradient(to bottom, transparent 78%, rgba(17,16,9,0.38) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(184,151,62,0.15)", backdropFilter: "blur(6px)", border: "1px solid rgba(184,151,62,0.3)", borderRadius: "4px", padding: "4px 10px" }}><span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase" }}>{item.tag}</span></div>
          {multi && <>
            <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>{photos.map((_, i) => <button key={i} onClick={() => setPhotoCur(i)} aria-label={`Photo ${i + 1}`} style={{ width: "44px", height: "44px", borderRadius: "50%", background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: i === photoCur ? 18 : 5, height: 2, borderRadius: 1, background: i === photoCur ? GOLD : "rgba(184,151,62,0.35)", display: "block" }} /></button>)}</div>
            <button onClick={() => setPhotoCur(c => Math.max(c - 1, 0))} aria-label={t("previous_photo")} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.35)", color: "white", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", opacity: photoCur === 0 ? 0.3 : 1 }}>‹</button>
            <button onClick={() => setPhotoCur(c => Math.min(c + 1, photos.length - 1))} aria-label={t("next_photo")} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.35)", color: "white", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", opacity: photoCur === photos.length - 1 ? 0.3 : 1 }}>›</button>
          </>}
          <div style={{ position: "absolute", bottom: hasVideo ? "58px" : multi ? "28px" : "12px", right: "12px", textAlign: "right", pointerEvents: "none" }}><p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.2em", color: "rgba(245,240,232,0.7)", margin: 0, textTransform: "uppercase" }}>{item.location} · {item.date}</p></div>
        </div>
      )}
      <div style={{ padding: "1.4rem 1.2rem 1.6rem" }}>
        {/* Un article sans photo ni vidéo n'a pas le bandeau qui porte
            normalement la date : sans ce repli, il n'affichait aucune date
            du tout, contrairement à tous les autres. */}
        {!hasVideo && photos.length === 0 && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", margin: "0 0 0.8rem" }}>{item.tag} · {item.location} · {item.date}</p>}
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.5rem,7vw,2rem)", letterSpacing: "0.06em", color: "#faf7f2", margin: "0 0 1rem", lineHeight: 1 }}>{item.title}</h3>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(0.95rem,4vw,1.1rem)", color: "rgba(245,240,232,0.72)", lineHeight: 1.75, fontStyle: "italic", whiteSpace: "pre-line" }}>{expanded ? item.text : preview}</div>
        {(hasVideo || hasMoreText) && <motion.button whileTap={{ scale: 0.97 }} onClick={handleCta} style={{ marginTop: "1.1rem", background: "none", border: "none", padding: "0.7rem 0", minHeight: "44px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase" }}>{expanded ? t("reduce") : hasVideo ? t("watch_full_video") : t("open_article")}</span><motion.span animate={{ rotate: expanded ? 180 : 0 }}>⌄</motion.span></motion.button>}
      </div>
    </motion.article>
  );
};

const ActualitesSection = () => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const fallback = useMemo(() => getActualites(lang), [lang]);
  const { rows, source } = usePublicCollection("news_posts", { fallback, filters: [{ type: "eq", column: "locale", value: lang }], orderBy: "published_at", ascending: false });
  const actualites = useMemo(() => source === "supabase" ? rows.map(remoteToNews) : rows, [rows, source]);
  const ref = useRef(null);
  const railRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);

  useEffect(() => { setActiveIndex(0); setSlideDirection(1); }, [lang, actualites.length]);
  const scrollNews = direction => { const rail = railRef.current; if (!rail) return; const card = rail.querySelector("[data-actu-card]"); const step = card ? card.getBoundingClientRect().width + 18 : rail.clientWidth * 0.86; rail.scrollBy({ left: direction * step, behavior: "smooth" }); };
  const changeMobileNews = direction => { if (!actualites.length) return; setSlideDirection(direction); setActiveIndex(index => (index + direction + actualites.length) % actualites.length); };
  const changeNews = direction => isMobile ? changeMobileNews(direction) : scrollNews(direction);
  const selectMobileNews = index => { if (index === activeIndex) return; setSlideDirection(index > activeIndex ? 1 : -1); setActiveIndex(index); };
  const handleDragEnd = (_, info) => { if (info.offset.x < -45 || info.velocity.x < -500) changeMobileNews(1); else if (info.offset.x > 45 || info.velocity.x > 500) changeMobileNews(-1); };
  const activeItem = actualites[activeIndex] || actualites[0];

  return (
    <section ref={ref} style={{ background: "#0a0602", padding: "4.5rem 0 5rem", overflow: "hidden", width: "100%", maxWidth: "100%" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ padding: "0 1.4rem", marginBottom: "1.5rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.42em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>GASPARDNZ</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 }}>{t("actualites_title")}</p>
        <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginTop: "14px" }} />
      </motion.div>
      <div style={{ padding: "0 1.4rem", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: isMobile ? "0.8rem" : "1rem", marginBottom: "1rem" }}>
        <p style={{ maxWidth: "32rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1rem,4vw,1.15rem)", lineHeight: 1.6, color: "rgba(245,240,232,0.68)", margin: 0, fontStyle: "italic" }}>{t("actualites_hint")}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "space-between" : "flex-end", gap: "0.8rem", width: isMobile ? "100%" : "auto" }}>
          {isMobile && <span aria-live="polite" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.28em", color: "rgba(245,240,232,0.52)" }}>{String(activeIndex + 1).padStart(2, "0")} / {String(actualites.length).padStart(2, "0")}</span>}
          <div style={{ display: "flex", gap: "0.55rem" }}><button onClick={() => changeNews(-1)} aria-label={t("previous_photo")} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(184,151,62,0.28)", background: "rgba(255,255,255,0.04)", color: GOLD, cursor: "pointer" }}>‹</button><button onClick={() => changeNews(1)} aria-label={t("next_photo")} style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(184,151,62,0.28)", background: "rgba(255,255,255,0.04)", color: GOLD, cursor: "pointer" }}>›</button></div>
        </div>
      </div>
      {isMobile ? (
        <div style={{ padding: "0 1.4rem 0.35rem", width: "100%", overflow: "hidden" }}>
          {activeItem && <AnimatePresence initial={false} custom={slideDirection} mode="wait"><motion.div key={`${lang}-${activeItem.id}`} custom={slideDirection} variants={MOBILE_SLIDE_VARIANTS} initial="enter" animate="center" exit="exit" transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1} onDragEnd={handleDragEnd} style={{ width: "100%", touchAction: "pan-y" }}><ActuCard item={activeItem} isMobile /></motion.div></AnimatePresence>}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "0.75rem" }}>{actualites.map((item, index) => <button key={item.id} onClick={() => selectMobileNews(index)} aria-label={item.title} style={{ width: 44, height: 44, border: 0, background: "transparent", display: "grid", placeItems: "center", cursor: "pointer" }}><span style={{ width: index === activeIndex ? 22 : 6, height: 2, borderRadius: 2, background: index === activeIndex ? GOLD : "rgba(184,151,62,0.28)" }} /></button>)}</div>
        </div>
      ) : (
        <div ref={railRef} style={{ padding: "0 1.4rem 0.35rem", display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(282px, 420px)", gap: "1.1rem", overflowX: "auto", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>{actualites.map(item => <div key={item.id} data-actu-card style={{ scrollSnapAlign: "start", minWidth: 0 }}><ActuCard item={item} /></div>)}</div>
      )}
    </section>
  );
};

export default ActualitesSection;
