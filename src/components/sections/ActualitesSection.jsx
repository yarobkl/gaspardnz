import { useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { getActualites } from "../../data/actualitesData.js";
import { LangCtx, useTr } from "../../context.jsx";

const MOBILE_QUERY = "(max-width: 640px)";
const MOBILE_SLIDE_VARIANTS = {
  enter: direction => ({ opacity: 0, x: direction > 0 ? 42 : -42 }),
  center: { opacity: 1, x: 0 },
  exit: direction => ({ opacity: 0, x: direction > 0 ? -42 : 42 }),
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  ));

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const update = event => setIsMobile(event.matches);
    setIsMobile(media.matches);

    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener(update);

    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener(update);
    };
  }, []);

  return isMobile;
};

const ActuCard = ({ item, isMobile = false }) => {
  const t = useTr();
  const [expanded, setExpanded] = useState(false);
  const [photoCur, setPhotoCur] = useState(0);
  const photos = item.photos || [];
  const hasVideo = Boolean(item.video);
  const preview = item.text.split("\n\n")[0];
  const multi = !hasVideo && photos.length > 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        background: "#111009",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(184,151,62,0.15)",
      }}
    >
      {(hasVideo || photos.length > 0) && (
        <div style={{ position: "relative", overflow: "hidden", background: "#050301", maxWidth: "100%" }}>
          {hasVideo ? (
            <video
              src={item.video}
              controls
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                aspectRatio: isMobile ? "4 / 5" : "9 / 16",
                maxHeight: isMobile ? "440px" : "560px",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
                background: "#050301",
              }}
            >
              <track kind="captions" src="/captions/jt-sape-fr.vtt" srcLang="fr" label="Français" default />
            </video>
          ) : multi ? (
            <div style={{ display: "flex", transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)", transform: `translateX(${-photoCur * 100}%)` }}>
              {photos.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={item.title}
                  width="1200"
                  height="900"
                  loading="lazy"
                  decoding="async"
                  style={{ flexShrink: 0, width: "100%", aspectRatio: "4/3", objectFit: "contain", objectPosition: "center", display: "block", background: "#0b0703", filter: "none" }}
                />
              ))}
            </div>
          ) : (
            <img
              src={photos[0]}
              alt={item.title}
              width="1200"
              height="900"
              loading="lazy"
              decoding="async"
              style={{ width: "100%", aspectRatio: "4/3", objectFit: "contain", objectPosition: "center", display: "block", background: "#0b0703", filter: "none" }}
            />
          )}

          <div style={{ position: "absolute", inset: 0, background: hasVideo ? "linear-gradient(to bottom, transparent 55%, rgba(17,16,9,0.9) 100%)" : "linear-gradient(to bottom, transparent 78%, rgba(17,16,9,0.38) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(184,151,62,0.15)", backdropFilter: "blur(6px)", border: "1px solid rgba(184,151,62,0.3)", borderRadius: "4px", padding: "4px 10px" }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase" }}>{item.tag}</span>
          </div>

          {multi && (
            <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoCur(i)}
                  aria-label={`Photo ${i + 1}`}
                  style={{ width: "44px", height: "44px", borderRadius: "50%", background: "transparent", border: "none", padding: 0, cursor: "pointer", transition: "width 0.35s", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <span style={{ width: i === photoCur ? 18 : 5, height: 2, borderRadius: 1, background: i === photoCur ? GOLD : "rgba(184,151,62,0.35)", display: "block" }} />
                </button>
              ))}
            </div>
          )}

          {multi && (
            <>
              <button
                onClick={() => setPhotoCur(c => Math.max(c - 1, 0))}
                style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: photoCur === 0 ? 0.3 : 1 }}
                aria-label={t("previous_photo")}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6.5 2L3.5 5l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button
                onClick={() => setPhotoCur(c => Math.min(c + 1, photos.length - 1))}
                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: photoCur === photos.length - 1 ? 0.3 : 1 }}
                aria-label={t("next_photo")}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5l-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </>
          )}

          <div style={{ position: "absolute", bottom: multi ? "28px" : "12px", right: "12px", textAlign: "right" }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.2em", color: "rgba(245,240,232,0.7)", margin: 0, textTransform: "uppercase" }}>{item.location} · {item.date}</p>
          </div>
        </div>
      )}

      <div style={{ padding: "1.4rem 1.2rem 1.6rem" }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.5rem,7vw,2rem)", letterSpacing: "0.06em", color: "#faf7f2", margin: "0 0 1rem", lineHeight: 1 }}>{item.title}</h3>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(0.95rem,4vw,1.1rem)", color: "rgba(245,240,232,0.72)", lineHeight: 1.75, fontStyle: "italic", whiteSpace: "pre-line" }}>
          {expanded ? item.text : preview}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setExpanded(e => !e)}
          style={{ marginTop: "1.1rem", background: "none", border: "none", padding: "0.7rem 0", minHeight: "44px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase" }}>
            {expanded ? t("reduce") : t("read_more")}
          </span>
          <motion.svg animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }} width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5l3 3 3-3" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </motion.button>
      </div>
    </motion.article>
  );
};

