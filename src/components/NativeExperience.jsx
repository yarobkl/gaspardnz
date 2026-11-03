import { lazy, Suspense, useContext, useState } from "react";
import { LangCtx } from "../context.jsx";
import { useSettings } from "../hooks/useSettings.js";
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
const ChatBot = lazy(() => import("./ChatBot.jsx"));
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
const localUI = {
 FR:{ tabs:["Accueil","Services","Galerie","Réserver","Plus"],sections:{home:"Accueil",services:"Services",gallery:"Galerie",showroom:"Showroom",news:"Actualités",wedding:"Mariage",journal:"Style Journal",vip:"Habillés par GaspardNZ",styleMonth:"Style du mois",video:"Vidéos",partners:"Partenaires",community:"Communauté",about:"À propos"},language:"Langue",lookbook:"Lookbook PDF",loadError:"Impossible de télécharger le lookbook. Réessayez.",request:"Envoyer ma demande",bookingHint:"Présentez votre projet et vos coordonnées. GaspardNZ pourra ensuite vous recontacter pour convenir d'un rendez-vous.",seeServices:"Voir les prestations",loading:"Chargement…",navigation:"Navigation principale",photo:"Portrait de GaspardNZ"},
 EN:{ tabs:["Home","Services","Gallery","Book","More"],sections:{home:"Home",services:"Services",gallery:"Gallery",showroom:"Showroom",news:"News",wedding:"Weddings",journal:"Style journal",vip:"Styled by GaspardNZ",styleMonth:"Style of the month",video:"Videos",partners:"Partners",community:"Community",about:"About"},language:"Language",lookbook:"Lookbook PDF",loadError:"Unable to download the lookbook. Try again.",request:"Send my request",bookingHint:"Tell us about your project and share your contact details. GaspardNZ can then get in touch to arrange an appointment.",seeServices:"Explore services",loading:"Loading…",navigation:"Main navigation",photo:"Portrait of GaspardNZ"},
 ES:{ tabs:["Inicio","Servicios","Galería","Reservar","Más"],sections:{home:"Inicio",services:"Servicios",gallery:"Galería",showroom:"Showroom",news:"Noticias",wedding:"Bodas",journal:"Revista de estilo",vip:"Vestidos por GaspardNZ",styleMonth:"Estilo del mes",video:"Vídeos",partners:"Colaboradores",community:"Comunidad",about:"Acerca de"},language:"Idioma",lookbook:"Catálogo PDF",loadError:"No se puede descargar el catálogo. Inténtelo de nuevo.",request:"Enviar mi solicitud",bookingHint:"Cuéntanos tu proyecto y deja tus datos. GaspardNZ podrá contactarte para concertar una cita.",seeServices:"Ver servicios",loading:"Cargando…",navigation:"Navegación principal",photo:"Retrato de GaspardNZ"},
 ZH:{ tabs:["首页","服务","图库","预约","更多"],sections:{home:"首页",services:"服务",gallery:"图库",showroom:"展厅",news:"资讯",wedding:"婚礼",journal:"风格日志",vip:"GaspardNZ 客户",styleMonth:"本月风格",video:"视频",partners:"合作伙伴",community:"社区",about:"关于"},language:"语言",lookbook:"造型画册 PDF",loadError:"画册下载失败，请重试。",request:"提交咨询",bookingHint:"请介绍您的需求并留下联系方式，GaspardNZ 会与您联系安排预约。",seeServices:"查看服务",loading:"加载中…",navigation:"主导航",photo:"GaspardNZ 肖像"},
};
export default function NativeExperience(){
 const {lang,setLang}=useContext(LangCtx);
 const settings=useSettings();
 const c=copy[lang]||copy.FR;
 const ui=localUI[lang]||localUI.FR;
 const [page,setPage]=useState("home"),[contactOpen,setContactOpen]=useState(false),[downloadError,setDownloadError]=useState("");
 const select=(key)=>{setPage(key);setDownloadError("");window.scrollTo({top:0,behavior:"instant"});};
 const heading=(title,subtitle)=> <header className="gnz-native-heading"><span className="gnz-native-eyebrow">GASPARDNZ · PARIS</span><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</header>;
 const content=()=>{
  switch(page){
   case "home":return <><div className="gnz-native-hero"><img src="/images/Photo%20application%20.JPG" alt={ui.photo} loading="eager" fetchPriority="high" /><div className="gnz-native-hero-shade"/><div className="gnz-native-hero-content"><span>GASPARDNZ · PARIS</span><h1>{c.tagline}</h1><p>{c.intro}</p><button onClick={()=>select("services")}>{c.discover} <span>→</span></button><button className="gnz-native-outline" onClick={()=>setContactOpen(true)}>{c.talk}</button></div></div><section className="gnz-native-section">{heading(c.explore)}<div className="gnz-native-grid">{[["services","Services"],["gallery","Galerie"],["showroom","Showroom"],["news","Actualités"],["wedding","Mariage"],["journal","Style Journal"]].map(([key,label])=><button key={key} onClick={()=>select(key)}>{ui.sections[key]||label}<span>›</span></button>)}</div><button className="gnz-native-primary" onClick={()=>setContactOpen(true)}>{ui.request} →</button></section></>;
   case "services":return <>{heading(ui.sections.services,c.intro)}<Formules onContact={()=>setContactOpen(true)}/></>;
   case "gallery":return <>{heading(ui.sections.gallery)}<Gallery /></>;
   case "booking":return <section className="gnz-native-section">{heading(c.booking)}<div className="gnz-native-booking"><p>{ui.bookingHint}</p><button className="gnz-native-primary" onClick={()=>setContactOpen(true)}>{ui.request} →</button><button className="gnz-native-secondary" onClick={()=>select("services")}>{ui.seeServices}</button></div></section>;
   case "more":return <section className="gnz-native-section">{heading(c.more)}<div className="gnz-native-list">{extra.map(([key,label])=><button key={key} onClick={()=>select(key)}>{ui.sections[key]||label}<span>›</span></button>)}<button onClick={()=>setContactOpen(true)}>{c.contact}<span>›</span></button>{settings.lookbookPdfUrl && !settings.lookbookHidden && <button onClick={()=>{setDownloadError("");downloadFile(settings.lookbookPdfUrl,"lookbook-gaspardnz.pdf").catch(()=>setDownloadError(ui.loadError));}}>{ui.lookbook}<span>↓</span></button>}{downloadError&&<p className="gnz-native-error" role="alert">{downloadError}</p>}<label className="gnz-native-language">{ui.language} <select value={lang} onChange={e=>setLang(e.target.value)}><option value="FR">Français</option><option value="EN">English</option><option value="ES">Español</option><option value="ZH">中文</option></select></label></div></section>;
   default:{
    const title=ui.sections[page]||extra.find(([key])=>key===page)?.[1]||page;
    const component={showroom:<Showroom onCatalogue={()=>setContactOpen(true)} onGalerie={()=>select("gallery")} onFlammes={()=>select("gallery")}/>,news:<News/>,wedding:<Wedding/>,journal:<Journal/>,vip:<VIP/>,styleMonth:<StyleMonth/>,video:<Video/>,partners:<Partners/>,community:<Community/>,about:<About/>}[page];
    return <><section className="gnz-native-section"><button className="gnz-native-back" onClick={()=>select("more")}>‹ {c.back}</button>{heading(title)}</section>{component}</>;
   }
  }
 };
 return <div className="gnz-native"><div className="gnz-native-top"><strong>GASPARDNZ <small>PARIS</small></strong><button onClick={()=>setContactOpen(true)} aria-label={c.contact}>✉</button></div><main id="gnz-native-main"><Suspense fallback={<div className="gnz-native-loading" role="status">{ui.loading}</div>}>{content()}</Suspense></main><nav className="gnz-native-tabs" aria-label={ui.navigation}>{tabs.map(([key,label,glyph],idx)=><button type="button" key={key} onClick={()=>select(key)} aria-current={(page===key || (key==="more" && extra.some(([k])=>k===page)))?"page":undefined} className={(page===key || (key==="more" && extra.some(([k])=>k===page)))?"active":""}><span aria-hidden="true">{glyph}</span><small>{ui.tabs[idx]||label}</small></button>)}</nav><Suspense fallback={null}><ChatBot native onReserver={()=>setContactOpen(true)} onGalerie={()=>select("gallery")} onShowroom={()=>select("showroom")} onFormules={()=>select("services")} />{contactOpen&&<Contact isOpen onClose={()=>setContactOpen(false)} whatsappNumber={settings.whatsappNumber}/>}</Suspense></div>;
}
