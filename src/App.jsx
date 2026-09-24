import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { GOLD, CREAM } from "./constants.js";
import { LangCtx } from "./context.jsx";
import { APP_COPY } from "./data/appCopy.js";

import NotificationPrompt from "./components/NotificationPrompt.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import AdminRoot from "./components/AdminRoot.jsx";
import useAdminSession from "./hooks/useAdminSession.js";
import useSeoMeta from "./hooks/useSeoMeta.js";
import useStructuredData from "./hooks/useStructuredData.js";
import { disableGA, initGA } from "./services/analytics.js";
import { requestNotificationPermission } from "./services/notifications.js";
import { trackPageView } from "./services/adminAnalytics.js";
import { clearAllTrackingData, initializeTracking, trackPageView as trackDetailedPageView } from "./services/analyticsTracking.js";
import { clearSupabaseTrackingData, initializeSupabaseTracking } from "./services/siteTracking.js";
import { getConsentPreferences, hasConsentDecision, subscribeToConsentChanges } from "./services/consent.js";
import NavMobile from "./components/NavMobile.jsx";
import HeroMobile from "./components/HeroMobile.jsx";
import useCompactMobile from "./hooks/useCompactMobile.js";
import MobileHomeCompact from "./components/MobileHomeCompact.jsx";
import CommunityWhatsAppLink from "./components/CommunityWhatsAppLink.jsx";
import { useSettings } from "./hooks/useSettings.js";
import { getWhatsappUrl } from "./utils/whatsappUtil.js";

import SectionDivider from "./components/ui/SectionDivider.jsx";

const AboutSection = lazy(() => import("./components/sections/AboutSection.jsx"));
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
const PartnersSection = lazy(() => import("./components/sections/PartnersSection.jsx"));

const FONTS_CSS = "";
const SUPPORTED_LANGS = ["FR", "EN", "ES", "ZH"];
const HTML_LANG = { FR: "fr", EN: "en", ES: "es", ZH: "zh" };

// Repli d'une rubrique mobile pendant que son code se charge (premier clic
// de la session sur cette rubrique). Avant, une seule frontière Suspense
// couvrait toute la page : ouvrir UNE rubrique faisait disparaître la grille
// "Explorer l'univers", le pied de page et le chatbot le temps du
// téléchargement, pas seulement le contenu concerné.
const SectionFallback = () => (
  <div style={{ minHeight: "46vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0602" }}>
    <div className="gnz-section-spinner" aria-hidden="true" />
  </div>
);

