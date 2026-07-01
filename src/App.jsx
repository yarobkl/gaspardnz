import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, CREAM, SOCIAL_LINKS, SITE_URL } from "./constants.js";
import { LangCtx } from "./context.jsx";

import NotificationPrompt from "./components/NotificationPrompt.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import { initGAIfConsented } from "./services/analytics.js";
import { requestNotificationPermission } from "./services/notifications.js";
import { getSession, initAdminUsers } from "./services/adminAuth.js";
import { trackPageView, trackEvent } from "./services/adminAnalytics.js";
import { initializeTracking, trackPageView as trackDetailedPageView } from "./services/analyticsTracking.js";
import NavMobile from "./components/NavMobile.jsx";
import HeroMobile from "./components/HeroMobile.jsx";

import SectionDivider from "./components/ui/SectionDivider.jsx";

const AboutSection = lazy(() => import("./components/sections/AboutSection.jsx"));
const AdminLogin = lazy(() => import("./components/Admin/AdminLogin.jsx"));
const AdminLayout = lazy(() => import("./components/Admin/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./components/Admin/AdminDashboard.jsx"));
const AdminAnalytics = lazy(() => import("./components/Admin/AdminAnalytics.jsx"));
const AdminCRM = lazy(() => import("./components/Admin/AdminCRM.jsx"));
const AdminVIPClients = lazy(() => import("./components/Admin/AdminVIPClients.jsx"));
const AdminUsers = lazy(() => import("./components/Admin/AdminUsers.jsx"));
const AdminWeddingInspiration = lazy(() => import("./components/Admin/AdminWeddingInspiration.jsx"));
const AdminSettings = lazy(() => import("./components/Admin/AdminSettings.jsx"));
const HeritageMobile = lazy(() => import("./components/HeritageMobile.jsx"));
const ShowroomMobile = lazy(() => import("./components/ShowroomMobile.jsx"));
const GalleryMobile = lazy(() => import("./components/GalleryMobile.jsx"));
const BookingModal = lazy(() => import("./components/BookingModal.jsx"));
const ChatBot = lazy(() => import("./components/ChatBot.jsx"));
const FormulesSection = lazy(() => import("./components/sections/FormulesSection.jsx"));
const ActualitesSection = lazy(() => import("./components/sections/ActualitesSection.jsx"));
const StyleJournalSection = lazy(() => import("./components/sections/StyleJournalSection.jsx"));
const InstagramSection = lazy(() => import("./components/sections/InstagramSection.jsx"));
const VIPClientsSection = lazy(() => import("./components/sections/VIPSection.jsx"));
const CommunauteSection = lazy(() => import("./components/sections/CommunauteSection.jsx"));
const StyleDuMoisSection = lazy(() => import("./components/sections/StyleDuMoisSection.jsx"));
const VideoSection = lazy(() => import("./components/sections/VideoSection.jsx"));
const WeddingInspirationSection = lazy(() => import("./components/sections/WeddingInspirationSection.jsx"));
const FooterMobile = lazy(() => import("./components/FooterMobile.jsx"));
const WhatsAppCTA = lazy(() => import("./components/WhatsAppCTA.jsx"));
const PartnersSection = lazy(() => import("./components/sections/PartnersSection.jsx"));

const FONTS_CSS = "";
const SPLASH_MAX_MS = 700;
const ADMIN_SECTIONS = ["dashboard", "analytics", "crm", "vip", "users", "wedding", "settings"];
const isAdminRoute = () => typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
const getAdminSectionFromPath = () => {
  if (typeof window === "undefined") return "dashboard";
  const section = window.location.pathname.split("/").filter(Boolean)[1];
  return ADMIN_SECTIONS.includes(section) ? section : "dashboard";
};

