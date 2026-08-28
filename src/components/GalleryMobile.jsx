import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GOLD, SITE_URL } from "../constants.js";
import { LangCtx, useTr } from "../context.jsx";
import { getGallerySpots } from "../data/galleryData.js";
import { usePublicCollection } from "../hooks/usePublicCollection.js";
import { useSettings } from "../hooks/useSettings.js";
import { getWhatsappUrl } from "../utils/whatsappUtil.js";

const fallbackFiles = [
  ["costume-creme.jpg",960,1200],["elegance-blanche.jpg",960,1200],["veste-rayee.jpg",900,1200],
  ["veste-orange.jpg",900,1200],["costume-carreaux.jpg",960,960],["veste-bleue.jpg",900,1200],
  ["style-parisien.jpg",1200,1200],["chemise-lavande.jpg",1200,1200],["costume-bleu-rouge.jpg",1200,1200],
  ["veste-bleue-rayee.jpg",1200,1200],["costume-bordeaux.jpg",960,1200],["promenade-blanche.jpg",960,1200],
  ["smoking-dore.jpg",683,1200],["veste-navy-soiree.jpg",800,1200],["costume-carreaux-rose.jpg",675,1200],
];

const absoluteMedia = (src) => {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  return `${import.meta.env.BASE_URL}${String(src).replace(/^\/+/, "")}`;
};

