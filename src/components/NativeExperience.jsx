import { lazy, Suspense, useContext, useState } from "react";
import { LangCtx } from "../context.jsx";
import { useSettings } from "../hooks/useSettings.js";
import { getWhatsappUrl } from "../utils/whatsappUtil.js";
import { downloadFile } from "../utils/downloadFile.js";
import "./nativeExperience.css";

const Gallery = lazy(() => import("./GalleryMobile.jsx"));
const Formules = lazy(() => import("./sections/FormulesSection.jsx"));
const News = lazy(() => import("./sections/ActualitesSection.jsx"));
const Journal = lazy(() => import("./sections/StyleJournalSection.jsx"));
const Showroom = lazy(() => import("./ShowroomMobile.jsx"));
const Wedding = lazy(() => import("./sections/WeddingInspirationSection.jsx"));
const Video = lazy(() => import("./sections/VideoSection.jsx"));
const VIP = lazy(() => import("./sections/VIPSection.jsx"));
const Partners = lazy(() => import("./sections/PartnersSection.jsx"));
const StyleMonth = lazy(() => import("./sections/StyleDuMoisSection.jsx"));
const Community = lazy(() => import("./sections/CommunauteSection.jsx"));
const About = lazy(() => import("./sections/AboutSection.jsx"));
const Booking = lazy(() => import("./BookingModal.jsx"));
const Contact = lazy(() => import("./WhatsappContactModal.jsx"));