// Fait défiler vers une rubrique mobile une fois sa mise en page stable —
// pas à un délai fixe deviné à l'avance. Une rubrique ouverte pour la
// première fois charge son code en différé (import lazy) : un scroll lancé
// trop tôt vise un espace encore vide, et un second scroll concurrent lancé
// "au cas où" annule le premier en plein vol (defilement saccadé, l'ouverture
// d'une rubrique n'était pas fluide). On attend deux images consécutives où
// la position de la cible n'a pas bougé avant de lancer UN SEUL scroll fluide.
const scrollToStableTarget = (id, attempt = 0, lastTop = null) => {
  if (typeof window === "undefined") return;
  const el = document.getElementById(id);
  if (!el) {
    if (attempt < 40) window.requestAnimationFrame(() => scrollToStableTarget(id, attempt + 1, lastTop));
    return;
  }
  const top = el.getBoundingClientRect().top;
  if (lastTop !== null && Math.abs(top - lastTop) < 1) {
    window.scrollTo({ top: Math.max(0, top + window.scrollY - 68), behavior: "smooth" });
    return;
  }
  if (attempt < 40) window.requestAnimationFrame(() => scrollToStableTarget(id, attempt + 1, top));
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
  const {
    currentlyOnAdminPath, isAdminPath, isAdminLoggedIn, adminUser,
    adminAuthChecking, adminSection, onSectionChange: onAdminSectionChange, onLoginSuccess,
  } = useAdminSession();
  const [consentPreferences, setConsentPreferences] = useState(getConsentPreferences);
  const isCompactMobile = useCompactMobile();
  const settings = useSettings();
  const [mobileSection, setMobileSection] = useState(null);
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

  useEffect(() => {
    if (!document.querySelector("style[data-gnz-fonts]")) {
      const s = document.createElement("style");
      s.setAttribute("data-gnz-fonts", "1");
      s.textContent = FONTS_CSS;
      document.head.appendChild(s);
    }
  }, []);

  useSeoMeta(lang, highContrast);
  useStructuredData();

  useEffect(() => subscribeToConsentChanges(setConsentPreferences), []);

  useEffect(() => {
    const onAdmin = currentlyOnAdminPath || isAdminPath;
    if (onAdmin) {
      disableGA({ clearCookies: false });
      return undefined;
    }

    if (!consentPreferences.analytics) {
      disableGA();
      clearAllTrackingData();
      clearSupabaseTrackingData();
      return undefined;
    }

    initGA();
    const cleanupLocalTracking = initializeTracking();
    const cleanupSupabaseTracking = initializeSupabaseTracking();
    return () => {
      cleanupLocalTracking?.();
      cleanupSupabaseTracking?.();
    };
  }, [consentPreferences.analytics, currentlyOnAdminPath, isAdminPath]);

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
      if (!hasConsentDecision()) return;
      if (!document.hidden) setNotifPrompt(true);
    }, 14000);
    return () => clearTimeout(t);
  }, [currentlyOnAdminPath, isAdminPath, splashDone]);

  useEffect(() => {
    if (splashDone && !isAdminPath && consentPreferences.analytics) {
      trackPageView(window.location.pathname);
      trackDetailedPageView(window.location.pathname);
    }
  }, [splashDone, isAdminPath, consentPreferences.analytics]);

  const scrollTo = (ref) => { ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const handleMobileSectionSelect = (key) => {
    setMobileSection(key);
    window.requestAnimationFrame(() => scrollToStableTarget(key ? "gnz-mobile-active-section" : "gnz-mobile-home"));
  };
  const openMobileSection = (key, ref) => {
    if (!isCompactMobile) {
      scrollTo(ref);
      return;
    }
    handleMobileSectionSelect(key);
  };
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
      <MotionConfig reducedMotion="user">
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
        ${(highContrast || lightMode) ? `
          /* Section par section, jamais sur toute la page : un filter posé
             sur le conteneur entier empêchait l'affichage des vidéos sur
             iPhone (écran noir). Les modals/overlays sont rendus via un
             portail (components/ui/Portal.jsx), hors des sections, donc ce
             filter ne décale plus leur position. */
          #gnz-app-root section { filter: ${[highContrast && "contrast(1.25) brightness(1.08)", lightMode && "brightness(1.18) saturate(0.82)"].filter(Boolean).join(" ")}; }
        ` : ""}
        @keyframes gnz-spin { to { transform: rotate(360deg); } }
        .gnz-section-spinner { width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(184,151,62,.25); border-top-color: ${GOLD}; animation: gnz-spin .8s linear infinite; }
      `}</style>

      <AnimatePresence mode="wait">
        {!currentlyOnAdminPath && !isAdminPath && !splashDone && <SplashScreen key="splash" loading={(APP_COPY[lang] || APP_COPY.FR).loading} onDone={finishSplash} />}
      </AnimatePresence>

      {(splashDone || currentlyOnAdminPath || isAdminPath) && (
        (currentlyOnAdminPath || isAdminPath) ? (
          <AdminRoot
            adminAuthChecking={adminAuthChecking}
            isAdminLoggedIn={isAdminLoggedIn}
            adminUser={adminUser}
            adminSection={adminSection}
            onSectionChange={onAdminSectionChange}
            onLoginSuccess={onLoginSuccess}
          />
        ) : (
          <>
            {/* Hors de #gnz-app-root : ce conteneur porte le filter des modes
                jour / contraste élevé, qui fait défiler avec la page tout
                élément position:fixed placé à l'intérieur. Reste le premier
                élément du DOM, donc l'ordre de tabulation ne change pas. */}
            <NavMobile
              onShowroom={() => scrollTo(showroomRef)}
              onGalerie={() => openMobileSection("gallery", galleryRef)}
              onContact={() => window.open(getWhatsappUrl(settings.whatsappNumber, (APP_COPY[lang] || APP_COPY.FR).waContact), "_blank")}
              onCatalogue={() => openBooking(true)}
              onFormules={() => openMobileSection("formules", formulesRef)}
              onBiographie={() => openMobileSection("heritage", heritageRef)}
              onReserver={() => openBooking(false)}
              onStyleDuMois={() => openMobileSection("styleMonth", styleDuMoisRef)}
              onPartenaires={() => openMobileSection("partners", partenairesRef)}
              onStyleJournal={() => openMobileSection("journal", styleJournalRef)}
              onVideo={() => openMobileSection("video", videoRef)}
              onWedding={() => openMobileSection("wedding", weddingRef)}
              onActualites={() => openMobileSection("news", actualitesRef)}
              onVIP={() => openMobileSection("vip", vipRef)}
              onCommunaute={() => openMobileSection("community", communauteRef)}
              highContrast={highContrast}
              onToggleContrast={() => setHighContrast(v => !v)}
              lightMode={lightMode}
              onToggleDark={() => setLightMode(v => !v)}
            />
          <div
            id="gnz-app-root"
            data-gnz-mode={lightMode ? "light" : "dark"}
            style={{
              minHeight: "100dvh", overflowX: "hidden",
            }}>
            <ErrorBoundary lang={lang}>

            <HeroMobile onScrollDown={() => isCompactMobile ? document.getElementById("gnz-mobile-home")?.scrollIntoView({ behavior: "smooth", block: "start" }) : scrollTo(heritageRef)} />
            {isCompactMobile ? (
              <>
                <MobileHomeCompact activeSection={mobileSection} onSelect={handleMobileSectionSelect} />

                {/* Frontière Suspense dédiée à la rubrique ouverte : le premier
                    chargement d'une rubrique (import différé) ne fait plus
                    disparaître la grille au-dessus ni le pied de page en dessous,
                    seulement ce bloc affiche un repli le temps du téléchargement. */}
                {mobileSection && (
                  <div id="gnz-mobile-active-section">
                    <Suspense fallback={<SectionFallback />}>
                      {mobileSection === "heritage" && (
                        <>
                          <AboutSection />
                          <SectionDivider from="#1c1208" to={CREAM} />
                          <HeritageMobile refEl={heritageRef} />
                        </>
                      )}
                      {mobileSection === "journal" && <div ref={styleJournalRef}><StyleJournalSection /></div>}
                      {mobileSection === "gallery" && <GalleryMobile refEl={galleryRef} />}
                      {mobileSection === "video" && <div ref={videoRef}><VideoSection /></div>}
                      {mobileSection === "wedding" && <WeddingInspirationSection refEl={weddingRef} />}
                      {mobileSection === "formules" && <FormulesSection refEl={formulesRef} onContact={() => window.open(getWhatsappUrl(settings.whatsappNumber, (APP_COPY[lang] || APP_COPY.FR).waFormula), "_blank")} />}
                      {mobileSection === "partners" && <PartnersSection refEl={partenairesRef} />}
                      {mobileSection === "news" && <div ref={actualitesRef}><ActualitesSection /></div>}
                      {mobileSection === "vip" && <div ref={vipRef}><VIPClientsSection /></div>}
                      {mobileSection === "styleMonth" && <StyleDuMoisSection refEl={styleDuMoisRef} />}
                      {mobileSection === "community" && <div ref={communauteRef}><CommunauteSection /></div>}
                    </Suspense>
                  </div>
                )}

                <Suspense fallback={null}>
                  <SectionDivider from="#0a0602" to={CREAM} />
                  <ShowroomMobile refEl={showroomRef} onCatalogue={() => openBooking(true)} onGalerie={() => openMobileSection("gallery", galleryRef)} onFlammes={() => openMobileSection("gallery", galleryRef)} />
                  <CommunityWhatsAppLink />
                  <FooterMobile onFormules={() => openMobileSection("formules", formulesRef)} onGalerie={() => openMobileSection("gallery", galleryRef)} onShowroom={() => scrollTo(showroomRef)} />
                </Suspense>
              </>
            ) : (
              <Suspense fallback={null}>
                <AboutSection />
                <SectionDivider from="#1c1208" to={CREAM} />
                <HeritageMobile refEl={heritageRef} />
                <SectionDivider from={CREAM} to="#0a0602" />
                <div ref={styleJournalRef}><StyleJournalSection /></div>
                <SectionDivider from="#0a0602" to={CREAM} />
                <GalleryMobile refEl={galleryRef} />
                <SectionDivider from={CREAM} to="#0a0602" />
                <div ref={videoRef}><VideoSection /></div>
                <SectionDivider from="#0a0602" to="#0a0602" />
                <WeddingInspirationSection refEl={weddingRef} />
                <SectionDivider from="#0a0602" to="#0d1b3e" />
                <FormulesSection refEl={formulesRef} onContact={() => window.open(getWhatsappUrl(settings.whatsappNumber, (APP_COPY[lang] || APP_COPY.FR).waFormula), "_blank")} />
                <SectionDivider from="#0d1b3e" to="#0a0602" />
                <PartnersSection refEl={partenairesRef} />
                <SectionDivider from="#0a0602" to="#0a0602" />
                <div ref={actualitesRef}><ActualitesSection /></div>
                <div ref={vipRef}><VIPClientsSection /></div>
                <SectionDivider from="#0f0a04" to={CREAM} />
                <ShowroomMobile refEl={showroomRef} onCatalogue={() => openBooking(true)} onGalerie={() => scrollTo(galleryRef)} onFlammes={() => scrollTo(galleryRef)} />
                <InstagramSection />
                <SectionDivider from="#faf7f2" to="#0a0602" />
                <StyleDuMoisSection refEl={styleDuMoisRef} />
                <div ref={communauteRef}><CommunauteSection /></div>
                <FooterMobile onFormules={() => scrollTo(formulesRef)} onGalerie={() => scrollTo(galleryRef)} onShowroom={() => scrollTo(showroomRef)} />
              </Suspense>
            )}
            <Suspense fallback={null}>
              <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} boutiqueMode={boutiqueMode} onSwitchToBooking={() => setBoutiqueMode(false)} />
              <ChatBot onReserver={() => openBooking(false)} onGalerie={() => openMobileSection("gallery", galleryRef)} onShowroom={() => scrollTo(showroomRef)} onFormules={() => openMobileSection("formules", formulesRef)} />
            </Suspense>
            </ErrorBoundary>
          </div>
          </>
        )
      )}

      {!currentlyOnAdminPath && !isAdminPath && (
        <>
          <NotificationPrompt visible={notifPrompt} onAccept={handleNotifAccept} onDecline={handleNotifDecline} />
          <CookieBanner />
        </>
      )}
      </MotionConfig>
    </LangCtx.Provider>
  );
}
