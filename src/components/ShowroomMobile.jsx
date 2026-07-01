import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { GOLD, TEXT } from "../constants.js";
import { useTr } from "../context.jsx";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { SvgArrow } from "../icons.jsx";

const getDecontractePhotos = () => {
  const B = import.meta.env.BASE_URL;
  return [
    { src: `${B}images/decontracte/look-jaune.jpg`, label: "Style estival" },
    { src: `${B}images/decontracte/look-navy.jpg`, label: "Casual chic" },
    { src: `${B}images/decontracte/showroom.jpg`, label: "Au showroom GNZ" },
  ];
};

const DecontracteAlbumModal = ({ photos, onClose }) => {
  const t = useTr();
  const [idx, setIdx] = useState(0);
  const focusTrapRef = useFocusTrap(true);
  const active = photos[idx] || photos[0];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, photos.length - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, photos.length]);

  return (
    <motion.div
      ref={focusTrapRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${t("relaxed")} album`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(8,5,2,0.96)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.1rem",
      }}
    >
      <button
        aria-label={t("close")}
        onClick={onClose}
        style={{
          position: "absolute",
          top: "calc(1rem + env(safe-area-inset-top))",
          right: "1rem",
          width: "44px",
          height: "44px",
          border: "1px solid rgba(184,151,62,0.35)",
          borderRadius: "50%",
          background: "rgba(10,6,2,0.55)",
          color: GOLD,
          fontSize: "1.5rem",
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        ×
      </button>

      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "min(92vw, 520px)", maxHeight: "86vh", display: "flex", flexDirection: "column" }}
      >
        <div style={{ textAlign: "center", marginBottom: "0.9rem" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", margin: 0 }}>{t("album_label")}</p>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#f5f0e8", fontSize: "clamp(2.1rem, 10vw, 4rem)", letterSpacing: "0.08em", lineHeight: 0.9, margin: "0.55rem 0 0" }}>{t("relaxed")}</h3>
        </div>

        <div style={{ position: "relative", borderRadius: "14px", overflow: "hidden", background: "#120c07", border: "1px solid rgba(184,151,62,0.28)", boxShadow: "0 28px 90px rgba(0,0,0,0.55)" }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={active?.src}
              src={active?.src}
              alt={active?.label || t("relaxed")}
              width="900"
              height="1200"
              loading="eager"
              decoding="async"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.24 }}
              style={{ width: "100%", height: "min(58vh, 620px)", objectFit: "contain", objectPosition: "center", display: "block", background: "#0a0602" }}
            />
          </AnimatePresence>

          {photos.length > 1 && (
            <>
              <button
                aria-label={t("previous_photo")}
                onClick={() => setIdx((i) => Math.max(i - 1, 0))}
                disabled={idx === 0}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "1px solid rgba(184,151,62,0.42)",
                  background: "rgba(10,6,2,0.62)",
                  color: GOLD,
                  fontSize: "1.35rem",
                  cursor: idx === 0 ? "default" : "pointer",
                  opacity: idx === 0 ? 0.35 : 1,
                }}
              >
                ‹
              </button>
              <button
                aria-label={t("next_photo")}
                onClick={() => setIdx((i) => Math.min(i + 1, photos.length - 1))}
                disabled={idx === photos.length - 1}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "1px solid rgba(184,151,62,0.42)",
                  background: "rgba(10,6,2,0.62)",
                  color: GOLD,
                  fontSize: "1.35rem",
                  cursor: idx === photos.length - 1 ? "default" : "pointer",
                  opacity: idx === photos.length - 1 ? 0.35 : 1,
                }}
              >
                ›
              </button>
            </>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${photos.length}, 1fr)`, gap: "8px", marginTop: "0.8rem" }}>
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              aria-label={t("view_photo_label", t("relaxed"), i + 1)}
              onClick={() => setIdx(i)}
              style={{
                minHeight: "54px",
                aspectRatio: "1",
                border: i === idx ? `2px solid ${GOLD}` : "1px solid rgba(184,151,62,0.25)",
                borderRadius: "10px",
                padding: 0,
                overflow: "hidden",
                background: "#120c07",
                cursor: "pointer",
              }}
            >
              <img src={photo.src} alt="" width="160" height="160" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>

        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "rgba(245,240,232,0.66)", textAlign: "center", margin: "0.75rem 0 0" }}>{idx + 1} / {photos.length} · {active?.label}</p>
      </motion.div>
    </motion.div>
  );
};

