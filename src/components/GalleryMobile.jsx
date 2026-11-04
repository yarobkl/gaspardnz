import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { GOLD, CREAM, SITE_URL } from "../constants.js";
import { LangCtx, useTr } from "../context.jsx";
import { getGallerySpots } from "../data/galleryData.js";
import useCompactMobile from "../hooks/useCompactMobile.js";
import { usePublicCollection } from "../hooks/usePublicCollection.js";
import { useSettings } from "../hooks/useSettings.js";
import { getWhatsappUrl } from "../utils/whatsappUtil.js";
import { nativeFeedback } from "../utils/nativeHaptics.js";
import { HotspotSheet, PhotoHotspots } from "./ui/PhotoHotspots.jsx";

const fallbackFiles = [
  ["costume-creme.jpg",960,1200],["elegance-blanche.jpg",960,1200],["veste-rayee.jpg",900,1200],
  ["veste-orange.jpg",900,1200],["costume-carreaux.jpg",960,960],["veste-bleue.jpg",900,1200],
  ["style-parisien.jpg",1200,1200],["chemise-lavande.jpg",1200,1200],["costume-bleu-rouge.jpg",1200,1200],
  ["veste-bleue-rayee.jpg",1200,1200],["costume-bordeaux.jpg",960,1200],["promenade-blanche.jpg",960,1200],
  ["smoking-dore.jpg",683,1200],["veste-navy-soiree.jpg",800,1200],["costume-carreaux-rose.jpg",675,1200],
];

const COPY = {
  FR: { more: "Voir tous les looks", less: "Réduire la galerie" },
  EN: { more: "View all looks", less: "Collapse gallery" },
  ES: { more: "Ver todos los looks", less: "Reducir la galería" },
  ZH: { more: "查看全部造型", less: "收起画廊" },
};

const absoluteMedia = (src) => {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  return `${import.meta.env.BASE_URL}${String(src).replace(/^\/+/, "")}`;
};
const FAVORITES_KEY = "gaspardnz.favorite-gallery-looks";

