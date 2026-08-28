import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { GOLD, TEXT } from "../constants.js";
import { useTr } from "../context.jsx";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { usePublicCollection } from "../hooks/usePublicCollection.js";
import { SvgArrow } from "../icons.jsx";

const absoluteMedia = (src) => {
  if (!src) return "";
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  return `${import.meta.env.BASE_URL}${String(src).replace(/^\/+/, "")}`;
};

function AlbumModal({ photos, title, onClose }) {
  const t = useTr();
  const [idx, setIdx] = useState(0);
  const trap = useFocusTrap(true);
  const current = photos[idx] || photos[0];

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") setIdx((value) => Math.min(value + 1, photos.length - 1));
      if (event.key === "ArrowLeft") setIdx((value) => Math.max(value - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); };
  }, [photos.length, onClose]);

  return <motion.div ref={trap} role="dialog" aria-modal="true" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(8,5,2,.96)",display:"grid",placeItems:"center",padding:"1rem"}}>
    <button aria-label={t("close")} onClick={onClose} style={{position:"absolute",top:"calc(1rem + env(safe-area-inset-top))",right:"1rem",width:44,height:44,borderRadius:"50%",border:"1px solid rgba(184,151,62,.35)",background:"rgba(10,6,2,.55)",color:GOLD,fontSize:22,cursor:"pointer"}}>×</button>
    <motion.div onClick={(e)=>e.stopPropagation()} initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} style={{width:"min(92vw,560px)"}}>
      <div style={{textAlign:"center",marginBottom:"1rem"}}><p style={{fontFamily:"'Montserrat',sans-serif",fontSize:9,letterSpacing:".38em",color:GOLD,textTransform:"uppercase",margin:0}}>{t("album_label")}</p><h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2rem,10vw,4rem)",letterSpacing:".06em",color:"#faf7f2",margin:".45rem 0 0"}}>{title}</h3></div>
      <div style={{position:"relative",borderRadius:16,overflow:"hidden",border:"1px solid rgba(184,151,62,.26)",background:"#0a0602"}}>
        <AnimatePresence mode="wait"><motion.img key={current?.src} src={current?.src} alt={current?.label || title} width="900" height="1200" initial={{opacity:0,scale:1.02}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.99}} style={{width:"100%",height:"min(66vh,680px)",objectFit:"contain",display:"block"}} /></AnimatePresence>
        {photos.length > 1 && <><button aria-label={t("previous_photo")} disabled={idx===0} onClick={()=>setIdx((v)=>Math.max(v-1,0))} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",width:44,height:44,borderRadius:"50%",border:"1px solid rgba(184,151,62,.4)",background:"rgba(0,0,0,.45)",color:GOLD,fontSize:22,opacity:idx===0?.35:1}}>‹</button><button aria-label={t("next_photo")} disabled={idx===photos.length-1} onClick={()=>setIdx((v)=>Math.min(v+1,photos.length-1))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",width:44,height:44,borderRadius:"50%",border:"1px solid rgba(184,151,62,.4)",background:"rgba(0,0,0,.45)",color:GOLD,fontSize:22,opacity:idx===photos.length-1?.35:1}}>›</button></>}
      </div>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(245,240,232,.65)",textAlign:"center",margin:".8rem 0 0"}}>{idx+1} / {photos.length}{current?.label ? ` · ${current.label}` : ""}</p>
    </motion.div>
  </motion.div>;
}

