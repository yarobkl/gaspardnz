import { useContext, useMemo, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { GOLD } from "../../constants.js";
import { getStyleDuMois, WA_GNZ } from "../../data/styleDuMoisData.js";
import { usePublicCollection } from "../../hooks/usePublicCollection.js";
import { LangCtx, useTr } from "../../context.jsx";

const mapRemoteStyle = (row, lang) => {
  const translated = row.metadata?.translations?.[lang] || {};
  return {
    id: row.id,
    src: row.cover_url,
    album: Array.isArray(row.album) && row.album.length ? row.album : row.cover_url ? [row.cover_url] : [],
    title: translated.title || row.title,
    desc: translated.description || row.description,
    spots: translated.hotspots || row.hotspots || [],
  };
};

const StyleDuMoisSection = ({ refEl }) => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const fallback = useMemo(() => getStyleDuMois(lang), [lang]);
  const today = new Date().toISOString().slice(0, 10);
  const { rows, source } = usePublicCollection("style_month", {
    fallback,
    orderBy: "starts_at",
    ascending: false,
    filters: [{ type: "lte", column: "starts_at", value: today }],
  });
  const STYLE_DU_MOIS = useMemo(() => {
    if (source !== "supabase") return rows;
    return rows.filter(row => !row.ends_at || row.ends_at >= today).map(row => mapRemoteStyle(row, lang));
  }, [rows, source, lang, today]);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const [activeSpot, setActiveSpot] = useState(null);
  const [activePhotos, setActivePhotos] = useState({});

  if (!STYLE_DU_MOIS?.length) return null;

  return (
    <section ref={node => { ref.current = node; if (refEl) refEl.current = node; }} style={{ background: "#0a0602", padding: "4.5rem 0 5rem" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }} style={{ padding: "0 1.4rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.42em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>GASPARDNZ</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 }}>{t("style_month")}</p>
        <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginTop: "14px" }} />
      </motion.div>

      <div style={{ padding: "0 1.4rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        {STYLE_DU_MOIS.map((item, i) => (
          <motion.div key={item.id || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-6% 0px" }} transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }} style={{ background: "linear-gradient(180deg,#141006,#080503)", borderRadius: "18px", overflow: "hidden", border: "1px solid rgba(184,151,62,0.22)", boxShadow: "0 26px 80px rgba(0,0,0,0.34)" }}>
            {item.src && (() => {
              const album = item.album?.length ? item.album : [item.src];
              const activeIndex = activePhotos[i] || 0;
              const activeSrc = album[activeIndex] || item.src;
              return <>
                <div style={{ position: "relative", width: "100%", aspectRatio: "9/16", background: "#080503" }} onClick={() => setActiveSpot(null)}>
                  <img src={activeSrc} alt={item.title || "Style du mois"} width="900" height="1600" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 58%, rgba(7,4,0,0.72) 100%)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", left: "1rem", bottom: "1rem", zIndex: 2, display: "inline-flex", alignItems: "center", gap: "8px", padding: "0.45rem 0.7rem", background: "rgba(7,4,0,0.58)", border: "1px solid rgba(184,151,62,0.35)", borderRadius: "999px", backdropFilter: "blur(8px)" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD }} />
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.22em", color: "#f5f0e8", textTransform: "uppercase" }}>{t("album_counter", activeIndex + 1, album.length)}</span>
                  </div>
                  {(item.spots || []).map((spot, si) => (
                    <div key={si} style={{ position: "absolute", left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%,-50%)", zIndex: 2 }}>
                      <button aria-label={spot.label} onClick={e => { e.stopPropagation(); setActiveSpot(activeSpot === `${i}-${si}` ? null : `${i}-${si}`); }} style={{ width: "44px", height: "44px", borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}><span style={{ width: "14px", height: "14px", borderRadius: "50%", background: "rgba(184,151,62,0.18)", border: `1px solid rgba(184,151,62,0.9)`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: "4px", height: "4px", borderRadius: "50%", background: GOLD }} /></span></button>
                      <AnimatePresence>{activeSpot === `${i}-${si}` && <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} onClick={e => e.stopPropagation()} style={{ position: "absolute", left: spot.x > 55 ? "auto" : "26px", right: spot.x > 55 ? "26px" : "auto", top: spot.y > 60 ? "auto" : "26px", bottom: spot.y > 60 ? "26px" : "auto", width: "150px", background: "rgba(10,8,4,0.95)", border: `1px solid rgba(184,151,62,0.35)`, borderRadius: "8px", padding: "8px 10px", zIndex: 10 }}><p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7.5px", letterSpacing: "0.1em", color: GOLD, textTransform: "uppercase", marginBottom: "6px" }}>{spot.label}</p><button onClick={() => { const messages = { FR: `Bonjour Gaspard, je suis intéressé(e) par : ${spot.label}`, EN: `Hello Gaspard, I am interested in: ${spot.label}`, ES: `Hola Gaspard, me interesa: ${spot.label}`, ZH: `你好 Gaspard，我对这件单品感兴趣：${spot.label}` }; window.open(`${WA_GNZ}?text=${encodeURIComponent(messages[lang] || messages.FR)}`, "_blank"); }} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", background: "rgba(184,151,62,0.1)", border: `1px solid rgba(184,151,62,0.3)`, borderRadius: "20px", padding: "9px 8px", minHeight: "44px", cursor: "pointer", width: "100%" }}>{t("ask_availability")}</button></motion.div>}</AnimatePresence>
                    </div>
                  ))}
                </div>
                {album.length > 1 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${album.length}, 1fr)`, gap: "8px", padding: "10px 10px 0" }}>{album.map((src, ai) => <button key={`${src}-${ai}`} aria-label={t("view_photo_label", item.title || t("style_month"), ai + 1)} onClick={() => { setActivePhotos(current => ({ ...current, [i]: ai })); setActiveSpot(null); }} style={{ border: ai === activeIndex ? `1px solid ${GOLD}` : "1px solid rgba(184,151,62,0.18)", background: "none", padding: 0, borderRadius: "10px", overflow: "hidden", aspectRatio: "1/1", cursor: "pointer", opacity: ai === activeIndex ? 1 : 0.58 }}><img src={src} alt={`${item.title || "Style du mois"} ${ai + 1}`} width="320" height="320" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} /></button>)}</div>}
              </>;
            })()}
            <div style={{ padding: "1.2rem" }}>{item.title && <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.06em", color: "#faf7f2", margin: "0 0 0.6rem" }}>{item.title}</h3>}{item.desc && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,232,0.6)", lineHeight: 1.65 }}>{item.desc}</p>}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StyleDuMoisSection;