const tabs = [
  ["home","Accueil","⌂"],["services","Services","◈"],["gallery","Galerie","▧"],
  ["booking","Réserver","▣"],["more","Plus","•••"]
];
const extra = [
  ["showroom","Showroom"],["news","Actualités"],["wedding","Mariage"],
  ["journal","Style Journal"],["vip","Habillés par GaspardNZ"],
  ["styleMonth","Style du mois"],["video","Vidéos"],
  ["partners","Partenaires"],["community","Communauté"],["about","À propos"]
];
const copy = {
 FR:{tagline:"S'habiller autrement",intro:"Conseil en style et accompagnement personnalisé.",discover:"Découvrir les services",talk:"Parler à Gaspard",explore:"Explorer GaspardNZ",booking:"Prendre rendez-vous",back:"Retour",more:"L'univers GaspardNZ",contact:"Contacter Gaspard"},
 EN:{tagline:"Dress differently",intro:"Personal styling and tailored guidance.",discover:"Explore services",talk:"Talk to Gaspard",explore:"Explore GaspardNZ",booking:"Book an appointment",back:"Back",more:"The GaspardNZ universe",contact:"Contact Gaspard"},
 ES:{tagline:"Vestir de otra manera",intro:"Asesoría de imagen y acompañamiento personalizado.",discover:"Descubrir servicios",talk:"Hablar con Gaspard",explore:"Explorar GaspardNZ",booking:"Reservar una cita",back:"Volver",more:"El universo GaspardNZ",contact:"Contactar"},
 ZH:{tagline:"穿出不一样的风格",intro:"专属形象与穿搭咨询。",discover:"探索服务",talk:"联系 Gaspard",explore:"探索 GaspardNZ",booking:"预约",back:"返回",more:"GaspardNZ 世界",contact:"联系 Gaspard"}
};
export default function NativeExperience(){
 const {lang,setLang}=useContext(LangCtx);
 const settings=useSettings();
 const c=copy[lang]||copy.FR;
 const [page,setPage]=useState("home"),[bookingOpen,setBookingOpen]=useState(false),[contactOpen,setContactOpen]=useState(false);
 const select=(key)=>{setPage(key);window.scrollTo({top:0,behavior:"instant"});};
 const wa=()=>window.open(getWhatsappUrl(settings.whatsappNumber, "Bonjour Gaspard, je vous contacte depuis l'application GaspardNZ."),"_blank");
 const heading=(title,subtitle)=> <header className="gnz-native-heading"><span className="gnz-native-eyebrow">GASPARDNZ · PARIS</span><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</header>;
 const content=()=>{
  switch(page){
   case "home":return <><div className="gnz-native-hero"><img src="/images/veste-orange.jpg" alt="GaspardNZ — portrait" /><div className="gnz-native-hero-shade"/><div className="gnz-native-hero-content"><span>GASPARDNZ · PARIS</span><h1>{c.tagline}</h1><p>{c.intro}</p><button onClick={()=>select("services")}>{c.discover} <span>→</span></button><button className="gnz-native-outline" onClick={()=>setContactOpen(true)}>{c.talk}</button></div></div><section className="gnz-native-section">{heading(c.explore)}<div className="gnz-native-grid">{[["services","Services"],["gallery","Galerie"],["showroom","Showroom"],["news","Actualités"],["wedding","Mariage"],["journal","Style Journal"]].map(([key,label])=><button key={key} onClick={()=>select(key)}>{label}<span>›</span></button>)}</div><button className="gnz-native-primary" onClick={()=>setBookingOpen(true)}>{c.booking} →</button></section></>;
   case "services":return <>{heading("Services",c.intro)}<Formules onContact={wa}/></>;
   case "gallery":return <>{heading("Galerie")}<Gallery /></>;
   case "booking":return <section className="gnz-native-section">{heading(c.booking)}<div className="gnz-native-booking"><p>GaspardNZ · Paris</p><button className="gnz-native-primary" onClick={()=>setBookingOpen(true)}>{c.booking} →</button><button className="gnz-native-secondary" onClick={()=>setContactOpen(true)}>{c.talk}</button></div></section>;
   case "more":return <section className="gnz-native-section">{heading(c.more)}<div className="gnz-native-list">{extra.map(([key,label])=><button key={key} onClick={()=>select(key)}>{label}<span>›</span></button>)}<button onClick={()=>setContactOpen(true)}>{c.contact}<span>›</span></button>{settings.lookbookPdfUrl && !settings.lookbookHidden && <button onClick={()=>downloadFile(settings.lookbookPdfUrl,"lookbook-gaspardnz.pdf").catch(()=>{})}>Lookbook PDF<span>↓</span></button>}<label className="gnz-native-language">Langue <select value={lang} onChange={e=>setLang(e.target.value)}><option value="FR">Français</option><option value="EN">English</option><option value="ES">Español</option><option value="ZH">中文</option></select></label></div></section>;
   default:{
    const title=extra.find(([key])=>key===page)?.[1]||page;
    const component={showroom:<Showroom onCatalogue={()=>setBookingOpen(true)} onGalerie={()=>select("gallery")} onFlammes={()=>select("gallery")}/>,news:<News/>,wedding:<Wedding/>,journal:<Journal/>,vip:<VIP/>,styleMonth:<StyleMonth/>,video:<Video/>,partners:<Partners/>,community:<Community/>,about:<About/>}[page];
    return <><section className="gnz-native-section"><button className="gnz-native-back" onClick={()=>select("more")}>‹ {c.back}</button>{heading(title)}</section>{component}</>;
   }
  }
 };
 return <div className="gnz-native"><div className="gnz-native-top"><strong>GASPARDNZ <small>PARIS</small></strong><button onClick={()=>setContactOpen(true)} aria-label={c.contact}>✉</button></div><main id="gnz-native-main"><Suspense fallback={<div className="gnz-native-loading">Chargement…</div>}>{content()}</Suspense></main><nav className="gnz-native-tabs" aria-label="Navigation principale">{tabs.map(([key,label,glyph])=><button key={key} onClick={()=>select(key)} aria-current={page===key?"page":undefined} className={(page===key || (key==="more" && extra.some(([k])=>k===page)))?"active":""}><span aria-hidden="true">{glyph}</span><small>{label}</small></button>)}</nav><Suspense fallback={null}><Booking isOpen={bookingOpen} onClose={()=>setBookingOpen(false)} boutiqueMode={false} onSwitchToBooking={()=>{}} />{contactOpen&&<Contact isOpen onClose={()=>setContactOpen(false)} whatsappNumber={settings.whatsappNumber}/>}</Suspense></div>;
}