export default function GalleryMobile({ refEl, native = false }) {
  const t = useTr();
  const reduceMotion = useReducedMotion();
  const { lang } = useContext(LangCtx);
  const settings = useSettings();
  const isCompactMobile = useCompactMobile();
  const spots = getGallerySpots(lang);
  const fallback = useMemo(() => fallbackFiles.map(([file,width,height], index) => ({
    src: `${import.meta.env.BASE_URL}images/${file}`,
    width,
    height,
    label: t(`gal_${index + 1}`),
    hotspots: spots[index] || [],
  })), [lang, spots, t]);

  const { rows } = usePublicCollection("content_albums", {
    fallback: [],
    filters: [{ type:"eq", column:"section_key", value:"gallery" }],
    orderBy: "sort_order",
  });

  const items = useMemo(() => {
    const album = rows?.[0];
    if (!album || !Array.isArray(album.items) || !album.items.length) return fallback;
    return album.items.map((item, index) => ({
      ...item,
      src: absoluteMedia(item.src || item.url || item.public_url),
      width: Number(item.width || 1200),
      height: Number(item.height || 1500),
      label: item.label || fallback[index]?.label || `Look ${index + 1}`,
      hotspots: Array.isArray(item.hotspots) && item.hotspots.length ? item.hotspots : (spots[index] || []),
    })).filter((item) => item.src);
  }, [rows, fallback, spots]);

  const [expanded, setExpanded] = useState(false);
  const visibleItems = native ? items : isCompactMobile && !expanded ? items.slice(0, 4) : items;
  const copy = COPY[lang] || COPY.FR;
  const [cur, setCur] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [slideDirection, setSlideDirection] = useState(1);
  const warmedImages = useRef(new Set());
  const [favorites, setFavorites] = useState(() => {
    try { return new Set(JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]")); } catch { return new Set(); }
  });
  const [activeSpot, setActiveSpot] = useState(null);
  const timerRef = useRef(null);
  const touchStart = useRef(null);
  const viewerCloseRef = useRef(null);
  const viewerTriggerRef = useRef(null);
  const n = visibleItems.length;

  useEffect(() => { if (cur >= n) setCur(0); }, [n, cur]);
  useEffect(() => {
    if (native || n < 2 || activeSpot !== null) return undefined;
    timerRef.current = window.setInterval(() => setCur((value) => (value + 1) % n), 5000);
    return () => window.clearInterval(timerRef.current);
  }, [n, activeSpot, native]);
  useEffect(() => {
    if (!viewerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    viewerCloseRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") setViewerOpen(false);
      if (event.key === "ArrowRight" && n > 1) { setSlideDirection(1); setCur((value) => (value + 1) % n); }
      if (event.key === "ArrowLeft" && n > 1) { setSlideDirection(-1); setCur((value) => (value - 1 + n) % n); }
      if (event.key === "Tab") {
        const buttons = [...document.querySelectorAll(".gnz-native-photo-viewer button")];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      viewerTriggerRef.current?.focus();
    };
  }, [viewerOpen, n]);

  // Précharge uniquement les deux images voisines pour des balayages immédiats.
  useEffect(() => {
    if (!native || !viewerOpen || n < 2 || typeof window.Image !== "function") return;
    for (const nextIndex of [(cur + 1) % n, (cur - 1 + n) % n]) {
      const src = visibleItems[nextIndex]?.src;
      if (!src || warmedImages.current.has(src)) continue;
      warmedImages.current.add(src);
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
    }
  }, [native, viewerOpen, cur, n, visibleItems]);

  if (!n) return native ? <p className="gnz-native-muted">{lang === "FR" ? "La galerie sera bientôt disponible." : lang === "EN" ? "The gallery will be available soon." : lang === "ES" ? "La galería estará disponible pronto." : "图库即将上线。"}</p> : null;
  const current = visibleItems[cur];
  const selected = activeSpot !== null ? current?.hotspots?.[activeSpot] : null;
  const go = (direction) => { if (native) nativeFeedback("selection"); setSlideDirection(direction); setActiveSpot(null); setCur((value) => (value + direction + n) % n); };
  const isFavorite = (item = current) => favorites.has(item?.src);
  const toggleFavorite = (item = current) => {
    if (!item?.src) return;
    setFavorites((previous) => {
      const next = new Set(previous);
      if (next.has(item.src)) next.delete(item.src); else next.add(item.src);
      if (native) nativeFeedback("tap");
      try { window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const ask = () => {
    if (!selected) return;
    const messages = {
      FR:`Bonjour Gaspard, je suis intéressé(e) par ${selected.label}${selected.detail ? ` : ${selected.detail}` : ""}. Pouvez-vous me donner plus d'informations ?`,
      EN:`Hello Gaspard, I am interested in ${selected.label}${selected.detail ? ` : ${selected.detail}` : ""}. Could you send me more information?`,
      ES:`Hola Gaspard, me interesa ${selected.label}${selected.detail ? ` : ${selected.detail}` : ""}. ¿Puedes enviarme más información?`,
      ZH:`你好 Gaspard，我对 ${selected.label} 感兴趣。可以给我更多信息吗？`,
    };
    window.open(getWhatsappUrl(settings.whatsappNumber, messages[lang] || messages.FR), "_blank", "noopener,noreferrer");
  };

  const share = async () => {
    const payload = { title: current?.label || "GaspardNZ", text: current?.label || "GaspardNZ", url: SITE_URL };
    if (navigator.share) { try { await navigator.share(payload); return; } catch {} }
    try { await navigator.clipboard.writeText(SITE_URL); } catch {}
  };

  if (native) return (
    <>
    <section ref={refEl} className="gnz-native-gallery" aria-label={t("nav_galerie")}>
      <div className="gnz-native-gallery-grid">
        {items.map((item, index) => (
          <button type="button" key={`${item.src}-${index}`} onClick={(event) => { viewerTriggerRef.current = event.currentTarget; nativeFeedback("tap"); setSlideDirection(1); setCur(index); setViewerOpen(true); }} aria-label={item.label}>
            <img src={item.src} alt="" loading={index < 4 ? "eager" : "lazy"} decoding="async" />
          </button>
        ))}
      </div>
      {favorites.size > 0 && <div className="gnz-native-favorites" aria-label={lang === "FR" ? "Mes inspirations" : "My inspirations"}>
        <strong>{lang === "FR" ? "Mes inspirations" : lang === "EN" ? "My inspirations" : lang === "ES" ? "Mis inspiraciones" : "我的灵感"}</strong>
        <span>{favorites.size} {lang === "FR" ? "look(s) enregistré(s)" : lang === "EN" ? "saved look(s)" : ""}</span>
      </div>}
    </section>
    {viewerOpen && createPortal(
      <div className="gnz-native-photo-viewer" role="dialog" aria-modal="true" aria-label={t("nav_galerie")}>
        <div className="gnz-native-photo-viewer-top">
          <button ref={viewerCloseRef} type="button" onClick={() => { nativeFeedback("tap"); setViewerOpen(false); }} aria-label={lang === "FR" ? "Fermer la photo" : lang === "EN" ? "Close photo" : lang === "ES" ? "Cerrar foto" : "关闭照片"}>×</button>
          <span>{String(cur + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
          <div className="gnz-native-photo-viewer-actions"><button type="button" onClick={() => toggleFavorite()} aria-label={isFavorite() ? "Retirer des inspirations" : "Ajouter aux inspirations"} aria-pressed={isFavorite()}>{isFavorite() ? "♥" : "♡"}</button><button type="button" onClick={share} aria-label={lang === "FR" ? "Partager ce look" : lang === "EN" ? "Share this look" : lang === "ES" ? "Compartir este look" : "分享此造型"}>↗</button></div>
        </div>
        <div className="gnz-native-photo-viewer-stage"
          onTouchStart={(event) => { const touch = event.touches[0]; touchStart.current = { x:touch.clientX, y:touch.clientY }; }}
          onTouchEnd={(event) => {
            if (!touchStart.current || n < 2) return;
            const dx = event.changedTouches[0].clientX - touchStart.current.x;
            const dy = event.changedTouches[0].clientY - touchStart.current.y;
            touchStart.current = null;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
          }}>
          {n > 1 && <button type="button" className="gnz-native-photo-viewer-prev" onClick={() => go(-1)} aria-label={t("previous_photo")}>‹</button>}
          <AnimatePresence initial={false} custom={slideDirection} mode="sync">
            <motion.img
              key={`${cur}-${current.src}`}
              src={current.src}
              alt={current.label}
              decoding="async"
              draggable={false}
              custom={slideDirection}
              initial={reduceMotion ? false : { opacity: 0.55, x: slideDirection * 64, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={(direction) => reduceMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 64, scale: 0.985 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.2, 0.75, 0.25, 1] }}
            />
          </AnimatePresence>
          {n > 1 && <button type="button" className="gnz-native-photo-viewer-next" onClick={() => go(1)} aria-label={t("next_photo")}>›</button>}
        </div>
        <p className="gnz-native-photo-viewer-caption">{current.label}</p>
      </div>, document.body)
    }
    </>
  );

  return (
    <section ref={refEl} style={{ background:CREAM, paddingBottom:isCompactMobile ? "3rem" : "4rem", overflow:"hidden" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ padding:isCompactMobile ? "2.2rem 1.4rem 1.15rem" : "3rem 1.4rem 1.4rem", display:"flex", alignItems:"end", justifyContent:"space-between", gap:"1rem" }}>
          <div>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:".42em", color:GOLD, textTransform:"uppercase", margin:"0 0 .55rem" }}>GASPARDNZ</p>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(42px,12vw,72px)", lineHeight:.9, letterSpacing:".04em", color:"#1c1208", margin:0 }}>{t("nav_galerie")}</h2>
          </div>
          <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:".22em", color:"rgba(28,18,8,.5)" }}>{String(cur + 1).padStart(2,"0")} / {String(n).padStart(2,"0")}</span>
        </div>

        <div style={{ position:"relative", margin:"0 1.4rem", borderRadius:18, overflow:"hidden", background:"#120c07", boxShadow:"0 24px 70px rgba(28,18,8,.16)", aspectRatio:"4/5" }}>
          <AnimatePresence mode="wait">
            {/* aspectRatio fixe + objectFit cover : sans ça, chaque photo de
                ratio différent faisait sauter la hauteur de toute la mise en
                page (légende, points, boutons en dessous) à chaque rotation
                automatique du carrousel (toutes les 5s). */}
            <motion.div key={`${cur}-${current.src}`} initial={{ opacity:0, scale:1.015 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.99 }} transition={{ duration:.35 }} style={{ position:"absolute", inset:0 }}>
              <img src={current.src} alt={current.label} width={current.width} height={current.height} loading="lazy" decoding="async" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block", background:"#0a0602" }} />
              <PhotoHotspots
                spots={current.hotspots || []}
                activeIndex={activeSpot ?? -1}
                onSelect={(index) => setActiveSpot((value) => value === index ? null : index)}
              />
            </motion.div>
          </AnimatePresence>

          {n > 1 && <><button aria-label={t("previous_photo")} onClick={() => go(-1)} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:44, height:44, borderRadius:"50%", border:"1px solid rgba(255,255,255,.18)", background:"rgba(0,0,0,.36)", color:"white", fontSize:22, cursor:"pointer", zIndex:8 }}>‹</button><button aria-label={t("next_photo")} onClick={() => go(1)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:44, height:44, borderRadius:"50%", border:"1px solid rgba(255,255,255,.18)", background:"rgba(0,0,0,.36)", color:"white", fontSize:22, cursor:"pointer", zIndex:8 }}>›</button></>}
        </div>

        <div style={{ margin:".7rem 1.4rem 0", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem", minHeight:42 }}>
          <p style={{ margin:0, color:"#1c1208", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.08rem", fontStyle:"italic" }}>{current.label}</p>
          {current.hotspots?.length > 0 && <span style={{ flex:"0 0 auto", color:GOLD, fontFamily:"'Montserrat',sans-serif", fontSize:8, letterSpacing:".2em", textTransform:"uppercase" }}>{t("shop_the_look")}</span>}
        </div>

        <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", padding:".25rem 1rem 0" }}>{visibleItems.map((_,index) => <button key={index} onClick={() => { setCur(index); setActiveSpot(null); }} aria-label={`Photo ${index + 1}`} style={{ width:36, height:36, border:0, background:"transparent", padding:0, display:"grid", placeItems:"center", cursor:"pointer" }}><span style={{ width:index === cur ? 20 : 5, height:2, borderRadius:2, background:index === cur ? GOLD : "rgba(28,18,8,.2)", transition:"width .25s" }} /></button>)}</div>

        {isCompactMobile && items.length > 4 && (
          <div style={{ padding:".25rem 1.4rem .1rem", display:"flex", justifyContent:"center" }}>
            <button
              type="button"
              onClick={() => { setExpanded((value) => !value); setCur(0); setActiveSpot(null); }}
              style={{ minHeight:44, border:"1px solid rgba(184,151,62,.36)", borderRadius:999, background:"rgba(184,151,62,.05)", color:"#876f2f", padding:"0 1.25rem", fontFamily:"'Montserrat',sans-serif", fontSize:9, fontWeight:600, letterSpacing:".18em", textTransform:"uppercase", cursor:"pointer" }}>
              {expanded ? copy.less : `${copy.more} · ${items.length}`}
            </button>
          </div>
        )}

        <div style={{ padding:".45rem 1.4rem 0", display:"flex", justifyContent:"center" }}><button onClick={share} style={{ minHeight:44, border:"1px solid rgba(184,151,62,.28)", background:"transparent", color:"rgba(28,18,8,.72)", padding:"0 1.2rem", fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:".22em", textTransform:"uppercase", cursor:"pointer" }}>Partager ce look</button></div>
      </div>

      <HotspotSheet
        spot={selected}
        onClose={() => setActiveSpot(null)}
        eyebrow={t("shop_the_look")}
        actionLabel="Demander à Gaspard"
        onAction={ask}
      />
    </section>
  );
}
