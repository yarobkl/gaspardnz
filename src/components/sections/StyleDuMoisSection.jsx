import { useContext, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD } from "../../constants.js";
import { getStyleDuMois, WA_GNZ } from "../../data/styleDuMoisData.js";
import { usePublicCollection } from "../../hooks/usePublicCollection.js";
import { LangCtx, useTr } from "../../context.jsx";
import { HotspotSheet, PhotoHotspots } from "../ui/PhotoHotspots.jsx";

const albumSrc = (entry) => typeof entry === "string" ? entry : (entry?.src || entry?.url || entry?.public_url || "");

const mapRemoteStyle = (row, lang, fallbackItem) => {
  const translated = row.metadata?.translations?.[lang] || {};
  return {
    id: row.id,
    src: row.cover_url,
    album: Array.isArray(row.album) && row.album.length ? row.album : row.cover_url ? [row.cover_url] : [],
    title: translated.title || row.title,
    desc: translated.description || row.description,
    spots: translated.hotspots || row.hotspots || fallbackItem?.spots || [],
    photoSpots: translated.photo_hotspots || row.metadata?.photo_hotspots || fallbackItem?.photoSpots || [],
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
    return rows
      .filter(row => !row.ends_at || row.ends_at >= today)
      .map((row, index) => mapRemoteStyle(row, lang, fallback[index] || fallback[0]));
  }, [rows, source, lang, today, fallback]);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const [activeSpot, setActiveSpot] = useState(null);
  const [activePhotos, setActivePhotos] = useState({});

  if (!STYLE_DU_MOIS?.length) return null;

  const askSelected = () => {
    const spot = activeSpot?.spot;
    if (!spot) return;
    const messages = {
      FR: `Bonjour Gaspard, je suis intéressé(e) par : ${spot.label}`,
      EN: `Hello Gaspard, I am interested in: ${spot.label}`,
      ES: `Hola Gaspard, me interesa: ${spot.label}`,
      ZH: `你好 Gaspard，我对这件单品感兴趣：${spot.label}`,
    };
    window.open(`${WA_GNZ}?text=${encodeURIComponent(messages[lang] || messages.FR)}`, "_blank", "noopener,noreferrer");
  };

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
              const activeEntry = album[activeIndex] || album[0];
              const activeSrc = albumSrc(activeEntry) || item.src;
              const activeSpots = Array.isArray(activeEntry?.spots) && activeEntry.spots.length
                ? activeEntry.spots
                : Array.isArray(item.photoSpots?.[activeIndex]) && item.photoSpots[activeIndex].length
                  ? item.photoSpots[activeIndex]
                  : (item.spots || []);
              const activeIndexForPhoto = activeSpot?.itemIndex === i && activeSpot?.photoIndex === activeIndex ? activeSpot.spotIndex : -1;

              return <>
                <div style={{ position: "relative", width: "100%", aspectRatio: "9/16", background: "#080503" }} onClick={() => setActiveSpot(null)}>
                  <img src={activeSrc} alt={item.title || "Style du mois"} width="900" height="1600" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
                  <PhotoHotspots
                    spots={activeSpots}
                    activeIndex={activeIndexForPhoto}
                    onSelect={(spotIndex, spot) => setActiveSpot((current) => {
                      const same = current?.itemIndex === i && current?.photoIndex === activeIndex && current?.spotIndex === spotIndex;
                      return same ? null : { itemIndex: i, photoIndex: activeIndex, spotIndex, spot };
                    })}
                  />
                </div>
                <div style={{ minHeight: 38, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0 12px", borderTop: "1px solid rgba(184,151,62,.12)" }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.2em", color: "rgba(245,240,232,.62)", textTransform: "uppercase" }}>{t("album_counter", activeIndex + 1, album.length)}</span>
                  {activeSpots.length > 0 && <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase" }}>{t("shop_the_look")}</span>}
                </div>
                {album.length > 1 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${album.length}, 1fr)`, gap: "8px", padding: "10px 10px 0" }}>{album.map((entry, ai) => { const src = albumSrc(entry); return <button key={`${src}-${ai}`} aria-label={t("view_photo_label", item.title || t("style_month"), ai + 1)} onClick={() => { setActivePhotos(current => ({ ...current, [i]: ai })); setActiveSpot(null); }} style={{ border: ai === activeIndex ? `1px solid ${GOLD}` : "1px solid rgba(184,151,62,0.18)", background: "none", padding: 0, borderRadius: "10px", overflow: "hidden", aspectRatio: "1/1", cursor: "pointer", opacity: ai === activeIndex ? 1 : 0.58 }}><img src={src} alt={`${item.title || "Style du mois"} ${ai + 1}`} width="320" height="320" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} /></button>; })}</div>}
              </>;
            })()}
            <div style={{ padding: "1.2rem" }}>{item.title && <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.06em", color: "#faf7f2", margin: "0 0 0.6rem" }}>{item.title}</h3>}{item.desc && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,232,0.6)", lineHeight: 1.65 }}>{item.desc}</p>}</div>
          </motion.div>
        ))}
      </div>

      <HotspotSheet
        spot={activeSpot?.spot || null}
        onClose={() => setActiveSpot(null)}
        eyebrow={t("shop_the_look")}
        actionLabel={t("ask_availability")}
        onAction={askSelected}
      />
    </section>
  );
};

export default StyleDuMoisSection;
