import { SEO_ROUTES } from "./seoRoutes.js";

// Textes courts propres à App.jsx (splash, messages WhatsApp pré-remplis).
// Le contenu FR reprend volontairement le titre/la description de la route
// d'accueil (SEO_ROUTES["/"]) pour ne pas les dupliquer.
export const APP_COPY = {
  FR: {
    loading: "Chargement...",
    title: SEO_ROUTES["/"].title,
    description: SEO_ROUTES["/"].description,
    ogDescription: SEO_ROUTES["/"].description,
    waContact: "Bonjour Gaspard, je souhaite vous contacter.",
    waFormula: "Bonjour Gaspard, je souhaite réserver une formule. Pouvez-vous me recontacter ?",
  },
  EN: {
    loading: "Loading...",
    title: "GaspardNZ | Parisian Stylist for Weddings, Galas and Events",
    description: "Gaspardnz is a Parisian stylist specializing in bespoke dressing for weddings, galas and events. Discover the packages and book an appointment.",
    ogDescription: "Bespoke suits, event looks and style advice. Paris.",
    waContact: "Hello Gaspard, I would like to contact you.",
    waFormula: "Hello Gaspard, I would like to book a package. Could you contact me back?",
  },
  ES: {
    loading: "Cargando...",
    title: "GaspardNZ | Estilista Parisino para Bodas, Galas y Eventos",
    description: "Gaspardnz es un estilista parisino especializado en vestimenta a medida para bodas, galas y eventos. Descubre los paquetes y reserva una cita.",
    ogDescription: "Trajes a medida, looks para eventos y asesoría de estilo. París.",
    waContact: "Hola Gaspard, me gustaría contactarte.",
    waFormula: "Hola Gaspard, me gustaría reservar un paquete. ¿Podrías contactarme?",
  },
  ZH: {
    loading: "加载中...",
    title: "GaspardNZ | 巴黎婚礼、晚宴与活动造型师",
    description: "Gaspardnz 是巴黎造型师，专注婚礼、晚会和活动的定制着装。探索套餐并预约。",
    ogDescription: "定制西装、活动造型与风格建议。巴黎。",
    waContact: "你好 Gaspard，我想联系你。",
    waFormula: "你好 Gaspard，我想预约一个套餐。可以联系我吗？",
  },
};
