import { lazy, Suspense, useContext, useEffect, useState } from "react";
import { LangCtx } from "../context.jsx";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useSettings } from "../hooks/useSettings.js";
import { downloadFile } from "../utils/downloadFile.js";
import "./nativeExperience.css";

const Gallery = lazy(() => import("./GalleryMobile.jsx"));
const Services = lazy(() => import("./NativeServices.jsx"));
const News = lazy(() => import("./NativeEditorial.jsx").then(module => ({ default: module.NativeNews })));
const Journal = lazy(() => import("./sections/StyleJournalSection.jsx"));
const Showroom = lazy(() => import("./NativeEditorial.jsx").then(module => ({ default: module.NativeShowroom })));
const Wedding = lazy(() => import("./sections/WeddingInspirationSection.jsx"));
const Video = lazy(() => import("./sections/VideoSection.jsx"));
const VIP = lazy(() => import("./sections/VIPSection.jsx"));
const Partners = lazy(() => import("./sections/PartnersSection.jsx"));
const StyleMonth = lazy(() => import("./sections/StyleDuMoisSection.jsx"));
const Community = lazy(() => import("./sections/CommunauteSection.jsx"));
const About = lazy(() => import("./sections/AboutSection.jsx"));
const Contact = lazy(() => import("./WhatsappContactModal.jsx"));