export default function GalleryMobile({ refEl }) {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const settings = useSettings();
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

  const [cur, setCur] = useState(0);
  const [activeSpot, setActiveSpot] = useState(null);
  const timerRef = useRef(null);
  const n = items.length;

  useEffect(() => { if (cur >= n) setCur(0); }, [n, cur]);
  useEffect(() => {
    if (n < 2 || activeSpot !== null) return undefined;
    timerRef.current = window.setInterval(() => setCur((value) => (value + 1) % n), 5000);
    return () => window.clearInterval(timerRef.current);
  }, [n, activeSpot]);

  if (!n) return null;
  const current = items[cur];
  const selected = activeSpot !== null ? current?.hotspots?.[activeSpot] : null;
  const go = (direction) => { setActiveSpot(null); setCur((value) => (value + direction + n) % n); };

  const ask = () => {
    if (!selected) return;
    const messages = {
      FR:`Bonjour Gaspard, je suis intéressé(e) par ${selected.label}${selected.detail ? ` — ${selected.detail}` : ""}. Pouvez-vous me donner plus d'informations ?`,
      EN:`Hello Gaspard, I am interested in ${selected.label}${selected.detail ? ` — ${selected.detail}` : ""}. Could you send me more information?`,
      ES:`Hola Gaspard, me interesa ${selected.label}${selected.detail ? ` — ${selected.detail}` : ""}. ¿Puedes enviarme más información?`,
      ZH:`你好 Gaspard，我对 ${selected.label} 感兴趣。可以给我更多信息吗？`,
    };
    window.open(getWhatsappUrl(settings.whatsappNumber, messages[lang] || messages.FR), "_blank", "noopener,noreferrer");
  };

  const share = async () => {
    const payload = { title: current?.label || "GaspardNZ", text: current?.label || "GaspardNZ", url: SITE_URL };
    if (navigator.share) { try { await navigator.share(payload); return; } catch {} }
    try { await navigator.clipboard.writeText(SITE_URL); } catch {}
  };

  return (
    <section ref={refEl} style={{ background:"#f5f0e8", paddingBottom:"4rem", overflow:"hidden" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ padding:"3rem 1.4rem 1.4rem", display:"flex", alignItems:"end", justifyContent:"space-between", gap:"1rem" }}>
          <div>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:".42em", color:GOLD, textTransform:"uppercase", margin:"0 0 .55rem" }}>GASPARDNZ</p>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(42px,12vw,72px)", lineHeight:.9, letterSpacing:".04em", color:"#1c1208", margin:0 }}>{t("nav_galerie")}</h2>
          </div>
          <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:10, letterSpacing:".22em", color:"rgba(28,18,8,.5)" }}>{String(cur + 1).padStart(2,"0")} / {String(n).padStart(2,"0")}</span>
        </div>

        <div style={{ position:"relative", margin:"0 1.4rem", borderRadius:18, overflow:"hidden", background:"#120c07", boxShadow:"0 24px 70px rgba(28,18,8,.16)" }}>
          <AnimatePresence mode="wait">
            <motion.div key={`${cur}-${current.src}`} initial={{ opacity:0, scale:1.015 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.99 }} transition={{ duration:.35 }} style={{ position:"relative" }}>
              <img src={current.src} alt={current.label} width={current.width} height={current.height} loading="lazy" decoding="async" style={{ width:"100%", maxHeight:"78vh", minHeight:"54vh", objectFit:"contain", objectPosition:"center", display:"block", background:"#0a0602" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 62%,rgba(5,3,1,.78) 100%)", pointerEvents:"none" }} />
              <div style={{ position:"absolute", left:"1rem", right:"1rem", bottom:"1rem", display:"flex", alignItems:"end", justifyContent:"space-between", gap:"1rem", pointerEvents:"none" }}>
                <div><p style={{ margin:0, color:"#faf7f2", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.25rem", fontStyle:"italic" }}>{current.label}</p>{current.hotspots?.length > 0 && <p style={{ margin:"4px 0 0", color:GOLD, fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:".25em", textTransform:"uppercase" }}>{t("shop_the_look")}</p>}</div>
              </div>
              {(current.hotspots || []).map((spot,index) => <button key={`${spot.label}-${index}`} aria-label={spot.label} onClick={() => setActiveSpot(index)} style={{ position:"absolute", left:`${spot.x}%`, top:`${spot.y}%`, transform:"translate(-50%,-50%)", width:44, height:44, borderRadius:"50%", border:"1px solid rgba(184,151,62,.9)", background:"rgba(8,5,2,.32)", backdropFilter:"blur(4px)", display:"grid", placeItems:"center", cursor:"pointer", zIndex:3 }}><span style={{ width:7, height:7, borderRadius:"50%", background:GOLD, boxShadow:"0 0 0 5px rgba(184,151,62,.14)" }} /></button>)}
            </motion.div>
          </AnimatePresence>

          {n > 1 && <><button aria-label={t("previous_photo")} onClick={() => go(-1)} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:44, height:44, borderRadius:"50%", border:"1px solid rgba(255,255,255,.18)", background:"rgba(0,0,0,.36)", color:"white", fontSize:22, cursor:"pointer" }}>‹</button><button aria-label={t("next_photo")} onClick={() => go(1)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:44, height:44, borderRadius:"50%", border:"1px solid rgba(255,255,255,.18)", background:"rgba(0,0,0,.36)", color:"white", fontSize:22, cursor:"pointer" }}>›</button></>}
        </div>

        <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", padding:".7rem 1rem 0" }}>{items.map((_,index) => <button key={index} onClick={() => { setCur(index); setActiveSpot(null); }} aria-label={`Photo ${index + 1}`} style={{ width:36, height:36, border:0, background:"transparent", padding:0, display:"grid", placeItems:"center", cursor:"pointer" }}><span style={{ width:index === cur ? 20 : 5, height:2, borderRadius:2, background:index === cur ? GOLD : "rgba(28,18,8,.2)", transition:"width .25s" }} /></button>)}</div>

        <div style={{ padding:".6rem 1.4rem 0", display:"flex", justifyContent:"center" }}><button onClick={share} style={{ minHeight:44, border:"1px solid rgba(184,151,62,.28)", background:"transparent", color:"rgba(28,18,8,.72)", padding:"0 1.2rem", fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:".22em", textTransform:"uppercase", cursor:"pointer" }}>Partager ce look</button></div>
      </div>

      <AnimatePresence>{selected && <><motion.button aria-label="Fermer" onClick={() => setActiveSpot(null)} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ position:"fixed", inset:0, zIndex:800, border:0, background:"rgba(5,3,1,.66)" }} /><motion.aside role="dialog" aria-modal="true" initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }} transition={{ type:"spring", damping:30, stiffness:320 }} style={{ position:"fixed", left:0, right:0, bottom:0, zIndex:801, background:"#faf7f2", borderRadius:"20px 20px 0 0", padding:"1.2rem 1.3rem calc(1.4rem + env(safe-area-inset-bottom))", boxShadow:"0 -20px 60px rgba(0,0,0,.22)" }}><div style={{ width:38, height:3, borderRadius:3, background:"rgba(28,18,8,.16)", margin:"0 auto 1rem" }} /><p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:9, letterSpacing:".3em", color:GOLD, textTransform:"uppercase", margin:"0 0 .5rem" }}>{t("shop_the_look")}</p><h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.45rem", color:"#1c1208", margin:"0 0 .55rem" }}>{selected.label}</h3>{selected.detail && <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1rem", lineHeight:1.6, color:"rgba(28,18,8,.72)", margin:"0 0 1.1rem" }}>{selected.detail}</p>}<div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:8 }}><button onClick={ask} style={{ minHeight:48, border:0, background:GOLD, color:"#1c1208", fontFamily:"'Montserrat',sans-serif", fontSize:10, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase", cursor:"pointer" }}>Demander à Gaspard</button><button onClick={() => setActiveSpot(null)} style={{ width:48, height:48, border:"1px solid rgba(28,18,8,.12)", background:"transparent", fontSize:20, cursor:"pointer" }}>×</button></div></motion.aside></>}</AnimatePresence>
    </section>
  );
}
