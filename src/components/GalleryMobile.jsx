import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, TEXT } from "../constants.js";
import { useTr } from "../context.jsx";
import { STL_SPOTS, WA_STL } from "../data/galleryData.js";

const GalleryMobile = ({ refEl }) => {
  const t = useTr();
  const baseItems = [
    { src: `${import.meta.env.BASE_URL}images/costume-creme.jpg`, label: t("gal_1") },
    { src: `${import.meta.env.BASE_URL}images/elegance-blanche.jpg`, label: t("gal_2") },
    { src: `${import.meta.env.BASE_URL}images/veste-rayee.jpg`, label: t("gal_3") },
    { src: `${import.meta.env.BASE_URL}images/veste-orange.jpg`, label: t("gal_4") },
    { src: `${import.meta.env.BASE_URL}images/costume-carreaux.jpg`, label: t("gal_5") },
    { src: `${import.meta.env.BASE_URL}images/veste-bleue.jpg`, label: t("gal_6") },
    { src: `${import.meta.env.BASE_URL}images/style-parisien.jpg`, label: t("gal_7") },
    { src: `${import.meta.env.BASE_URL}images/chemise-lavande.jpg`, label: t("gal_8") },
    { src: `${import.meta.env.BASE_URL}images/costume-bleu-rouge.jpg`, label: t("gal_9") },
    { src: `${import.meta.env.BASE_URL}images/veste-bleue-rayee.jpg`, label: t("gal_10") },
    { src: `${import.meta.env.BASE_URL}images/costume-bordeaux.jpg`, label: t("gal_11") },
    { src: `${import.meta.env.BASE_URL}images/promenade-blanche.jpg`, label: t("gal_12") },
    { src: `${import.meta.env.BASE_URL}images/smoking-dore.jpg`, label: t("gal_13") },
    { src: `${import.meta.env.BASE_URL}images/veste-navy-soiree.jpg`, label: t("gal_14") },
    { src: `${import.meta.env.BASE_URL}images/costume-carreaux-rose.jpg`, label: t("gal_15") },
  ];
  const items = baseItems.map((it, i) => ({ ...it, hotspots: STL_SPOTS[i] || [] }));

  const n = items.length;
  const [cur, setCur] = useState(0);
  const [activeSpot, setActiveSpot] = useState(null);
  const [shareToast, setShareToast] = useState(null);
  const timerRef = useRef(null);

  const go = (dir) => { setCur(c => (c + dir + n) % n); };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCur(c => (c + 1) % n), 4000);
  };

  useEffect(() => {
    if (!n) return;
    timerRef.current = setInterval(() => setCur(c => (c + 1) % n), 4000);
    return () => clearInterval(timerRef.current);
  }, [n]);

  useEffect(() => {
    if (activeSpot) clearInterval(timerRef.current);
    else resetTimer();
  }, [activeSpot]);

  const curSpot = activeSpot ? items[activeSpot.iIdx]?.hotspots?.[activeSpot.sIdx] : null;
  const curItem = activeSpot ? items[activeSpot.iIdx] : null;

  const handleWA = () => {
    if (!curSpot || !curItem) return;
    const msg = encodeURIComponent(
      `Bonjour Gaspard ! J'ai découvert votre look "${curItem.label}" sur gaspardnz.com et je suis très intéressé(e) par "${curSpot.label}" — ${curSpot.detail}. Pourriez-vous me donner plus d'informations et le tarif pour une création sur-mesure ? Merci 🙏`
    );
    window.open(`https://wa.me/${WA_STL}?text=${msg}`, "_blank");
  };

  const handleShare = async (network) => {
    const siteUrl = "https://gaspardnz.vercel.app";
    const lookName = curItem?.label ?? "Gaspardnz";
    const shareText = `✨ Look "${lookName}" — Gaspardnz, styliste parisien`;
    if (network === "native") {
      try { await navigator.share({ title: lookName, text: shareText, url: siteUrl }); } catch {}
      return;
    }
    const enc = encodeURIComponent;
    if (network === "facebook") { window.open(`https://www.facebook.com/sharer/sharer.php?u=${enc(siteUrl)}`, "_blank"); return; }
    if (network === "twitter")  { window.open(`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(siteUrl)}`, "_blank"); return; }
    if (network === "pinterest"){ window.open(`https://pinterest.com/pin/create/button/?url=${enc(siteUrl)}&description=${enc(shareText)}`, "_blank"); return; }
    if (network === "whatsapp") { window.open(`https://wa.me/?text=${enc(shareText + "\n" + siteUrl)}`, "_blank"); return; }
    try {
      await navigator.clipboard.writeText(siteUrl);
      setShareToast(network === "instagram" ? "Lien copié — collez dans votre story Instagram !" : "Lien copié — collez dans votre bio TikTok !");
      setTimeout(() => setShareToast(null), 3000);
    } catch { window.open(network === "instagram" ? "https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq" : "https://tiktok.com/@gaspardnz", "_blank"); }
  };

  return (
    <section ref={refEl} style={{ background: "#f5f0e8", paddingBottom: "4rem" }}>
      <motion.p
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", padding: "3rem 1.4rem 1.5rem" }}
      >{t("nav_galerie")}</motion.p>

      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          display: "flex",
          transform: `translateX(${-cur * 100}%)`,
          transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          willChange: "transform",
        }}>
          {items.map(({ src, label, hotspots }, i) => (
            <div key={i} style={{ flex: "0 0 100%", width: "100%", position: "relative" }}>
              <img src={src} alt={label} loading="lazy"
                style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "top", filter: "brightness(0.94) contrast(1.02) saturate(0.9)", display: "block" }} />
              {label && (
                <div style={{ position: "absolute", bottom: "1rem", left: "1rem" }}>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>{label}</p>
                </div>
              )}
              {i === cur && hotspots.length > 0 && (
                <div style={{ position: "absolute", bottom: "1rem", right: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD }} />
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "6px", letterSpacing: "0.35em", color: "rgba(255,255,255,0.75)", textTransform: "uppercase" }}>Shop the Look</p>
                </div>
              )}
              {i === cur && hotspots.map((spot, si) => (
                <motion.button
                  key={si}
                  onClick={() => setActiveSpot({ iIdx: i, sIdx: si })}
                  animate={{ boxShadow: ["0 0 0 0px rgba(184,151,62,0.5)", "0 0 0 6px rgba(184,151,62,0)", "0 0 0 0px rgba(184,151,62,0.5)"] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: si * 0.45, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "transparent",
                    border: "1.5px solid rgba(184,151,62,0.85)",
                    cursor: "pointer",
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "rgba(184,151,62,0.9)", boxShadow: "0 0 4px rgba(184,151,62,0.6)" }} />
                </motion.button>
              ))}
            </div>
          ))}
        </div>

        <button onClick={() => { go(-1); resetTimer(); }}
          style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button onClick={() => { go(1); resetTimer(); }}
          style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "1.2rem" }}>
        {items.map((_, i) => (
          <div key={i} style={{ width: i === cur ? "20px" : "6px", height: "2px", background: i === cur ? GOLD : "rgba(28,18,8,0.2)", borderRadius: "1px", transition: "all 0.3s", cursor: "pointer" }} onClick={() => { setCur(i); resetTimer(); }} />
        ))}
      </div>

      <AnimatePresence>
        {activeSpot && curSpot && curItem && (
          <>
            <motion.div
              key="stl-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveSpot(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(28,18,8,0.55)", zIndex: 200, backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
            />
            <motion.div
              key="stl-panel"
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                background: "#faf7f2",
                zIndex: 201,
                borderRadius: "18px 18px 0 0",
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.4rem)",
                maxHeight: "82vh",
                overflow: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "12px", paddingBottom: "6px" }}>
                <div style={{ width: "36px", height: "3px", background: "rgba(28,18,8,0.18)", borderRadius: "2px" }} />
              </div>
              {shareToast && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ position: "absolute", top: "52px", left: "50%", transform: "translateX(-50%)", background: "#1c1208", color: "#faf7f2", padding: "7px 16px", borderRadius: "20px", fontFamily: "'Montserrat', sans-serif", fontSize: "9.5px", whiteSpace: "nowrap", zIndex: 5, pointerEvents: "none" }}>
                  ✓ {shareToast}
                </motion.div>
              )}

              <div style={{ padding: "0.6rem 1.4rem 1rem", borderBottom: `1px solid rgba(184,151,62,0.2)`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "6.5px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", marginBottom: "5px" }}>SHOP THE LOOK</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 300, color: TEXT, letterSpacing: "0.02em" }}>{curItem.label}</p>
                </div>
                <button onClick={() => setActiveSpot(null)} style={{ background: "none", border: "none", padding: "4px", cursor: "pointer", color: "rgba(28,18,8,0.45)", fontSize: "18px", lineHeight: 1, marginTop: "2px" }}>&times;</button>
              </div>

              <div style={{ padding: "1.2rem 1.4rem" }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", fontWeight: 400, color: TEXT, marginBottom: "10px" }}>{curSpot.label}</p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10.5px", color: "rgba(28,18,8,0.58)", lineHeight: 1.7 }}>{curSpot.detail}</p>
              </div>

              <div style={{ padding: "1.2rem 1.4rem 0" }}>
                <motion.button
                  onClick={handleWA}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", background: "#1c1208", border: "none",
                    padding: "16px 20px",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    cursor: "pointer", borderRadius: "2px",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.2em", color: "#faf7f2", textTransform: "uppercase", fontWeight: 500 }}>Demander ce look sur WhatsApp</span>
                </motion.button>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(28,18,8,0.38)", textAlign: "center", marginTop: "10px", letterSpacing: "0.05em" }}>Styliste parisien · Création unique · Réponse sous 24h</p>
              </div>

              <div style={{ padding: "1rem 1.4rem 0.6rem", borderTop: "1px solid rgba(184,151,62,0.15)" }}>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.5em", color: "rgba(28,18,8,0.35)", textTransform: "uppercase", textAlign: "center", marginBottom: "14px" }}>PARTAGER CE LOOK</p>
                <div style={{ display: "flex", justifyContent: "center", gap: "14px" }}>
                  {[
                    { id:"instagram", label:"Instagram", bg:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
                      icon:<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/> },
                    { id:"tiktok", label:"TikTok", bg:"#010101",
                      icon:<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.27 8.27 0 004.84 1.54V6.91a4.85 4.85 0 01-1.07-.22z"/> },
                    { id:"facebook", label:"Facebook", bg:"#1877F2",
                      icon:<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
                    { id:"twitter", label:"X", bg:"#000000",
                      icon:<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/> },
                    { id:"pinterest", label:"Pinterest", bg:"#E60023",
                      icon:<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/> },
                  ].map(n => (
                    <motion.button key={n.id} whileTap={{ scale: 0.88 }} onClick={() => handleShare(n.id)}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: n.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">{n.icon}</svg>
                      </div>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", color: "rgba(28,18,8,0.45)" }}>{n.label}</span>
                    </motion.button>
                  ))}
                </div>
                {typeof navigator !== "undefined" && navigator.share && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleShare("native")}
                    style={{ width: "100%", background: "transparent", border: `1px solid rgba(184,151,62,0.4)`, borderRadius: "2px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", marginTop: "14px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                    </svg>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.15em", color: GOLD, textTransform: "uppercase" }}>Partager via…</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GalleryMobile;
