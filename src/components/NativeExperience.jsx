import { lazy, Suspense, useContext, useEffect, useRef, useState } from "react";
import { LangCtx } from "../context.jsx";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSettings } from "../hooks/useSettings.js";
import { usePublicCollection } from "../hooks/usePublicCollection.js";
import { downloadFile } from "../utils/downloadFile.js";
import { nativeFeedback } from "../utils/nativeHaptics.js";
import { openCookieSettings } from "../services/consent.js";
import { formatAvailabilitySlot, normalizeBookingAvailability } from "../utils/bookingAvailability.js";
import NativeTabBar from "./NativeTabBar.jsx";
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
  ["news","Actualités"],["more","Plus"]
];
const NativeIcon = ({name}) => {
 const common={width:25,height:25,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":true};
 const paths={
  home:<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/></>,
  services:<><path d="M3 20h18"/><path d="M5 20V9l7-5 7 5v11"/><path d="M9 20v-7h6v7"/><path d="M3 9h18"/></>,
  gallery:<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 16-5.5-5.5L5 21"/></>,
  booking:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="m9 15 2 2 4-4"/></>,
  more:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  showroom:<><path d="M3 21V8l9-5 9 5v13H3Z"/><path d="M7 21v-8h10v8M3 10h18"/></>,
  news:<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 11h10M7 15h5"/></>,
  wedding:<><path d="M12 21s-9-5.5-9-12a5 5 0 0 1 9-2.5A5 5 0 0 1 21 9c0 6.5-9 12-9 12Z"/></>,
  journal:<><path d="M12 5c-2-2-5-2-9-2v16c4 0 7 0 9 2 2-2 5-2 9-2V3c-4 0-7 0-9 2ZM12 5v16"/></>,
  vip:<><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 4l.8 1.8L20 6l-1.7 1.4.5 2.1L17 8.4l-1.8 1.1.5-2.1L14 6l2.2-.2L17 4Z"/></>,
  styleMonth:<><path d="m12 2 3 6 7 .9-5 5 .9 7L12 17l-5.9 3.9L7 14l-5-5L9 8l3-6Z"/></>,
  video:<><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4V8Z"/></>,
  partners:<><path d="M2 12 8 6l4 4 4-4 6 6-6 6-4-4-4 4-6-6ZM8 18l4 3 4-3"/></>,
  community:<><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M2 20v-2a6 6 0 0 1 12 0v2H2ZM15 16a4 4 0 0 1 7 3v1h-6"/></>,
  about:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
  contact:<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="m2 7 10 7 10-7"/></>,
  lookbook:<><path d="M6 2h9l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2ZM14 2v5h5M8 12h8M8 16h8"/></>
 };
 return <svg {...common}>{paths[name]}</svg>;
};
const ContactBrandIcon = ({ type }) => {
 if (type === "whatsapp") return <span className="gnz-native-brand-icon gnz-native-brand-whatsapp" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3.2a8.8 8.8 0 0 0-7.5 13.4L3.2 21l4.6-1.2A8.8 8.8 0 1 0 12 3.2Z" stroke="currentColor" strokeWidth="1.8"/><path d="M8.6 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.7c.6 1 1.4 1.7 2.5 2.2l.7-.7c.2-.2.4-.2.7-.1l1.8.8c.3.1.4.3.4.6v.5c0 .3-.1.5-.4.7-.4.3-.9.5-1.5.5-2.6-.2-5.5-3-6.5-5.1-.3-.7-.2-1.5.5-2.4Z" fill="currentColor"/></svg></span>;
 if (type === "email") return <span className="gnz-native-brand-icon gnz-native-brand-email" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span>;
 return <span className="gnz-native-brand-icon gnz-native-brand-request" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8"/><path d="M14 3v5h5M8 12h8M8 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span>;
};
const extra = [
  ["showroom","Showroom"],["booking","Réserver"],["wedding","Mariage"],
  ["journal","Style Journal"],["vip","Habillés par GaspardNZ"],
  ["styleMonth","Style du mois"],["video","Vidéos"],
  ["partners","Partenaires"],["community","Communauté"],["about","À propos"],["contact","Nous contacter"]
];
const copy = {
 FR:{tagline:"S'habiller autrement",intro:"Styliste, habilleur et maître de cérémonie.",discover:"Découvrir les services",talk:"Parler à Gaspard",explore:"Explorer GaspardNZ",booking:"Prendre rendez-vous",back:"Retour",more:"L'univers GaspardNZ",contact:"Contacter Gaspard"},
 EN:{tagline:"Dress differently",intro:"Personal styling and tailored guidance.",discover:"Explore services",talk:"Talk to Gaspard",explore:"Explore GaspardNZ",booking:"Book an appointment",back:"Back",more:"The GaspardNZ universe",contact:"Contact Gaspard"},
 ES:{tagline:"Vestir de otra manera",intro:"Asesoría de imagen y acompañamiento personalizado.",discover:"Descubrir servicios",talk:"Hablar con Gaspard",explore:"Explorar GaspardNZ",booking:"Reservar una cita",back:"Volver",more:"El universo GaspardNZ",contact:"Contactar"},
 ZH:{tagline:"穿出不一样的风格",intro:"专属形象与穿搭咨询。",discover:"探索服务",talk:"联系 Gaspard",explore:"探索 GaspardNZ",booking:"预约",back:"返回",more:"GaspardNZ 世界",contact:"联系 Gaspard"}
};
const localUI = {
 FR:{ tabs:["Accueil","Services","Galerie","Actualités","Plus"],sections:{home:"Accueil",services:"Services",gallery:"Galerie",showroom:"Showroom",booking:"Réserver",news:"Actualités",wedding:"Mariage",journal:"Style Journal",vip:"Habillés par GaspardNZ",styleMonth:"Style du mois",video:"Vidéos",partners:"Partenaires",community:"Communauté",about:"À propos",contact:"Nous contacter"},language:"Langue",lookbook:"Lookbook PDF",loadError:"Impossible de télécharger le lookbook. Réessayez.",request:"Envoyer ma demande",calendar:"Choisir une date et une heure",bookingHint:"Choisissez un créneau disponible ou décrivez votre projet pour que GaspardNZ vous recontacte.",seeServices:"Voir les prestations",loading:"Chargement…",navigation:"Navigation principale",photo:"Portrait de GaspardNZ",notifications:"Notifications",noNotifications:"Aucune notification pour le moment",close:"Fermer"},
 EN:{ tabs:["Home","Services","Gallery","News","More"],sections:{home:"Home",services:"Services",gallery:"Gallery",showroom:"Showroom",booking:"Book",news:"News",wedding:"Weddings",journal:"Style journal",vip:"Styled by GaspardNZ",styleMonth:"Style of the month",video:"Videos",partners:"Partners",community:"Community",about:"About",contact:"Contact us"},language:"Language",lookbook:"Lookbook PDF",loadError:"Unable to download the lookbook. Try again.",request:"Send my request",calendar:"Choose a date and time",bookingHint:"Choose an available time or describe your project so GaspardNZ can contact you.",seeServices:"Explore services",loading:"Loading…",navigation:"Main navigation",photo:"Portrait of GaspardNZ",notifications:"Notifications",noNotifications:"No notifications yet",close:"Close"},
 ES:{ tabs:["Inicio","Servicios","Galería","Noticias","Más"],sections:{home:"Inicio",services:"Servicios",gallery:"Galería",showroom:"Showroom",booking:"Reservar",news:"Noticias",wedding:"Bodas",journal:"Revista de estilo",vip:"Vestidos por GaspardNZ",styleMonth:"Estilo del mes",video:"Vídeos",partners:"Colaboradores",community:"Comunidad",about:"Acerca de",contact:"Contactarnos"},language:"Idioma",lookbook:"Catálogo PDF",loadError:"No se puede descargar el catálogo. Inténtelo de nuevo.",request:"Enviar mi solicitud",calendar:"Elegir fecha y hora",bookingHint:"Elige un horario disponible o describe tu proyecto para que GaspardNZ te contacte.",seeServices:"Ver servicios",loading:"Cargando…",navigation:"Navegación principal",photo:"Retrato de GaspardNZ",notifications:"Notificaciones",noNotifications:"Aún no hay notificaciones",close:"Cerrar"},
 ZH:{ tabs:["首页","服务","图库","资讯","更多"],sections:{home:"首页",services:"服务",gallery:"图库",showroom:"展厅",booking:"预约",news:"资讯",wedding:"婚礼",journal:"风格日志",vip:"GaspardNZ 客户",styleMonth:"本月风格",video:"视频",partners:"合作伙伴",community:"社区",about:"关于",contact:"联系我们"},language:"语言",lookbook:"造型画册 PDF",loadError:"画册下载失败，请重试。",request:"提交咨询",calendar:"选择日期和时间",bookingHint:"选择空闲时间，或介绍需求以便 GaspardNZ 与您联系。",seeServices:"查看服务",loading:"加载中…",navigation:"主导航",photo:"GaspardNZ 肖像",notifications:"通知",noNotifications:"暂无通知",close:"关闭"},
};
const legalCopy = {
 FR:{title:"Informations légales et assistance",privacy:"Politique de confidentialité",legal:"Mentions légales",terms:"Conditions générales de vente",support:"Assistance",consent:"Gérer mes cookies"},
 EN:{title:"Legal information and support",privacy:"Privacy policy",legal:"Legal notice",terms:"Terms of sale",support:"Support",consent:"Manage cookie preferences"},
 ES:{title:"Información legal y asistencia",privacy:"Política de privacidad",legal:"Aviso legal",terms:"Condiciones de venta",support:"Asistencia",consent:"Gestionar preferencias de cookies"},
 ZH:{title:"法律信息与支持",privacy:"隐私政策",legal:"法律声明",terms:"销售条款",support:"联系支持",consent:"管理 Cookie 偏好"},
};
const legalLinks = [
 ["privacy","https://gaspardnz.style/confidentialite.html"],
 ["legal","https://gaspardnz.style/mentions-legales.html"],
 ["terms","https://gaspardnz.style/cgv.html"],
 ["support","mailto:gaspardnz.contact@gmail.com"],
];

export default function NativeExperience(){
 const {lang,setLang}=useContext(LangCtx);
 const settings=useSettings();
 const reduceMotion=useReducedMotion();
 const c=copy[lang]||copy.FR;
 const ui=localUI[lang]||localUI.FR;
 const legal=legalCopy[lang]||legalCopy.FR;
 useEffect(()=>{StatusBar.setStyle({style:Style.Light}).catch(()=>{});},[]);
 const [page,setPage]=useState("home"),[contactOpen,setContactOpen]=useState(false),[contactProject,setContactProject]=useState(""),[bookingProject,setBookingProject]=useState(""),[downloadError,setDownloadError]=useState(""),[notificationsOpen,setNotificationsOpen]=useState(false),[newsFocusId,setNewsFocusId]=useState(null);
 const [pairCode,setPairCode]=useState(""),[pairStatus,setPairStatus]=useState(""),[pairBusy,setPairBusy]=useState(false);
 const pushToken=useRef("");
 useEffect(()=>{
   if(Capacitor.getPlatform()!=="ios")return;
   let active=true;const listeners=[];
   (async()=>{
     listeners.push(await PushNotifications.addListener("registration",token=>{if(active)pushToken.current=token.value;}));
     listeners.push(await PushNotifications.addListener("registrationError",error=>{if(active)setPairStatus("Apple : "+(error?.error||"enregistrement impossible"));}));
     listeners.push(await PushNotifications.addListener("pushNotificationActionPerformed",event=>{
       const url=event.notification?.data?.url;
       if(typeof url==="string"&&url.startsWith("https://gaspardnz.style/"))window.location.assign(url);
     }));
   })().catch(()=>{});
   return()=>{active=false;listeners.forEach(listener=>listener.remove());};
 },[]);
 async function pairIphone(){
   if(!/^[a-f0-9]{48}$/.test(pairCode.trim())){setPairStatus("Code invalide.");return;}
   setPairBusy(true);setPairStatus("");
   try{
     const permission=await PushNotifications.requestPermissions();
     if(permission.receive!=="granted")throw new Error("Autorisation de notifications refusée sur cet iPhone.");
     const token=await new Promise((resolve,reject)=>{
       let settled=false,timeoutId;const handles=[];
       const finish=(error,value)=>{
         if(settled)return;
         settled=true;clearTimeout(timeoutId);
         handles.forEach(h=>h.remove().catch(()=>{}));
         if(error)reject(error);else resolve(value);
       };
       (async()=>{
         try{
           handles.push(await PushNotifications.addListener("registration",t=>finish(null,t.value)));
           handles.push(await PushNotifications.addListener("registrationError",e=>finish(new Error(e?.error||"Apple a refusé l’inscription"))));
           timeoutId=setTimeout(()=>finish(new Error("Délai Apple dépassé")),20000);
           await PushNotifications.register();
         }catch(e){finish(e);}
       })();
     });
     const response=await CapacitorHttp.post({
       url:"https://gaspardnz.style/api/push-test-device",
       headers:{"Content-Type":"application/json"},
       data:{code:pairCode.trim(),deviceToken:token},
       connectTimeout:12000,readTimeout:20000
     });
     const result=typeof response.data==="string"?JSON.parse(response.data||"{}"):(response.data||{});
     if(response.status<200||response.status>=300)throw new Error(result.error||"Association impossible");
     setPairCode("");setPairStatus("iPhone associé. Vous pouvez envoyer un test depuis l’administration.");
   }catch(e){setPairStatus(e.message||"Association impossible");}finally{setPairBusy(false);}
 }
 const swipeStart = useRef(null);
 const { rows: announcements } = usePublicCollection("news_posts", { fallback: [], filters: [{ type:"eq", column:"locale", value:lang }], orderBy:"published_at", ascending:false });
 const notificationItems = announcements;
 const [notificationFilter,setNotificationFilter]=useState("all");
 const [notificationState,setNotificationState]=useState(()=>{
   try { return JSON.parse(window.localStorage.getItem("gnz-notification-state-v1") || "{}"); }
   catch { return {}; }
 });
 useEffect(()=>{
   try { window.localStorage.setItem("gnz-notification-state-v1",JSON.stringify(notificationState)); }
   catch { /* Storage may be unavailable in private mode. */ }
 },[notificationState]);
 const updateNotification=(id,patch)=>setNotificationState(prev=>({
   ...prev,[String(id)]:{...prev[String(id)],...patch}
 }));
 const visibleNotifications=notificationItems.filter(item=>{
   const state=notificationState[String(item.id)] || {};
   return notificationFilter==="archived" ? !!state.archived
     : notificationFilter==="unread" ? !state.read && !state.archived : !state.archived;
 });
 const unreadCount=notificationItems.filter(item=>!notificationState[String(item.id)]?.read && !notificationState[String(item.id)]?.archived).length;
 const select=(key)=>{setNotificationsOpen(false);if(key===page)return;window.scrollTo(0,0);setPage(key);setDownloadError("");};
 const backToHome = () => select("home");
 const topTabForPage = (value) => tabs.some(([key]) => key === value) ? value : "more";
 const handleSwipeStart = (event) => {
   const target = event.target;
   if (target.closest("button,a,input,textarea,select,[data-no-tab-swipe],.gnz-native-photo-viewer")) return;
   const touch = event.changedTouches?.[0];
   if (touch) swipeStart.current = { x: touch.clientX, y: touch.clientY };
 };
 const handleSwipeEnd = (event) => {
   const start = swipeStart.current;
   swipeStart.current = null;
   if (!start) return;
   const touch = event.changedTouches?.[0];
   if (!touch) return;
   const dx = touch.clientX - start.x;
   const dy = touch.clientY - start.y;
   if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
   const current = tabs.findIndex(([key]) => key === topTabForPage(page));
   const next = tabs[current + (dx < 0 ? 1 : -1)]?.[0];
   if (next) { nativeFeedback("selection"); select(next); }
 };
 const handleAction=(event)=>{
  const action=event.target.closest("button,a");
  if(action && !action.disabled) nativeFeedback(action.dataset.haptic||"tap");
 };
 const openContact=(project="")=>{setContactProject(project);setContactOpen(true);};
 const heading=(title,subtitle)=> <header className="gnz-native-heading"><span className="gnz-native-eyebrow">GASPARDNZ · PARIS</span><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</header>;
 const bookingChoices=lang==="FR" ? [
  ["image_consulting","Conseil en image"],["wedding","Préparation de mariage"],["master_of_ceremonies","Maître de cérémonie / animation"],["other","Autre demande"]
 ] : lang==="EN" ? [["image_consulting","Image consulting"],["wedding","Wedding styling"],["master_of_ceremonies","Master of ceremonies / hosting"],["other","Other request"]]
   : lang==="ES" ? [["image_consulting","Asesoría de imagen"],["wedding","Preparación de boda"],["master_of_ceremonies","Maestro de ceremonias / animación"],["other","Otra solicitud"]]
   : [["image_consulting","形象咨询"],["wedding","婚礼造型"],["master_of_ceremonies","司仪与活动主持"],["other","其他需求"]];
 const availability = normalizeBookingAvailability(settings.bookingAvailability);
 const content=()=>{
  switch(page){
   case "home":return <div className="gnz-native-hero"><img src="/images/Photo%20application%20.JPG" alt={ui.photo} loading="eager" /><div className="gnz-native-hero-shade"/><div className="gnz-native-hero-content"><h1>{c.tagline}</h1><p>{c.intro}</p><button onClick={()=>select("services")}>{c.discover} <span>→</span></button><button className="gnz-native-outline" onClick={()=>openContact()}>{c.talk}</button></div></div>;
   case "services":return <section className="gnz-native-section">{heading(ui.sections.services,c.intro)}<Services lang={lang} onContact={openContact}/></section>;
   case "gallery":return <section className="gnz-native-section gnz-native-gallery-page">{heading(ui.sections.gallery)}<Gallery native /></section>;
   case "booking":return <section className="gnz-native-section gnz-native-booking-page"><button className="gnz-native-section-back" type="button" onClick={backToHome}>‹ {c.back}</button><div className="gnz-native-booking-icon" aria-hidden="true"><NativeIcon name="booking"/></div>{heading(c.booking,ui.bookingHint)}<div className="gnz-native-booking-options">{bookingChoices.map(([project,label])=><button key={project} type="button" data-haptic="selection" className={bookingProject===project?"selected":""} onClick={()=>setBookingProject(project)} aria-pressed={bookingProject===project}><NativeIcon name="booking"/><span>{label}</span><span aria-hidden="true">›</span></button>)}</div><div className="gnz-native-availability"><strong>{lang === "FR" ? "Créneaux disponibles" : lang === "EN" ? "Available appointments" : lang === "ES" ? "Citas disponibles" : "可预约时间"}</strong>{availability.slots.length ? availability.slots.map((slot)=><button key={slot.id} type="button" className={bookingProject === `slot:${slot.id}` ? "selected" : ""} onClick={()=>setBookingProject(`slot:${slot.id}`)}>{formatAvailabilitySlot(slot, lang === "FR" ? "fr-FR" : undefined)}<span>›</span></button>) : <div className="gnz-native-no-slots" role="status"><strong>{lang === "FR" ? "Aucun créneau publié pour le moment" : lang === "EN" ? "No appointments published yet" : lang === "ES" ? "Aún no hay horarios disponibles" : "暂时没有可预约的时间"}</strong><p>{lang === "FR" ? "Vous pouvez envoyer une demande : GaspardNZ vous recontactera pour convenir d’un rendez-vous." : lang === "EN" ? "Send a request and GaspardNZ will contact you to arrange a time." : lang === "ES" ? "Envíe una solicitud y GaspardNZ le contactará para concertar una cita." : "您可以提交预约申请，GaspardNZ 会联系您确认时间。"}</p></div>}</div><button className="gnz-native-booking-contact" type="button" onClick={()=>openContact(bookingProject || "other")}>{availability.slots.length ? ui.request : lang === "FR" ? "Demander un rendez-vous" : lang === "EN" ? "Request an appointment" : lang === "ES" ? "Solicitar una cita" : "申请预约"} →</button></section>;
   case "more":return <section className="gnz-native-section">{heading(c.more)}<div className="gnz-native-list">{extra.map(([key,label])=><button key={key} onClick={()=>select(key)}><span className="gnz-native-more-icon"><NativeIcon name={key}/></span><span className="gnz-native-more-label">{ui.sections[key]||label}</span><span aria-hidden="true">›</span></button>)}{settings.lookbookPdfUrl && !settings.lookbookHidden && <button onClick={()=>{setDownloadError("");downloadFile(settings.lookbookPdfUrl,"lookbook-gaspardnz.pdf").catch(()=>setDownloadError(ui.loadError));}}><span className="gnz-native-more-icon"><NativeIcon name="lookbook"/></span><span className="gnz-native-more-label">{ui.lookbook}</span><span aria-hidden="true">↓</span></button>}{downloadError&&<p className="gnz-native-error" role="alert">{downloadError}</p>}<label className="gnz-native-language">{ui.language} <select value={lang} onChange={e=>setLang(e.target.value)}><option value="FR">Français</option><option value="EN">English</option><option value="ES">Español</option><option value="ZH">中文</option></select></label><section className="gnz-native-legal" aria-label={legal.title}><h2>{legal.title}</h2><div className="gnz-native-legal-links">{legalLinks.map(([key,href])=><a key={key} href={href} target={href.startsWith("https://")?"_blank":undefined} rel={href.startsWith("https://")?"noopener noreferrer":undefined}><span>{legal[key]}</span><span aria-hidden="true">↗</span></a>)}<button type="button" onClick={openCookieSettings}><span>{legal.consent}</span><span aria-hidden="true">›</span></button></div></section>{Capacitor.getPlatform()==="ios"&&<div style={{padding:"20px 4px",display:"grid",gap:10}}><strong>Notifications Apple — appareil de test</strong><p>Entrez le code temporaire créé depuis l’administration pour associer cet iPhone.</p><input aria-label="Code d’appairage Apple" value={pairCode} onChange={e=>setPairCode(e.target.value.trim())} placeholder="Code temporaire" autoCapitalize="none" autoCorrect="off" style={{width:"100%",padding:12,borderRadius:8,border:"1px solid #b9aa97"}}/><button type="button" disabled={pairBusy} onClick={pairIphone}>{pairBusy?"Connexion Apple…":"Activer les notifications sur cet iPhone"}</button>{pairStatus&&<p role="status">{pairStatus}</p>}</div>}</div></section>;
   case "contact":return <section className="gnz-native-section"><button className="gnz-native-section-back" type="button" onClick={backToHome}>‹ {c.back}</button>{heading(ui.sections.contact)}<div className="gnz-native-contact-list"><button type="button" onClick={()=>openContact()}><ContactBrandIcon type="whatsapp"/><span><strong>WhatsApp</strong><small>{c.talk}</small></span><span aria-hidden="true">›</span></button>{settings.contactEmail&&<a href={`mailto:${settings.contactEmail}`}><ContactBrandIcon type="email"/><span><strong>E-mail</strong><small>{settings.contactEmail}</small></span><span aria-hidden="true">›</span></a>}<button type="button" onClick={()=>openContact()}><ContactBrandIcon type="request"/><span><strong>{ui.request}</strong><small>{ui.bookingHint}</small></span><span aria-hidden="true">›</span></button></div></section>;
   case "news":return <section className="gnz-native-section gnz-native-news-page">{heading(ui.sections.news,lang==="FR"?"Les nouveautés, collections et événements de GaspardNZ.":lang==="EN"?"Discover GaspardNZ news, collections and events.":lang==="ES"?"Novedades, colecciones y eventos de GaspardNZ.":"GaspardNZ 最新资讯、系列与活动。")}<News initialId={newsFocusId} /></section>;
   case "showroom":return <section className="gnz-native-section"><button className="gnz-native-section-back" type="button" onClick={backToHome}>‹ {c.back}</button>{heading(ui.sections.showroom,lang==="FR"?"Découvrez notre espace et nos réalisations.":undefined)}<Showroom onContact={()=>openContact()}/></section>;
   default:{
    const title=ui.sections[page]||extra.find(([key])=>key===page)?.[1]||page;
    const component={wedding:<Wedding/>,journal:<Journal/>,vip:<VIP/>,styleMonth:<StyleMonth/>,video:<Video/>,partners:<Partners/>,community:<Community/>,about:<About/>}[page];
    return <><section className="gnz-native-section"><button className="gnz-native-back" onClick={()=>select("more")}>‹ {c.back}</button>{heading(title)}</section>{component}</>;
   }
  }
 };
 return <div className="gnz-native" onClickCapture={handleAction} onChangeCapture={e=>{if(e.target.matches("select"))nativeFeedback("selection");}}><div className="gnz-native-top"><strong>GASPARDNZ <small>PARIS</small></strong><button type="button" className="gnz-native-notification-trigger" onClick={()=>setNotificationsOpen(v=>!v)} aria-label={ui.notifications} aria-expanded={notificationsOpen} aria-controls="gnz-native-notifications"><NativeIcon name="bell"/>{unreadCount>0 && <span className="gnz-native-notification-count">{unreadCount>9?"9+":unreadCount}</span>}</button></div><AnimatePresence>{notificationsOpen&&<motion.section key="notifications" initial={reduceMotion?false:{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={reduceMotion?{opacity:0}:{opacity:0,y:-8}} transition={{duration:reduceMotion?0:.18}} id="gnz-native-notifications" className="gnz-native-notifications" aria-label={ui.notifications}><div className="gnz-native-notifications-head"><strong>{ui.notifications}</strong><button type="button" onClick={()=>setNotificationsOpen(false)} aria-label={ui.close}>×</button></div><div className="gnz-native-notification-filters" role="group" aria-label="Filtrer les notifications">{[["all",lang==="FR"?"Toutes":"All"],["unread",lang==="FR"?"Non lues":"Unread"],["archived",lang==="FR"?"Archivées":"Archived"]].map(([key,label])=><button key={key} type="button" aria-pressed={notificationFilter===key} onClick={()=>setNotificationFilter(key)}>{label}</button>)}</div>{visibleNotifications.length ? visibleNotifications.map(item=><div className="gnz-native-notification-row" key={item.id}><button type="button" className="gnz-native-notification-item" onClick={()=>{updateNotification(item.id,{read:true});setNewsFocusId(item.id);setNotificationsOpen(false);select("news");}}>{!notificationState[String(item.id)]?.read && <span className="gnz-native-notification-unread" aria-label="Non lue"/>}<strong>{item.title}</strong><p>{item.excerpt || item.body || item.text || ""}</p>{(item.published_at || item.date) && <small>{item.published_at ? new Date(item.published_at).toLocaleDateString(lang === "FR" ? "fr-FR" : undefined) : item.date}</small>}</button><div className="gnz-native-notification-actions">{notificationFilter==="archived" ? <button type="button" onClick={()=>updateNotification(item.id,{archived:false})}>{lang==="FR"?"Restaurer":"Restore"}</button> : <><button type="button" onClick={()=>updateNotification(item.id,{read:true})}>{lang==="FR"?"Marquer comme lue":"Mark read"}</button><button type="button" onClick={()=>updateNotification(item.id,{archived:true})}>{lang==="FR"?"Archiver":"Archive"}</button></>}</div></div>) : <p>{notificationFilter==="unread" ? (lang==="FR"?"Aucune notification non lue.":"No unread notifications.") : notificationFilter==="archived" ? (lang==="FR"?"Aucune notification archivée.":"No archived notifications.") : ui.noNotifications}</p>}</motion.section>}</AnimatePresence><main id="gnz-native-main" onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}><AnimatePresence mode="wait" initial={false}><motion.div className="gnz-native-page" key={page} initial={reduceMotion?false:{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={reduceMotion?{opacity:0}:{opacity:0,y:-6}} transition={{duration:reduceMotion?0:.18,ease:"easeOut"}}><Suspense fallback={<div className="gnz-native-loading" role="status">{ui.loading}</div>}>{content()}</Suspense></motion.div></AnimatePresence></main><NativeTabBar tabs={tabs} labels={ui} activeTab={topTabForPage(page)} onSelect={select} Icon={NativeIcon} /><Suspense fallback={null}>{contactOpen&&<Contact native isOpen onClose={()=>setContactOpen(false)} whatsappNumber={settings.whatsappNumber} initialProjectType={contactProject}/>}</Suspense></div>;
}
