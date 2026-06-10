import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { GOLD } from "../../constants.js";
import { useTr } from "../../context.jsx";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";
import { useSettings } from "../../hooks/useSettings.js";
import { getWhatsappUrl } from "../../utils/whatsappUtil.js";

const AlbumModal = ({ photos, name, onClose }) => {
  const t = useTr();
  const [idx, setIdx] = useState(0);
  const focusTrapRef = useFocusTrap(true);

  // Reset index when album changes
  useEffect(() => {
    setIdx(0);
    // Debug logging to track which album is opened
    if (typeof window !== 'undefined' && window.__GNZ_DEBUG__) {
      console.log(`📸 Album ouvert: ${name} avec ${photos?.length || 0} photos`);
    }
  }, [name, photos]);

  // Validate photos array
  const validPhotos = Array.isArray(photos) ? photos.filter(p => p && typeof p === 'string') : [];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => Math.min(i + 1, validPhotos.length - 1));
      if (e.key === "ArrowLeft") setIdx(i => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [validPhotos.length, onClose]);

  return (
    <motion.div
      ref={focusTrapRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Album photos de ${name}`}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

      <button aria-label={t("close")} onClick={onClose} style={{ position: "absolute", top: "1.2rem", right: "1.2rem", background: "none", border: "none", color: "rgba(245,240,232,0.82)", fontSize: "1.8rem", cursor: "pointer", zIndex: 1, width: "44px", height: "44px" }}>✕</button>

      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", marginBottom: "1.2rem", zIndex: 1 }}>ALBUM · {name.toUpperCase()}</p>

      <motion.div onClick={e => e.stopPropagation()} style={{ position: "relative", width: "90vw", maxWidth: "420px", zIndex: 1 }}>
        {validPhotos.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} style={{ position: "relative" }}>
                <img
                  src={validPhotos[idx]}
                  alt={`${name} — photo ${idx + 1}`}
                  width="900"
                  height="1200"
                  loading="lazy"
                  decoding="async"
                  style={{ width: "100%", borderRadius: "12px", objectFit: "contain", maxHeight: "70vh", display: "block", backgroundColor: "rgba(0,0,0,0.3)" }}
                />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderRadius: "0 0 12px 12px", background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)", padding: "1.4rem 1rem 0.8rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, fontSize: "0.78rem", color: "rgba(245,240,232,0.6)", letterSpacing: "0.04em" }}>{t("dressed_by")}</p>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", letterSpacing: "0.12em", color: GOLD }}>GASPARDNZ</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {validPhotos.length > 1 && (
              <>
                <button aria-label={t("previous_photo")} onClick={() => setIdx(i => Math.max(i - 1, 0))}
                  style={{ position: "absolute", left: "-1rem", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: `1px solid rgba(184,151,62,0.4)`, color: GOLD, borderRadius: "50%", width: "44px", height: "44px", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === 0 ? 0.3 : 1 }}>‹</button>
                <button aria-label={t("next_photo")} onClick={() => setIdx(i => Math.min(i + 1, validPhotos.length - 1))}
                  style={{ position: "absolute", right: "-1rem", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: `1px solid rgba(184,151,62,0.4)`, color: GOLD, borderRadius: "50%", width: "44px", height: "44px", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", opacity: idx === validPhotos.length - 1 ? 0.3 : 1 }}>›</button>
              </>
            )}
          </>
        ) : (
          <div style={{ width: "100%", maxWidth: "420px", aspectRatio: "3/4", borderRadius: "12px", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(245,240,232,0.5)" }}>
            {t("no_photos") || "Aucune photo"}
          </div>
        )}
      </motion.div>

      {validPhotos.length > 0 && (
        <div style={{ display: "flex", gap: "6px", marginTop: "1rem", zIndex: 1 }}>
          {validPhotos.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
              aria-label={`Voir la photo ${i + 1}`}
              style={{ width: "44px", height: "44px", borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ width: i === idx ? "20px" : "6px", height: "6px", borderRadius: "3px", background: i === idx ? GOLD : "rgba(184,151,62,0.3)", display: "block" }} />
            </button>
          ))}
        </div>
      )}

      {validPhotos.length > 0 && (
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.85rem", color: "rgba(245,240,232,0.7)", marginTop: "0.8rem", zIndex: 1 }}>{idx + 1} / {validPhotos.length}</p>
      )}
    </motion.div>
  );
};

const VIPClientsSection = () => {
  const t = useTr();
  const settings = useSettings();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const [cur, setCur] = useState(0);
  const [album, setAlbum] = useState(null);
  const [vw, setVw] = useState(() => typeof window !== "undefined" ? window.innerWidth / 100 : 3.9);
  const curRef = useRef(0);
  useEffect(() => { curRef.current = cur; });
  const B = import.meta.env.BASE_URL;
  const withBase = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
    return `${B}${path.replace(/^\/+/, "")}`;
  };
  const defaultClients = [
    { initials: "R.B", name: "Rodrin Bakala Mouengue", city: "Paris", event: t("event_wedding"), gradient: "linear-gradient(135deg,#1e3a5f,#2d6a9f)", photo: `${B}images/rodrin-bakala.jpg.JPG`,
      album: [`${B}images/rodrin-bakala.jpg.JPG`, `${B}images/rodrin-w1.jpg`, `${B}images/rodrin-w2.jpg`, `${B}images/rodrin-w3.jpg`, `${B}images/rodrin-w4.jpg`, `${B}images/rodrin-w5.jpg`] },
    { initials: "B", name: "Boris", city: "Paris", event: t("event_wedding"), gradient: "linear-gradient(135deg,#4a1942,#8b2fc9)", photo: `${B}images/boris-01.jpg`,
      album: [
        `${B}images/boris-01.jpg`,
        `${B}images/boris-02.jpg`,
        `${B}images/boris-03.jpg`,
        `${B}images/boris-04.jpg`,
        `${B}images/boris-05.jpg`,
        `${B}images/boris-06.jpg`,
        `${B}images/boris-07.jpg`,
        `${B}images/boris-08.jpg`,
        `${B}images/boris-09.jpg`,
        `${B}images/boris-10.jpg`,
        `${B}images/boris-11.jpg`,
        `${B}images/boris-12.jpg`,
        `${B}images/boris-13.jpg`,
        `${B}images/boris-14.jpg`,
        `${B}images/boris-15.jpg`,
        `${B}images/boris-16.jpg`,
      ] },
    { initials: "Y.B", name: "Yannick B.", city: "Lyon", event: t("event_vip_evening"), gradient: "linear-gradient(135deg,#1a3a1a,#2d6b2d)" },
    { initials: "A.N", name: "Alexis N.", city: "Dubaï", event: t("event_business"), gradient: "linear-gradient(135deg,#3d1a00,#8b3d00)" },
    { initials: "D.K", name: "Diarietou K.", city: "Abidjan", event: t("event_ceremony"), gradient: "linear-gradient(135deg,#1a1a3d,#3d3d8b)" },
    { initials: "T.R", name: "Théo R.", city: "Paris", event: t("event_shooting"), gradient: "linear-gradient(135deg,#3d001a,#8b0030)" },
  ];
  const clients = settings.vipClients?.length
    ? settings.vipClients.map((client) => ({
      ...client,
      event: client.event || t("event_wedding"),
      gradient: client.gradient || "linear-gradient(135deg,#1e3a5f,#2d6a9f)",
      photo: withBase(client.photo),
      album: (client.album || []).map(withBase),
    }))
    : defaultClients;
  const CARD_W = 68;
  const getX = (idx) => ((100 - CARD_W) / 2 - idx * CARD_W) * vw;
  const x = useMotionValue(getX(0));
  const snapTo = (idx) => {
    setCur(idx);
    curRef.current = idx;
    animate(x, getX(idx), { type: "spring", stiffness: 380, damping: 38 });
  };
  useEffect(() => {
    const update = () => setVw(window.innerWidth / 100);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useEffect(() => {
    x.set(((100 - CARD_W) / 2 - curRef.current * CARD_W) * vw);
  }, [vw]);

  return (
    <section ref={ref} style={{ background: "#0a0602", padding: "4.5rem 0 5rem", overflow: "hidden" }}>
      <AnimatePresence>
        {album && <AlbumModal photos={album.photos} name={album.name} onClose={() => setAlbum(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", marginBottom: "2.4rem", padding: "0 1.4rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>{t("exclusive_gallery")}</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2, whiteSpace: "pre-line" }}>{t("trusted_title")}</p>
      </motion.div>

      <div style={{ position: "relative", overflow: "hidden", cursor: "grab" }}>
        <motion.div
          drag="x"
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={{ left: getX(clients.length - 1), right: getX(0) }}
          onDragEnd={(_, { offset, velocity }) => {
            const cw = CARD_W * vw;
            if (offset.x < -cw * 0.2 || velocity.x < -300) snapTo(Math.min(curRef.current + 1, clients.length - 1));
            else if (offset.x > cw * 0.2 || velocity.x > 300) snapTo(Math.max(curRef.current - 1, 0));
            else snapTo(curRef.current);
          }}
          style={{ x, display: "flex", alignItems: "center" }}>
          {clients.map((c, i) => {
            const isActive = i === cur;
            const dist = Math.abs(i - cur);
            const handleCardClick = () => {
              if (isActive && c.album && Array.isArray(c.album) && c.album.length > 0) {
                setAlbum({ photos: c.album, name: c.name });
              } else if (!isActive) {
                snapTo(i);
              }
            };
            return (
              <motion.div key={i}
                onClick={handleCardClick}
                animate={{ scale: isActive ? 1 : 0.80, opacity: dist === 0 ? 1 : dist === 1 ? 0.55 : 0.3 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                style={{ flexShrink: 0, width: `${CARD_W}vw`, boxSizing: "border-box", paddingLeft: "6px", paddingRight: "6px", cursor: isActive ? (c.album ? "pointer" : "grab") : "pointer", transformOrigin: "center center" }}>
                <div style={{ borderRadius: "16px", background: c.gradient, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: isActive ? `1px solid rgba(184,151,62,0.5)` : "1px solid rgba(184,151,62,0.15)", position: "relative", overflow: "hidden", aspectRatio: "3/4", boxShadow: isActive ? "0 20px 60px rgba(0,0,0,0.7)" : "none", transition: "border 0.4s, box-shadow 0.4s" }}>
                  {c.photo
                    ? <img src={c.photo} alt={c.name} width="900" height="1200" loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", pointerEvents: "none" }} />
                    : <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(184,151,62,0.15), transparent 70%)", pointerEvents: "none" }} />
                  }
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.85) 100%)", pointerEvents: "none" }} />
                  {!c.photo && (
                    <div style={{ width: "68px", height: "68px", borderRadius: "50%", border: `1.5px solid ${isActive ? GOLD : "rgba(184,151,62,0.35)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", background: "rgba(0,0,0,0.3)", transition: "border 0.4s", position: "relative", zIndex: 1 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 500, color: GOLD }}>{c.initials}</span>
                    </div>
                  )}
                  <div style={{ position: "absolute", bottom: "12px", zIndex: 1, textAlign: "center" }}>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.15em", color: isActive ? "rgba(250,247,242,0.7)" : "rgba(250,247,242,0.4)", textTransform: "uppercase", transition: "color 0.4s" }}>{c.event}</p>
                    {isActive && c.album && (
                      <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", marginTop: "4px" }}>{t("view_album")}</p>
                    )}
                  </div>
                </div>
                <motion.div animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 6 }} transition={{ duration: 0.35 }}
                  style={{ paddingTop: "12px", paddingLeft: "4px" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: 400, color: "#faf7f2", marginBottom: "3px" }}>{c.name}</p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(250,247,242,0.4)", letterSpacing: "0.05em" }}>{c.city}</p>
                  {isActive && c.album && Array.isArray(c.album) && c.album.length > 0 && (
                    <motion.button
                      onPointerUp={e => { e.stopPropagation(); setAlbum({ photos: c.album, name: c.name }); }}
                      whileTap={{ scale: 0.95 }}
                      style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", background: "rgba(184,151,62,0.12)", border: `1px solid rgba(184,151,62,0.45)`, borderRadius: "30px", padding: "0.7rem 1rem", minHeight: "44px", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase" }}>
                      <span>◻</span> {t("vip_album")}
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "7px", marginTop: "1.6rem" }}>
        {clients.map((_, i) => (
          <button key={i} onClick={() => snapTo(i)}
            aria-label={`Voir le client ${i + 1}`}
            style={{ width: "44px", height: "44px", borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", transition: "all 0.35s", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: i === cur ? "22px" : "6px", height: "6px", borderRadius: "3px", background: i === cur ? GOLD : "rgba(184,151,62,0.25)", display: "block" }} />
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}
        style={{ textAlign: "center", marginTop: "2.4rem", padding: "0 1.4rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(250,247,242,0.3)", letterSpacing: "0.08em" }}>{t("vip_question")}</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => window.open(getWhatsappUrl(settings.whatsappNumber, t("vip_question")), "_blank")}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9.5px", letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", borderBottom: `1px solid rgba(184,151,62,0.4)`, padding: "10px 0", minHeight: "44px", marginTop: "8px" }}>
          {t("vip_contact")}
        </motion.button>
      </motion.div>
    </section>
  );
};

export default VIPClientsSection;