const _SPLASH_IMG = (typeof import.meta !== "undefined" ? (import.meta.env.BASE_URL || "/") : "/") + "images/style-parisien.jpg";
const SUPPORTED_LANGS = ["FR", "EN", "ES", "ZH"];
const HTML_LANG = { FR: "fr", EN: "en", ES: "es", ZH: "zh" };
const APP_COPY = {
  FR: {
    loading: "Chargement...",
    title: "Gaspardnz — L'Inspirateur de la Haute Allure · Paris",
    description: "Gaspardnz — Styliste parisien spécialisé dans l'habillage sur-mesure pour mariages, galas et événements. Découvrez nos formules et prenez rendez-vous.",
    ogDescription: "Costumes sur-mesure, looks événementiels et conseils style. Paris.",
    waContact: "Bonjour Gaspard, je souhaite vous contacter.",
    waFormula: "Bonjour Gaspard, je souhaite réserver une formule. Pouvez-vous me recontacter ?",
  },
  EN: {
    loading: "Loading...",
    title: "Gaspardnz — The Inspirer of High Style · Paris",
    description: "Gaspardnz is a Parisian stylist specializing in bespoke dressing for weddings, galas and events. Discover the packages and book an appointment.",
    ogDescription: "Bespoke suits, event looks and style advice. Paris.",
    waContact: "Hello Gaspard, I would like to contact you.",
    waFormula: "Hello Gaspard, I would like to book a package. Could you contact me back?",
  },
  ES: {
    loading: "Cargando...",
    title: "Gaspardnz — El Inspirador de la Alta Elegancia · París",
    description: "Gaspardnz es un estilista parisino especializado en vestimenta a medida para bodas, galas y eventos. Descubre los paquetes y reserva una cita.",
    ogDescription: "Trajes a medida, looks para eventos y asesoría de estilo. París.",
    waContact: "Hola Gaspard, me gustaría contactarte.",
    waFormula: "Hola Gaspard, me gustaría reservar un paquete. ¿Podrías contactarme?",
  },
  ZH: {
    loading: "加载中...",
    title: "Gaspardnz — 高级风格灵感缔造者 · 巴黎",
    description: "Gaspardnz 是巴黎造型师，专注婚礼、晚会和活动的定制着装。探索套餐并预约。",
    ogDescription: "定制西装、活动造型与风格建议。巴黎。",
    waContact: "你好 Gaspard，我想联系你。",
    waFormula: "你好 Gaspard，我想预约一个套餐。可以联系我吗？",
  },
};

const SplashScreen = ({ onDone, loading }) => {
  useEffect(() => {
    const fallback = setTimeout(onDone, SPLASH_MAX_MS);
    return () => clearTimeout(fallback);
  }, [onDone]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#070400", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2.4rem", overflow: "hidden" }}>

    {/* Photo de fond */}
    <motion.img
      src={_SPLASH_IMG}
      width="1200"
      height="1600"
      alt="Gaspardnz splash screen background - styliste parisien"
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 0.45, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
    />
    {/* Overlay sombre */}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(4,2,0,0.5) 0%, rgba(4,2,0,0.3) 40%, rgba(4,2,0,0.6) 100%)" }} />

    {/* Bouton Passer */}
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.6 }}
      onClick={onDone}
      aria-label="Skip splash screen"
      style={{ position: "absolute", top: "2rem", right: "2rem", zIndex: 10, background: "rgba(184,151,62,0.15)", border: "1px solid rgba(184,151,62,0.4)", color: "rgba(245,240,232,0.88)", padding: "0.7rem 1.2rem", minHeight: "44px", minWidth: "44px", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px", transition: "all 0.3s ease" }}
      onHoverStart={{ background: "rgba(184,151,62,0.25)" }}>
      Passer
    </motion.button>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
      <motion.p
        initial={{ letterSpacing: "0.12em", opacity: 0 }}
        animate={{ letterSpacing: "0.38em", opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3.5rem", color: "#faf7f2", margin: 0, lineHeight: 1, textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
        GASPARDNZ
      </motion.p>
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, letterSpacing: "0.6em" }}
        transition={{ duration: 0.75, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", color: GOLD, textTransform: "uppercase", marginTop: "10px" }}>
        Paris
      </motion.p>
    </motion.div>

    <div style={{ width: "140px", height: "1px", background: "rgba(184,151,62,0.15)", position: "relative", overflow: "hidden", zIndex: 1 }}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.05, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onAnimationComplete={onDone}
        style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${GOLD}, #d4ae5a)`, transformOrigin: "left" }} />
    </div>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.45, 0.25, 0.45] }}
      transition={{ duration: 1.2, delay: 0.25, times: [0, 0.3, 0.6, 1] }}
      style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "6px", letterSpacing: "0.55em", color: "rgba(245,240,232,0.7)", textTransform: "uppercase", position: "relative", zIndex: 1 }}>
      {loading}
    </motion.p>
    </motion.div>
  );
};

