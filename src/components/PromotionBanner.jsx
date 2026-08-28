import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GOLD } from "../constants.js";
import { usePublicCollection } from "../hooks/usePublicCollection.js";
import { trackSiteEvent } from "../services/siteTracking.js";

export default function PromotionBanner({ placement = "home" }) {
  const { rows } = usePublicCollection("promotions", { fallback: [], orderBy: "priority", ascending: false });
  const [dismissed, setDismissed] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const viewedRef = useRef(new Set());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const active = useMemo(() => rows.find((promo) => {
    if (dismissed.includes(promo.id)) return false;
    if (promo.status && !["active","scheduled","published"].includes(promo.status)) return false;
    if (promo.placement && promo.placement !== placement && promo.placement !== "all") return false;
    if (promo.starts_at && new Date(promo.starts_at).getTime() > now) return false;
    if (promo.ends_at && new Date(promo.ends_at).getTime() < now) return false;
    return true;
  }), [rows, dismissed, placement, now]);

  useEffect(() => {
    if (!active?.id || viewedRef.current.has(active.id)) return;
    viewedRef.current.add(active.id);
    trackSiteEvent("promo_view", { entityType: "promotion", entityId: active.id, metadata: { placement } });
  }, [active?.id, placement]);

  if (!active) return null;
  const click = () => {
    trackSiteEvent("promo_click", { entityType: "promotion", entityId: active.id, metadata: { placement, cta: active.cta_label || null } });
    if (active.cta_url) window.open(active.cta_url, active.cta_url.startsWith("http") ? "_blank" : "_self");
  };

  return <AnimatePresence><motion.aside key={active.id} initial={{ opacity:0, y:-14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-14 }} transition={{ duration:.35 }} style={{ position:"absolute", top:"calc(env(safe-area-inset-top) + 78px)", left:"1rem", right:"1rem", zIndex:30, maxWidth:"720px", margin:"0 auto", background:"rgba(8,5,2,.9)", border:"1px solid rgba(184,151,62,.52)", backdropFilter:"blur(14px)", boxShadow:"0 18px 50px rgba(0,0,0,.28)", borderRadius:"12px", overflow:"hidden" }}>
    {active.image_url && <img src={active.image_url} alt="" width="900" height="300" loading="eager" style={{ width:"100%", maxHeight:"140px", objectFit:"cover", display:"block" }} />}
    <div style={{ padding:"1rem 1.05rem", display:"grid", gridTemplateColumns:"1fr auto", gap:"1rem", alignItems:"center" }}>
      <div><p style={{ margin:0, fontFamily:"'Montserrat',sans-serif", fontSize:"9px", letterSpacing:".28em", textTransform:"uppercase", color:GOLD }}>Offre GaspardNZ</p><strong style={{ display:"block", marginTop:"5px", fontFamily:"'Cormorant Garamond',serif", fontSize:"1.18rem", color:"#faf7f2", fontWeight:500 }}>{active.title}</strong>{(active.subtitle || active.description) && <span style={{ display:"block", marginTop:"3px", fontFamily:"'Montserrat',sans-serif", fontSize:"10px", lineHeight:1.5, color:"rgba(250,247,242,.7)" }}>{active.subtitle || active.description}</span>}</div>
      <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>{active.cta_label && <button type="button" onClick={click} style={{ minHeight:44, padding:"0 12px", border:`1px solid ${GOLD}`, background:"rgba(184,151,62,.12)", color:GOLD, fontFamily:"'Montserrat',sans-serif", fontSize:"9px", letterSpacing:".16em", textTransform:"uppercase", cursor:"pointer", borderRadius:"6px" }}>{active.cta_label}</button>}<button type="button" aria-label="Fermer la promotion" onClick={() => setDismissed((list) => [...list, active.id])} style={{ width:44, height:44, border:0, background:"transparent", color:"rgba(250,247,242,.72)", fontSize:"18px", cursor:"pointer" }}>×</button></div>
    </div>
  </motion.aside></AnimatePresence>;
}