const tabs = [
  ["home","Accueil"],["services","Services"],["gallery","Galerie"],
  ["booking","Réserver"],["more","Plus"]
];
const NativeIcon = ({name}) => {
 const common={width:25,height:25,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":true};
 const paths={
  home:<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/></>,
  services:<><path d="M3 20h18"/><path d="M5 20V9l7-5 7 5v11"/><path d="M9 20v-7h6v7"/><path d="M3 9h18"/></>,
  gallery:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 16-5.5-5.5L5 21"/></>,
  booking:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="m9 15 2 2 4-4"/></>,
  more:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>
 };
 return <svg {...common}>{paths[name]}</svg>;
};
const extra = [
  ["showroom","Showroom"],["news","Actualités"],["wedding","Mariage"],
  ["journal","Style Journal"],["vip","Habillés par GaspardNZ"],
  ["styleMonth","Style du mois"],["video","Vidéos"],
  ["partners","Partenaires"],["community","Communauté"],["about","À propos"],["contact","Nous contacter"]
];
const copy = {
 FR:{tagline:"S'habiller autrement",intro:"Conseil en style et accompagnement personnalisé.",discover:"Découvrir les services",talk:"Parler à Gaspard",explore:"Explorer GaspardNZ",booking:"Prendre rendez-vous",back:"Retour",more:"L'univers GaspardNZ",contact:"Contacter Gaspard"},
 EN:{tagline:"Dress differently",intro:"Personal styling and tailored guidance.",discover:"Explore services",talk:"Talk to Gaspard",explore:"Explore GaspardNZ",booking:"Book an appointment",back:"Back",more:"The GaspardNZ universe",contact:"Contact Gaspard"},
 ES:{tagline:"Vestir de otra manera",intro:"Asesoría de imagen y acompañamiento personalizado.",discover:"Descubrir servicios",talk:"Hablar con Gaspard",explore:"Explorar GaspardNZ",booking:"Reservar una cita",back:"Volver",more:"El universo GaspardNZ",contact:"Contactar"},
 ZH:{tagline:"穿出不一样的风格",intro:"专属形象与穿搭咨询。",discover:"探索服务",talk:"联系 Gaspard",explore:"探索 GaspardNZ",booking:"预约",back:"返回",more:"GaspardNZ 世界",contact:"联系 Gaspard"}
};
const localUI = {
 FR:{ tabs:["Accueil","Services","Galerie","Réserver","Plus"],sections:{home:"Accueil",services:"Services",gallery:"Galerie",showroom:"Showroom",news:"Actualités",wedding:"Mariage",journal:"Style Journal",vip:"Habillés par GaspardNZ",styleMonth:"Style du mois",video:"Vidéos",partners:"Partenaires",community:"Communauté",about:"À propos",contact:"Nous contacter"},language:"Langue",lookbook:"Lookbook PDF",loadError:"Impossible de télécharger le lookbook. Réessayez.",request:"Envoyer ma demande",bookingHint:"Présentez votre projet et vos coordonnées. GaspardNZ pourra ensuite vous recontacter pour convenir d'un rendez-vous.",seeServices:"Voir les prestations",loading:"Chargement…",navigation:"Navigation principale",photo:"Portrait de GaspardNZ",notifications:"Notifications",noNotifications:"Aucune notification pour le moment",close:"Fermer"},
 EN:{ tabs:["Home","Services","Gallery","Book","More"],sections:{home:"Home",services:"Services",gallery:"Gallery",showroom:"Showroom",news:"News",wedding:"Weddings",journal:"Style journal",vip:"Styled by GaspardNZ",styleMonth:"Style of the month",video:"Videos",partners:"Partners",community:"Community",about:"About",contact:"Contact us"},language:"Language",lookbook:"Lookbook PDF",loadError:"Unable to download the lookbook. Try again.",request:"Send my request",bookingHint:"Tell us about your project and share your contact details. GaspardNZ can then get in touch to arrange an appointment.",seeServices:"Explore services",loading:"Loading…",navigation:"Main navigation",photo:"Portrait of GaspardNZ",notifications:"Notifications",noNotifications:"No notifications yet",close:"Close"},
 ES:{ tabs:["Inicio","Servicios","Galería","Reservar","Más"],sections:{home:"Inicio",services:"Servicios",gallery:"Galería",showroom:"Showroom",news:"Noticias",wedding:"Bodas",journal:"Revista de estilo",vip:"Vestidos por GaspardNZ",styleMonth:"Estilo del mes",video:"Vídeos",partners:"Colaboradores",community:"Comunidad",about:"Acerca de",contact:"Contactarnos"},language:"Idioma",lookbook:"Catálogo PDF",loadError:"No se puede descargar el catálogo. Inténtelo de nuevo.",request:"Enviar mi solicitud",bookingHint:"Cuéntanos tu proyecto y deja tus datos. GaspardNZ podrá contactarte para concertar una cita.",seeServices:"Ver servicios",loading:"Cargando…",navigation:"Navegación principal",photo:"Retrato de GaspardNZ",notifications:"Notificaciones",noNotifications:"Aún no hay notificaciones",close:"Cerrar"},
 ZH:{ tabs:["首页","服务","图库","预约","更多"],sections:{home:"首页",services:"服务",gallery:"图库",showroom:"展厅",news:"资讯",wedding:"婚礼",journal:"风格日志",vip:"GaspardNZ 客户",styleMonth:"本月风格",video:"视频",partners:"合作伙伴",community:"社区",about:"关于",contact:"联系我们"},language:"语言",lookbook:"造型画册 PDF",loadError:"画册下载失败，请重试。",request:"提交咨询",bookingHint:"请介绍您的需求并留下联系方式，GaspardNZ 会与您联系安排预约。",seeServices:"查看服务",loading:"加载中…",navigation:"主导航",photo:"GaspardNZ 肖像",notifications:"通知",noNotifications:"暂无通知",close:"关闭"},
};
export default function NativeExperience(){
 const {lang,setLang}=useContext(LangCtx);
 const settings=useSettings();
 const c=copy[lang]||copy.FR;
 const ui=localUI[lang]||localUI.FR;
 useEffect(()=>{StatusBar.setStyle({style:Style.Light}).catch(()=>{});},[]);
 const [page,setPage]=useState("home"),[contactOpen,setContactOpen]=useState(false),[contactProject,setContactProject]=useState(""),[bookingProject,setBookingProject]=useState(""),[downloadError,setDownloadError]=useState(""),[notificationsOpen,setNotificationsOpen]=useState(false);
 const select=(key)=>{setNotificationsOpen(false);setPage(key);setDownloadError("");window.scrollTo({top:0,behavior:"instant"});};
 const openContact=(project="")=>{setContactProject(project);setContactOpen(true);};
 const heading=(title,subtitle)=> <header className="gnz-native-heading"><span className="gnz-native-eyebrow">GASPARDNZ · PARIS</span><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</header>;
 const bookingChoices=lang==="FR" ? [
  ["image_consulting","Conseil en image"],["wedding","Préparation de mariage"],["other","Autre demande"]
 ] : lang==="EN" ? [["image_consulting","Image consulting"],["wedding","Wedding styling"],["other","Other request"]]
   : lang==="ES" ? [["image_consulting","Asesoría de imagen"],["wedding","Preparación de boda"],["other","Otra solicitud"]]
   : [["image_consulting","形象咨询"],["wedding","婚礼造型"],["other","其他需求"]];
 const content=()=>{
  switch(page){
   case "home":return <div className="gnz-native-hero"><img src="/images/Photo%20application%20.JPG" alt={ui.photo} loading="eager" /><div className="gnz-native-hero-shade"/><div className="gnz-native-hero-content"><h1>{c.tagline}</h1><p>{c.intro}</p><button onClick={()=>select("services")}>{c.discover} <span>→</span></button><button className="gnz-native-outline" onClick={()=>openContact()}>{c.talk}</button></div></div>;
   case "services":return <section className="gnz-native-section">{heading(ui.sections.services,c.intro)}<Services lang={lang} onContact={openContact}/></section>;
   case "gallery":return <section className="gnz-native-section">{heading(ui.sections.gallery)}<Gallery native /></section>;
   case "booking":return <section className="gnz-native-section gnz-native-booking-page"><div className="gnz-native-booking-icon" aria-hidden="true"><NativeIcon name="booking"/></div>{heading(c.booking,ui.bookingHint)}<div className="gnz-native-booking-options">{bookingChoices.map(([project,label])=><button key={project} type="button" className={bookingProject===project?"selected":""} onClick={()=>setBookingProject(project)} aria-pressed={bookingProject===project}><NativeIcon name="booking"/><span>{label}</span><span aria-hidden="true">›</span></button>)}</div><button className="gnz-native-primary" type="button" onClick={()=>openContact(bookingProject)}>{ui.request} →</button></section>;
   case "more":return <section className="gnz-native-section">{heading(c.more)}<div className="gnz-native-list">{extra.map(([key,label])=><button key={key} onClick={()=>select(key)}>{ui.sections[key]||label}<span>›</span></button>)}{settings.lookbookPdfUrl && !settings.lookbookHidden && <button onClick={()=>{setDownloadError("");downloadFile(settings.lookbookPdfUrl,"lookbook-gaspardnz.pdf").catch(()=>setDownloadError(ui.loadError));}}>{ui.lookbook}<span>↓</span></button>}{downloadError&&<p className="gnz-native-error" role="alert">{downloadError}</p>}<label className="gnz-native-language">{ui.language} <select value={lang} onChange={e=>setLang(e.target.value)}><option value="FR">Français</option><option value="EN">English</option><option value="ES">Español</option><option value="ZH">中文</option></select></label></div></section>;
   case "contact":return <section className="gnz-native-section">{heading(ui.sections.contact)}<div className="gnz-native-contact-list"><button type="button" onClick={()=>openContact()}><span className="gnz-native-contact-icon">✆</span><span><strong>WhatsApp</strong><small>{c.talk}</small></span><span aria-hidden="true">›</span></button>{settings.contactEmail&&<a href={`mailto:${settings.contactEmail}`}><span className="gnz-native-contact-icon">✉</span><span><strong>E-mail</strong><small>{settings.contactEmail}</small></span><span aria-hidden="true">›</span></a>}<button type="button" onClick={()=>openContact()}><span className="gnz-native-contact-icon">▤</span><span><strong>{ui.request}</strong><small>{ui.bookingHint}</small></span><span aria-hidden="true">›</span></button></div></section>;
   case "news":return <section className="gnz-native-section">{heading(ui.sections.news,lang==="FR"?"Les nouveautés et les histoires de GaspardNZ.":undefined)}<News /></section>;
   case "showroom":return <section className="gnz-native-section">{heading(ui.sections.showroom,lang==="FR"?"Découvrez notre espace et nos réalisations.":undefined)}<Showroom onContact={()=>openContact()}/></section>;
   default:{
    const title=ui.sections[page]||extra.find(([key])=>key===page)?.[1]||page;
    const component={wedding:<Wedding/>,journal:<Journal/>,vip:<VIP/>,styleMonth:<StyleMonth/>,video:<Video/>,partners:<Partners/>,community:<Community/>,about:<About/>}[page];
    return <><section className="gnz-native-section"><button className="gnz-native-back" onClick={()=>select("more")}>‹ {c.back}</button>{heading(title)}</section>{component}</>;
   }
  }
 };
 return <div className="gnz-native"><div className="gnz-native-top"><strong>GASPARDNZ <small>PARIS</small></strong><button type="button" className="gnz-native-notification-trigger" onClick={()=>setNotificationsOpen(v=>!v)} aria-label={ui.notifications} aria-expanded={notificationsOpen} aria-controls="gnz-native-notifications"><NativeIcon name="bell"/></button></div>{notificationsOpen&&<section id="gnz-native-notifications" className="gnz-native-notifications" aria-label={ui.notifications}><div className="gnz-native-notifications-head"><strong>{ui.notifications}</strong><button type="button" onClick={()=>setNotificationsOpen(false)} aria-label={ui.close}>×</button></div><p>{ui.noNotifications}</p></section>}<main id="gnz-native-main"><Suspense fallback={<div className="gnz-native-loading" role="status">{ui.loading}</div>}>{content()}</Suspense></main><nav className="gnz-native-tabs" aria-label={ui.navigation}>{tabs.map(([key,label],idx)=><button type="button" key={key} onClick={()=>select(key)} aria-current={(page===key || (key==="more" && extra.some(([k])=>k===page)))?"page":undefined} className={(page===key || (key==="more" && extra.some(([k])=>k===page)))?"active":""}><span aria-hidden="true"><NativeIcon name={key}/></span><small>{ui.tabs[idx]||label}</small></button>)}</nav><Suspense fallback={null}>{contactOpen&&<Contact native isOpen onClose={()=>setContactOpen(false)} whatsappNumber={settings.whatsappNumber} initialProjectType={contactProject}/>}</Suspense></div>;
}