export default function ShowroomMobile({ refEl, onCatalogue }) {
  const t = useTr();
  const ref = useRef(null);
  const inView = useInView(ref,{once:true,margin:"-10% 0px"});
  const [albumOpen,setAlbumOpen] = useState(false);
  const [cur,setCur] = useState(0);
  const fallback = useMemo(() => [
    {src:`${import.meta.env.BASE_URL}images/decontracte/look-jaune.jpg`,label:"Style estival"},
    {src:`${import.meta.env.BASE_URL}images/decontracte/look-navy.jpg`,label:"Casual chic"},
    {src:`${import.meta.env.BASE_URL}images/decontracte/showroom.jpg`,label:"Au showroom GNZ"},
  ],[]);
  const {rows} = usePublicCollection("content_albums",{fallback:[],filters:[{type:"eq",column:"section_key",value:"showroom"}],orderBy:"sort_order"});
  const album = rows?.[0];
  const photos = useMemo(() => {
    const source = Array.isArray(album?.items) && album.items.length ? album.items : fallback;
    return source.map((item,index)=>({src:absoluteMedia(item.src || item.url || item.public_url),label:item.label || `Photo ${index+1}`})).filter((item)=>item.src);
  },[album,fallback]);
  const title = album?.title || t("relaxed");
  const description = album?.description || t("showroom_desc");

  useEffect(()=>{ if (cur >= photos.length) setCur(0); },[cur,photos.length]);
  useEffect(()=>{ if (photos.length < 2) return undefined; const id=window.setInterval(()=>setCur((v)=>(v+1)%photos.length),4500); return()=>window.clearInterval(id); },[photos.length]);
  if (!photos.length) return null;

  return <section ref={refEl} style={{background:"#f5f0e8",overflow:"hidden"}}>
    <AnimatePresence>{albumOpen && <AlbumModal photos={photos} title={title} onClose={()=>setAlbumOpen(false)} />}</AnimatePresence>
    <div onClick={()=>setAlbumOpen(true)} style={{position:"relative",height:"85vw",minHeight:340,maxHeight:560,overflow:"hidden",cursor:"pointer",background:"#0a0602"}}>
      <AnimatePresence mode="wait"><motion.img key={photos[cur]?.src} src={photos[cur]?.src} alt={photos[cur]?.label || title} width="1200" height="1500" initial={{opacity:0,scale:1.02}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:.6}} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top"}} /></AnimatePresence>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 38%,rgba(0,0,0,.7) 100%)"}} />
      <div style={{position:"absolute",top:"1rem",left:"1.2rem",background:"rgba(28,18,8,.52)",padding:".45rem 1rem",backdropFilter:"blur(5px)"}}><p style={{fontFamily:"'Montserrat',sans-serif",fontSize:9,letterSpacing:".4em",color:GOLD,textTransform:"uppercase",margin:0}}>{t("album_label")}</p></div>
      <button type="button" onClick={(e)=>{e.stopPropagation();setAlbumOpen(true);}} style={{position:"absolute",top:"1rem",right:"1.2rem",minHeight:44,border:"1px solid rgba(184,151,62,.3)",background:"rgba(28,18,8,.55)",color:GOLD,padding:"0 .9rem",fontFamily:"'Montserrat',sans-serif",fontSize:9,letterSpacing:".24em",textTransform:"uppercase",cursor:"pointer"}}>{t("view_album")}</button>
      <div style={{position:"absolute",left:"1.2rem",right:"1.2rem",bottom:"1.5rem"}}><h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.5rem,12vw,4.5rem)",letterSpacing:".06em",lineHeight:.9,color:"#faf7f2",margin:0,textShadow:"0 3px 24px rgba(0,0,0,.55)"}}>{title}</h3><p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:GOLD,fontSize:"1rem",margin:".5rem 0 0"}}>{photos[cur]?.label}</p></div>
    </div>

    <div ref={ref} style={{padding:"3rem 1.4rem 4rem",maxWidth:900,margin:"0 auto"}}>
      <motion.p initial={{opacity:0,y:14}} animate={inView?{opacity:1,y:0}:{}} style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,letterSpacing:".4em",color:GOLD,textTransform:"uppercase",margin:"0 0 1rem"}}>{t("nav_showroom")}</motion.p>
      <motion.h2 initial={{opacity:0,y:18}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:.1}} style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(44px,14vw,76px)",lineHeight:.9,letterSpacing:".04em",color:TEXT,margin:"0 0 1.4rem"}}>{t("custom_art_title")}</motion.h2>
      <motion.p initial={{opacity:0,y:16}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:.2}} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1rem,4vw,1.2rem)",fontStyle:"italic",lineHeight:1.8,color:"rgba(28,18,8,.75)",margin:"0 0 2rem"}}>{description}</motion.p>
      <motion.button initial={{opacity:0,y:10}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:.3}} onClick={onCatalogue} style={{width:"100%",minHeight:50,border:"1px solid rgba(184,151,62,.45)",background:"transparent",color:GOLD,fontFamily:"'Montserrat',sans-serif",fontSize:9,letterSpacing:".35em",textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>{t("showroom_cta")} <SvgArrow size={14}/></motion.button>
    </div>
  </section>;
}
