import { useContext, useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { GOLD } from "../../constants.js";
import { getWeddingInspirations, WA_GNZ } from "../../data/weddingInspirationData.js";
import { getSettings } from "../../services/settingsService.js";
import { LangCtx, useTr } from "../../context.jsx";

const WeddingInspirationSection = ({ refEl }) => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const [inspirations, setInspirations] = useState([]);

  useEffect(() => {
    const settings = getSettings();
    const usableAdminInspirations = (settings.weddingInspirations || []).filter((item) => {
      if (!item?.src) return true;
      return !item.src.includes("images.unsplash.com/photo-1591195853828");
    });
    if (usableAdminInspirations.length > 0) {
      setInspirations(usableAdminInspirations);
    } else {
      setInspirations(getWeddingInspirations(lang));
    }
  }, [lang]);

  const INSPIRATIONS = inspirations;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const [activeSpot, setActiveSpot] = useState(null);
  const [activePhotos, setActivePhotos] = useState({});

  if (!INSPIRATIONS || INSPIRATIONS.length === 0) return null;

  return (
    <section ref={node => { ref.current = node; if (refEl) refEl.current = node; }} style={{ background: "#0a0602", padding: "4.5rem 0 5rem" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ padding: "0 1.4rem", marginBottom: "2rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.42em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>GASPARDNZ</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, margin: 0 }}>{t("wedding_inspiration")}</p>
        <div style={{ width: "48px", height: "1px", background: `linear-gradient(90deg, ${GOLD}, transparent)`, marginTop: "14px" }} />
      </motion.div>

      <div style={{ padding: "0 1.4rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        {INSPIRATIONS.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-6% 0px" }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ background: "#111009", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(184,151,62,0.15)" }}>
            {(() => {
              const album = item.album?.length ? item.album : item.src ? [{ src: item.src, spots: item.spots || [] }] : [];
              const activeIndex = activePhotos[i] || 0;
              const activePhoto = album[activeIndex] || album[0] || null;
              const activeSrc = activePhoto?.src || item.src;
              const activeSpots = activePhoto?.spots || item.spots || [];

              return (
              <>
              <div style={{ position: "relative", width: "100%", aspectRatio: "9/16", background: "linear-gradient(135deg, rgba(184,151,62,0.14), rgba(250,247,242,0.04))" }}
                onClick={() => setActiveSpot(null)}>
              {activeSrc ? (
                <img src={activeSrc} alt={item.title || "Look mariage"}
                  width="900" height="1600"
                  loading="lazy" decoding="async"
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", marginBottom: "0.9rem" }}>GASPARDNZ</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontStyle: "italic", color: "#faf7f2", lineHeight: 1.25, margin: 0 }}>{t("coming_photo_soon")}</p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.18em", color: "rgba(245,240,232,0.75)", textTransform: "uppercase", marginTop: "1rem" }}>{t("look_preparing")}</p>
                </div>
              )}
              {activeSrc && (
                <>
                {(activeSpots || []).map((spot, si) => (
                  <div key={si} style={{ position: "absolute", left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%,-50%)", zIndex: 2 }}>
                    <button
                      aria-label={spot.label}
                      onClick={e => { e.stopPropagation(); setActiveSpot(activeSpot === `${i}-${si}` ? null : `${i}-${si}`); }}
                      style={{ width: "44px", height: "44px", borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(184,151,62,0.2)", border: `1px solid ${GOLD}`, backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: GOLD }} />
                      </span>
                    </button>
                    <AnimatePresence>
                      {activeSpot === `${i}-${si}` && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                          transition={{ duration: 0.15 }}
                          onClick={e => e.stopPropagation()}
                          style={{ position: "absolute", left: spot.x > 55 ? "auto" : "26px", right: spot.x > 55 ? "26px" : "auto", top: spot.y > 60 ? "auto" : "26px", bottom: spot.y > 60 ? "26px" : "auto", width: "150px", background: "rgba(10,8,4,0.95)", border: `1px solid rgba(184,151,62,0.35)`, borderRadius: "8px", padding: "8px 10px", zIndex: 10 }}>
                          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7.5px", letterSpacing: "0.1em", color: GOLD, textTransform: "uppercase", marginBottom: "6px", lineHeight: 1.3 }}>{spot.label}</p>
                          <button
                            onClick={() => {
                              const messages = {
                                FR: `Bonjour Gaspard, je suis intéressé(e) par ce look mariage : ${spot.label}`,
                                EN: `Hello Gaspard, I'm interested in this wedding look: ${spot.label}`,
                                ES: `Hola Gaspard, me interesa este look de boda: ${spot.label}`,
                                ZH: `你好 Gaspard，我对这个婚礼造型感兴趣：${spot.label}`,
                              };
                              window.open(`${WA_GNZ}?text=${encodeURIComponent(messages[lang] || messages.FR)}`, "_blank");
                            }}
                            style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.18em", color: GOLD, textTransform: "uppercase", background: "rgba(184,151,62,0.1)", border: `1px solid rgba(184,151,62,0.3)`, borderRadius: "20px", padding: "9px 8px", minHeight: "44px", cursor: "pointer", width: "100%" }}>
                            {t("ask_availability")}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                </>
              )}
              </div>
              {album.length > 1 && (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${album.length}, 1fr)`, gap: "8px", padding: "10px 10px 0" }}>
                  {album.map((photo, ai) => (
                    <button key={`${photo.src}-${ai}`} aria-label={t("view_photo_label", item.title || t("wedding_inspiration"), ai + 1)} onClick={() => { setActivePhotos(current => ({ ...current, [i]: ai })); setActiveSpot(null); }}
                      style={{ border: ai === activeIndex ? `1px solid ${GOLD}` : "1px solid rgba(184,151,62,0.18)", background: "none", padding: 0, borderRadius: "10px", overflow: "hidden", aspectRatio: "1/1", cursor: "pointer", opacity: ai === activeIndex ? 1 : 0.58 }}>
                      <img src={photo.src} alt={`${item.title || "Look mariage"} ${ai + 1}`} width="320" height="320" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
                    </button>
                  ))}
                </div>
              )}
              </>
              );
            })()}
            <div style={{ padding: "1.2rem" }}>
              {item.title && <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.06em", color: "#faf7f2", margin: "0 0 0.6rem" }}>{item.title}</h3>}
              {item.desc && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: "rgba(245,240,232,0.6)", lineHeight: 1.65 }}>{item.desc}</p>}
              {(item.color || item.style || item.occasion) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px", fontSize: "11px", color: "rgba(184,151,62,0.7)" }}>
                  {item.color && <span><strong style={{ color: GOLD }}>{t("color_label")}:</strong> {item.color}</span>}
                  {item.style && <span><strong style={{ color: GOLD }}>{t("style_label")}:</strong> {item.style}</span>}
                  {item.occasion && <span><strong style={{ color: GOLD }}>{t("occasion_label")}:</strong> {item.occasion}</span>}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WeddingInspirationSection;