export default function App() {
  const [splashDone, setSplashDone] = useState(true);
  const [notifPrompt, setNotifPrompt] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [boutiqueMode, setBoutiqueMode] = useState(false);
  const [highContrast, setHighContrast] = useState(() => {
    try {
      const saved = localStorage.getItem("gnz-highContrast");
      return saved !== null ? saved === "true" : false;
    } catch {
      return false;
    }
  });
  const [lightMode, setLightMode] = useState(() => {
    try {
      const saved = localStorage.getItem("gnz-lightMode");
      if (saved !== null) return saved === "true";
      // Fallback to system preference
      return window.matchMedia("(prefers-color-scheme: light)").matches;
    } catch {
      return false;
    }
  });
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminSection, setAdminSection] = useState(getAdminSectionFromPath);
  const finishSplash = useCallback(() => setSplashDone(true), []);
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem("gnz-lang");
      return SUPPORTED_LANGS.includes(saved) ? saved : "FR";
    } catch {
      return "FR";
    }
  });
  const changeLang = useCallback((nextLang) => {
    if (!SUPPORTED_LANGS.includes(nextLang)) return;
    setLang(nextLang);
    try { localStorage.setItem("gnz-lang", nextLang); } catch {}
  }, []);

  const showroomRef    = useRef(null);
  const heritageRef    = useRef(null);
  const galleryRef     = useRef(null);
  const formulesRef    = useRef(null);
  const styleDuMoisRef = useRef(null);
  const partenairesRef = useRef(null);
  const styleJournalRef = useRef(null);
  const videoRef        = useRef(null);
  const weddingRef      = useRef(null);
  const actualitesRef   = useRef(null);
  const vipRef          = useRef(null);
  const communauteRef   = useRef(null);
  const currentlyOnAdminPath = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!document.querySelector("style[data-gnz-fonts]")) {
      const s = document.createElement("style");
      s.setAttribute("data-gnz-fonts", "1");
      s.textContent = FONTS_CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const copy = APP_COPY[lang] || APP_COPY.FR;
    document.title = copy.title;
    const meta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    meta("description", copy.description);
    meta("og:title", copy.title, true);
    meta("og:description", copy.ogDescription, true);
    meta("og:type", "website", true);
    meta("og:url", SITE_URL, true);
    meta("og:image", `${SITE_URL}/images/style-parisien.jpg`, true);
    meta("og:site_name", "Gaspardnz", true);
    meta("theme-color", highContrast ? "#fff9e6" : "#0a0602");

    // Canonical tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = SITE_URL;
  }, [highContrast, lang]);

  useEffect(() => {
    document.body.style.background = "#0a0602";
    document.body.style.margin = "0";
    document.body.style.overflowX = "hidden";
    initGAIfConsented();

    // Add Schemas for SEO (LocalBusiness, Services, FAQ)
    if (!document.querySelector('script[data-gnz-schema]')) {
      const localBusiness = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Gaspardnz",
        "description": "Styliste et habilleur spécialisé à Paris. Sélection et coordination de tenues pour mariages africains, galas et cérémonies.",
        "url": SITE_URL,
        "areaServed": "Paris",
        "sameAs": [SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok, SOCIAL_LINKS.facebook, SOCIAL_LINKS.youtube],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "url": "https://wa.me/33664826920"
        }
      };

      const services = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Services de Style et d'Habillage",
        "provider": { "@type": "LocalBusiness", "name": "Gaspardnz" },
        "offers": [
          { "@type": "Offer", "name": "Styliste Mariage à Paris" },
          { "@type": "Offer", "name": "Habilleur Mariages Africains" },
          { "@type": "Offer", "name": "Maître de Cérémonie Paris" }
        ]
      };

      const faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Quel est le rôle d'un styliste mariage à Paris?",
            "acceptedAnswer": { "@type": "Answer", "text": "Sélection et coordination des tenues pour mariages, mariages africains et cérémonies." }
          },
          {
            "@type": "Question",
            "name": "Proposez-vous des services pour mariages africains?",
            "acceptedAnswer": { "@type": "Answer", "text": "Oui, spécialiste en sélection de tenues pour mariages africains à Paris." }
          },
          {
            "@type": "Question",
            "name": "Qu'est-ce qu'un habilleur professionnel?",
            "acceptedAnswer": { "@type": "Answer", "text": "Un habilleur assure la mise en place impeccable des tenues pour galas, mariages et événements." }
          }
        ]
      };

      // Event schema for wedding services
      const eventSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": "https://gaspardnz.style/#wedding-service",
        "name": "Service de styliste pour mariage",
        "description": "Costume sur-mesure, habillage et direction de cérémonie pour votre mariage à Paris",
        "provider": {
          "@type": "Person",
          "@id": "https://gaspardnz.style/#gaspardnz",
          "name": "Gaspard NZ",
          "image": "https://gaspardnz.style/avatar.jpg"
        },
        "areaServed": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Paris",
            "addressCountry": "FR"
          }
        },
        "priceRange": "€€€",
        "serviceType": "Personal Styling"
      };

      [localBusiness, services, faq, eventSchema].forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-gnz-schema', '1');
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    // Initialize comprehensive tracking system
    const cleanupTracking = initializeTracking();

    return () => {
      if (cleanupTracking) cleanupTracking();
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang] || "fr";
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("gnz-lightMode", String(lightMode));
  }, [lightMode]);

  useEffect(() => {
    localStorage.setItem("gnz-highContrast", String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    if (isAdminPath || currentlyOnAdminPath) {
      setSplashDone(true);
      return;
    }
    if (splashDone) return;
    const t = setTimeout(() => setSplashDone(true), 2500);
    return () => clearTimeout(t);
  }, [currentlyOnAdminPath, isAdminPath, splashDone]);

  useEffect(() => {
    if (isAdminPath || currentlyOnAdminPath) return;
    if (!splashDone) return;
    const already = localStorage.getItem("gnz-notif-asked");
    if (already) return;
    const t = setTimeout(() => {
      if (!localStorage.getItem("gnz-cookies")) return;
      if (!document.hidden) setNotifPrompt(true);
    }, 14000);
    return () => clearTimeout(t);
  }, [currentlyOnAdminPath, isAdminPath, splashDone]);

  useEffect(() => {
    initAdminUsers();
  }, []);

  useEffect(() => {
    const checkAdminPath = () => {
      const path = window.location.pathname;
      setIsAdminPath(path.startsWith("/admin"));
      if (path.startsWith("/admin")) {
        setAdminSection(getAdminSectionFromPath());
      }
    };
    checkAdminPath();
    window.addEventListener("popstate", checkAdminPath);
    return () => window.removeEventListener("popstate", checkAdminPath);
  }, []);

  useEffect(() => {
    if (currentlyOnAdminPath || isAdminPath) {
      const session = getSession();
      if (session) {
        setIsAdminLoggedIn(true);
        setAdminUser(session);
      }
    }
  }, [currentlyOnAdminPath, isAdminPath]);

  useEffect(() => {
    if (splashDone && !isAdminPath) {
      trackPageView(window.location.pathname);
      trackDetailedPageView(window.location.pathname);
    }
  }, [splashDone, isAdminPath]);

  const scrollTo = (ref) => { ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const openBooking = (boutique = false) => { setBoutiqueMode(boutique); setBookingOpen(true); };

  const handleNotifAccept = async () => {
    setNotifPrompt(false);
    localStorage.setItem("gnz-notif-asked", "1");
    await requestNotificationPermission();
  };
  const handleNotifDecline = () => {
    setNotifPrompt(false);
    localStorage.setItem("gnz-notif-asked", "1");
  };

  return (
    <LangCtx.Provider value={{ lang, setLang: changeLang }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button, input, textarea, select { font-family: inherit; }
        img, video { max-width: 100%; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.001ms !important;
          }
        }
        ${highContrast ? `
          body { filter: contrast(1.25) brightness(1.08); }
        ` : ""}
        ${lightMode ? `
          [data-gnz-mode="light"] section { filter: brightness(1.18) saturate(0.82); }
        ` : ""}
      `}</style>

      <AnimatePresence mode="wait">
        {!currentlyOnAdminPath && !isAdminPath && !splashDone && <SplashScreen key="splash" loading={(APP_COPY[lang] || APP_COPY.FR).loading} onDone={finishSplash} />}
      </AnimatePresence>

      {(splashDone || currentlyOnAdminPath || isAdminPath) && (
        (currentlyOnAdminPath || isAdminPath) ? (
          <Suspense fallback={null}>
          {isAdminLoggedIn ? (
            <AdminLayout
              currentSection={adminSection}
              onSectionChange={(section) => {
                setAdminSection(section);
                window.history.pushState({}, "", `/admin/${section}`);
              }}
              user={adminUser}>
              {adminSection === "dashboard" && <AdminDashboard />}
              {adminSection === "analytics" && <AdminAnalytics />}
              {adminSection === "crm" && <AdminCRM />}
              {adminSection === "vip" && <AdminVIPClients />}
              {adminSection === "users" && <AdminUsers />}
              {adminSection === "wedding" && <AdminWeddingInspiration />}
              {adminSection === "settings" && <AdminSettings />}
            </AdminLayout>
          ) : (
            <AdminLogin
              onLoginSuccess={(user) => {
                setAdminUser(user);
                setIsAdminLoggedIn(true);
                setAdminSection("dashboard");
                window.history.replaceState({}, "", "/admin/dashboard");
              }}
            />
          )
          }
          </Suspense>
        ) : (
          <div
            data-gnz-mode={lightMode ? "light" : "dark"}
            style={{
              minHeight: "100dvh", overflowX: "hidden",
            }}>
            <NavMobile
              onShowroom={() => scrollTo(showroomRef)}
              onGalerie={() => scrollTo(galleryRef)}
              onContact={() => window.open(`https://wa.me/33664826920?text=${encodeURIComponent((APP_COPY[lang] || APP_COPY.FR).waContact)}`, "_blank")}
              onCatalogue={() => openBooking(true)}
              onFormules={() => scrollTo(formulesRef)}
              onBiographie={() => scrollTo(heritageRef)}
              onReserver={() => openBooking(false)}
              onStyleDuMois={() => scrollTo(styleDuMoisRef)}
              onPartenaires={() => scrollTo(partenairesRef)}
              onStyleJournal={() => scrollTo(styleJournalRef)}
              onVideo={() => scrollTo(videoRef)}
              onWedding={() => scrollTo(weddingRef)}
              onActualites={() => scrollTo(actualitesRef)}
              onVIP={() => scrollTo(vipRef)}
              onCommunaute={() => scrollTo(communauteRef)}
              highContrast={highContrast}
              onToggleContrast={() => setHighContrast(v => !v)}
              lightMode={lightMode}
              onToggleDark={() => setLightMode(v => !v)}
            />

            <HeroMobile onScrollDown={() => scrollTo(heritageRef)} />
            <Suspense fallback={null}>
            <AboutSection />
            <SectionDivider from="#1c1208" to="#f5f0e8" />
            <HeritageMobile refEl={heritageRef} />
            <SectionDivider from="#f5f0e8" to="#0a0602" />
            <div ref={styleJournalRef}><StyleJournalSection /></div>
            <SectionDivider from="#0a0602" to="#f5f0e8" />
            <GalleryMobile refEl={galleryRef} />
            <SectionDivider from="#f5f0e8" to="#0a0602" />
            <div ref={videoRef}><VideoSection /></div>
            <SectionDivider from="#0a0602" to="#0a0602" />
            <WeddingInspirationSection refEl={weddingRef} />
            <SectionDivider from="#0a0602" to="#0d1b3e" />
            <FormulesSection refEl={formulesRef} onContact={() => window.open(`https://wa.me/33664826920?text=${encodeURIComponent((APP_COPY[lang] || APP_COPY.FR).waFormula)}`, "_blank")} />
            <SectionDivider from="#0d1b3e" to="#0a0602" />
            <PartnersSection refEl={partenairesRef} />
            <SectionDivider from="#0a0602" to="#0a0602" />
            <div ref={actualitesRef}><ActualitesSection /></div>
            <div ref={vipRef}><VIPClientsSection /></div>
            <SectionDivider from="#0f0a04" to="#f5f0e8" />
            <ShowroomMobile refEl={showroomRef} onCatalogue={() => openBooking(true)} onGalerie={() => scrollTo(galleryRef)} onFlammes={() => scrollTo(galleryRef)} />
            <InstagramSection />
            <SectionDivider from="#faf7f2" to="#0a0602" />
            <StyleDuMoisSection refEl={styleDuMoisRef} />
            <div ref={communauteRef}><CommunauteSection /></div>
            <FooterMobile onFormules={() => scrollTo(formulesRef)} onGalerie={() => scrollTo(galleryRef)} onShowroom={() => scrollTo(showroomRef)} />
            <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} boutiqueMode={boutiqueMode} onSwitchToBooking={() => setBoutiqueMode(false)} />
            <ChatBot onReserver={() => openBooking(false)} onGalerie={() => scrollTo(galleryRef)} onShowroom={() => scrollTo(showroomRef)} onFormules={() => scrollTo(formulesRef)} />
            </Suspense>
          </div>
        )
      )}

      {!currentlyOnAdminPath && !isAdminPath && (
        <>
          <NotificationPrompt visible={notifPrompt} onAccept={handleNotifAccept} onDecline={handleNotifDecline} />
          <CookieBanner />
        </>
      )}
    </LangCtx.Provider>
  );
}
