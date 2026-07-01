import { useContext, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { getActualites } from "../../data/actualitesData.js";
import { LangCtx, useTr } from "../../context.jsx";

const ActuCard = ({ item }) => {
  const t = useTr();
  const [expanded, setExpanded] = useState(false);
  const [photoCur, setPhotoCur] = useState(0);
  const photos = item.photos || [];
  const hasVideo = Boolean(item.video);
  const preview = item.text.split("\n\n")[0];
  const multi = !hasVideo && photos.length > 1;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: "#111009", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(184,151,62,0.15)" }}>
      {(hasVideo || photos.length > 0) && (
        <div style={{ position: "relative", overflow: "hidden", background: "#050301" }}>
          {hasVideo ? (
            <video
              src={item.video}
              controls
              playsInline
              preload="metadata"
              style={{ width: "100%", aspectRatio: "9/16", maxHeight: "560px", objectFit: "cover", objectPosition: "center", display: "block", background: "#050301" }}
            >
              <track kind="captions" src="/captions/jt-sape-fr.vtt" srcLang="fr" label="Français" default />
            </video>
          ) : multi ? (
            <div style={{ display: "flex", transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)", transform: `translateX(${-photoCur * 100}%)` }}>
              {photos.map((src, i) => (
                <img key={i} src={src} alt={item.title} width="1200" height="900" loading="lazy" decoding="async" style={{ flexShrink: 0, width: "100%", aspectRatio: "4/3", objectFit: "cover", objectPosition: "center top", display: "block" }} />
              ))}
            </div>
          ) : (
            <img src={photos[0]} alt={item.title} width="1200" height="900" loading="lazy" decoding="async" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", objectPosition: "center top", display: "block" }} />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, rgba(17,16,9,0.9) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(184,151,62,0.15)", backdropFilter: "blur(6px)", border: "1px solid rgba(184,151,62,0.3)", borderRadius: "4px", padding: "4px 10px" }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase" }}>{item.tag}</span>
          </div>
          {multi && (
            <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "5px" }}>
              {photos.map((_, i) => (
                <button key={i} onClick={() => setPhotoCur(i)} aria-label={`Photo ${i + 1}`}
                  style={{ width: "44px", height: "44px", borderRadius: "50%", background: "transparent", border: "none", padding: 0, cursor: "pointer", transition: "width 0.35s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: i === photoCur ? 18 : 5, height: 2, borderRadius: 1, background: i === photoCur ? GOLD : "rgba(184,151,62,0.35)", display: "block" }} />
                </button>
              ))}
            </div>
          )}
          {multi && (
            <>
              <button onClick={() => setPhotoCur(c => Math.max(c-1,0))} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: photoCur === 0 ? 0.3 : 1 }} aria-label={t("previous_photo")}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6.5 2L3.5 5l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={() => setPhotoCur(c => Math.min(c+1,photos.length-1))} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: photoCur === photos.length-1 ? 0.3 : 1 }} aria-label={t("next_photo")}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5l-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setExpanded(e => !e)}
          style={{ marginTop: "1.1rem", background: "none", border: "none", padding: "0.7rem 0", minHeight: "44px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase" }}>
            {expanded ? t("reduce") : t("read_more")}
          </span>
          <motion.svg animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }} width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5l3 3 3-3" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

  const scrollNews = (direction) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("[data-actu-card]");
    const step = card ? card.getBoundingClientRect().width + 18 : rail.clientWidth * 0.86;
    rail.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section ref={ref} style={{ background: "#0a0602", padding: "4.5rem 0 5rem", overflow: "hidden" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
        style={{ padding: "0 1.4rem", marginBottom: "1.5rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.42em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>GASPARDNZ</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 }}>{t("actualites_title")}</p>
        <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginTop: "14px" }} />
      </motion.div>
      <div style={{ padding: "0 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <p style={{ maxWidth: "32rem", fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1rem,4vw,1.15rem)", lineHeight: 1.6, color: "rgba(245,240,232,0.68)", margin: 0, fontStyle: "italic" }}>
          {t("actualites_hint")}
        </p>
        <div style={{ display: "flex", gap: "0.55rem", flexShrink: 0 }}>
          <button onClick={() => scrollNews(-1)} aria-label={t("previous_photo")}
            style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(184,151,62,0.28)", background: "rgba(255,255,255,0.04)", color: GOLD, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={() => scrollNews(1)} aria-label={t("next_photo")}
            style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(184,151,62,0.28)", background: "rgba(255,255,255,0.04)", color: GOLD, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <svg width="12" height="12" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
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
          <div key={item.id} data-actu-card style={{ scrollSnapAlign: "start" }}>
            <ActuCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ActualitesSection;