const ActualitesSection = () => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const actualites = getActualites(lang);
  const ref = useRef(null);
  const railRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);

  useEffect(() => {
    setActiveIndex(0);
    setSlideDirection(1);
  }, [lang, actualites.length]);

  const scrollNews = direction => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("[data-actu-card]");
    const step = card ? card.getBoundingClientRect().width + 18 : rail.clientWidth * 0.86;
    rail.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const changeMobileNews = direction => {
    if (!actualites.length) return;
    setSlideDirection(direction);
    setActiveIndex(index => (index + direction + actualites.length) % actualites.length);
  };

  const changeNews = direction => {
    if (isMobile) changeMobileNews(direction);
    else scrollNews(direction);
  };

  const selectMobileNews = index => {
    if (index === activeIndex) return;
    setSlideDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -45 || info.velocity.x < -500) changeMobileNews(1);
    else if (info.offset.x > 45 || info.velocity.x > 500) changeMobileNews(-1);
  };

  const activeItem = actualites[activeIndex] || actualites[0];

  return (
    <section ref={ref} style={{ background: "#0a0602", padding: "4.5rem 0 5rem", overflow: "hidden", width: "100%", maxWidth: "100%" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ padding: "0 1.4rem", marginBottom: "1.5rem" }}
      >
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.42em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>GASPARDNZ</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 }}>{t("actualites_title")}</p>
        <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginTop: "14px" }} />
      </motion.div>

      <div
        style={{
          padding: "0 1.4rem",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? "0.8rem" : "1rem",
          marginBottom: "1rem",
        }}
      >
        <p style={{ maxWidth: "32rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1rem,4vw,1.15rem)", lineHeight: 1.6, color: "rgba(245,240,232,0.68)", margin: 0, fontStyle: "italic" }}>
          {t("actualites_hint")}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "space-between" : "flex-end", gap: "0.8rem", width: isMobile ? "100%" : "auto" }}>
          {isMobile && (
            <span aria-live="polite" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.28em", color: "rgba(245,240,232,0.52)" }}>
              {String(activeIndex + 1).padStart(2, "0")} / {String(actualites.length).padStart(2, "0")}
            </span>
          )}
          <div style={{ display: "flex", gap: "0.55rem", flexShrink: 0 }}>
            <button
              onClick={() => changeNews(-1)}
              aria-label={t("previous_photo")}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(184,151,62,0.28)", background: "rgba(255,255,255,0.04)", color: GOLD, display: "grid", placeItems: "center", cursor: "pointer" }}
            >
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              onClick={() => changeNews(1)}
              aria-label={t("next_photo")}
              style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(184,151,62,0.28)", background: "rgba(255,255,255,0.04)", color: GOLD, display: "grid", placeItems: "center", cursor: "pointer" }}
            >
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      {isMobile ? (
        <div style={{ padding: "0 1.4rem 0.35rem", width: "100%", maxWidth: "100%", overflow: "hidden" }}>
          {activeItem && (
            <AnimatePresence initial={false} custom={slideDirection} mode="wait">
              <motion.div
                key={`${lang}-${activeItem.id}`}
                custom={slideDirection}
                variants={MOBILE_SLIDE_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ width: "100%", maxWidth: "100%", minWidth: 0, touchAction: "pan-y", willChange: "transform" }}
              >
                <ActuCard item={activeItem} isMobile />
              </motion.div>
            </AnimatePresence>
          )}

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "0.75rem" }}>
            {actualites.map((item, index) => (
              <button
                key={item.id}
                onClick={() => selectMobileNews(index)}
                aria-label={item.title}
                aria-current={index === activeIndex ? "true" : undefined}
                style={{ width: 44, height: 44, border: 0, background: "transparent", padding: 0, display: "grid", placeItems: "center", cursor: "pointer" }}
              >
                <span style={{ display: "block", width: index === activeIndex ? 22 : 6, height: 2, borderRadius: 2, background: index === activeIndex ? GOLD : "rgba(184,151,62,0.28)", transition: "width 0.3s ease, background 0.3s ease" }} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={railRef}
          style={{
            padding: "0 1.4rem 0.35rem",
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(282px, 420px)",
            gap: "1.1rem",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollPadding: "1.4rem",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
            scrollbarColor: `${GOLD} rgba(255,255,255,0.08)`,
          }}
        >
          {actualites.map(item => (
            <div key={item.id} data-actu-card style={{ scrollSnapAlign: "start", minWidth: 0 }}>
              <ActuCard item={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ActualitesSection;