const DecontracteAlbum = ({ onClick }) => {
  const t = useTr();
  const [cur, setCur] = useState(0);
  const photos = getDecontractePhotos();
  useEffect(() => {
    const id = setInterval(() => setCur(c => (c + 1) % photos.length), 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <div onClick={onClick} style={{ position: "relative", height: "85vw", minHeight: "340px", maxHeight: "520px", overflow: "hidden", cursor: "pointer" }}>
      <div style={{ display: "flex", height: "100%", transform: `translateX(${-cur * 100}%)`, transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)", willChange: "transform" }}>
        {photos.map((p, i) => (
          <div key={i} style={{ flexShrink: 0, width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
            <img src={p.src} alt={p.label} width="900" height="1200" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: "1rem", left: "1.2rem", background: "rgba(28,18,8,0.5)", padding: "0.45rem 1rem", backdropFilter: "blur(4px)" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", margin: 0 }}>{t("album_label")}</p>
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        style={{ position: "absolute", top: "1rem", right: "1.2rem", background: "rgba(28,18,8,0.55)", border: "1px solid rgba(184,151,62,0.18)", padding: "0.75rem 0.9rem", minHeight: "44px", backdropFilter: "blur(4px)", cursor: "pointer" }}
      >
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.3em", color: GOLD, textTransform: "uppercase", margin: 0 }}>{t("view_album")}</span>
      </button>
      <div style={{ position: "absolute", bottom: "2.6rem", left: "1.2rem" }}>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2.2rem,11vw,3.5rem)", color: "rgba(245,240,232,0.95)", letterSpacing: "0.08em", lineHeight: 0.9, margin: 0, textShadow: "0 2px 20px rgba(0,0,0,0.7)" }}>{t("relaxed")}</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: GOLD, fontStyle: "italic", margin: "0.4rem 0 0", letterSpacing: "0.06em" }}>{t("lifestyle_collection")}</p>
      </div>
      <div style={{ position: "absolute", bottom: "1.1rem", right: "1.2rem", display: "flex", gap: "5px", alignItems: "center" }}>
        {photos.map((_, i) => (
          <div key={i} style={{ width: i === cur ? 18 : 5, height: 2, background: i === cur ? GOLD : "rgba(184,151,62,0.3)", transition: "width 0.4s", borderRadius: 1 }} />
        ))}
      </div>
    </div>
  );
};

const ShowroomMobile = ({ refEl, onCatalogue }) => {
  const t = useTr();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [albumOpen, setAlbumOpen] = useState(false);
  const decontractePhotos = getDecontractePhotos();

  return (
    <section ref={refEl} style={{ background: "#f5f0e8", overflow: "hidden" }}>
      <AnimatePresence>
        {albumOpen && <DecontracteAlbumModal photos={decontractePhotos} onClose={() => setAlbumOpen(false)} />}
      </AnimatePresence>
      <DecontracteAlbum onClick={() => setAlbumOpen(true)} />

      <div ref={ref} style={{ padding: "3rem 1.4rem 4rem" }}>
        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", marginBottom: "1.2rem" }}
        >{t("nav_showroom")}</motion.p>

        <div style={{ overflow: "hidden", marginBottom: "1.8rem" }}>
          <motion.h2
            initial={{ y: "105%" }} whileInView={{ y: 0 }} viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(44px, 14vw, 76px)", lineHeight: 0.9, letterSpacing: "0.04em", color: TEXT, margin: 0 }}
          >{t("custom_art_title").split("\n").map((line, i) => <span key={line}>{line}{i === 0 && <br />}</span>)}</motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(0.95rem, 3.8vw, 1.15rem)", fontWeight: 300, color: "rgba(28,18,8,0.78)", lineHeight: 1.8, fontStyle: "italic", marginBottom: "2.5rem" }}
        >
          {t("showroom_desc")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
          style={{ display: "flex", gap: "2rem", borderTop: "1px solid rgba(28,18,8,0.09)", paddingTop: "2rem", marginBottom: "2.5rem" }}
        >
          {[["07", t("showroom_stat1")], ["∞", t("showroom_stat2")], ["01", t("showroom_stat3")]].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: GOLD, lineHeight: 1 }}>{num}</div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.2em", color: "rgba(28,18,8,0.6)", textTransform: "uppercase", marginTop: "0.4rem" }}>{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
          onClick={onCatalogue}
          style={{ width: "100%", background: "none", border: `1px solid rgba(184,151,62,0.4)`, color: GOLD, padding: "1.1rem", minHeight: "44px", fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
          onTouchStart={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = "#1c1208"; }}
          onTouchEnd={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = GOLD; }}
        >
          {t("showroom_cta")} <SvgArrow size={14} />
        </motion.button>
      </div>
    </section>
  );
};

export default ShowroomMobile;
