import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, CREAM } from "./constants.js";
import { LangCtx } from "./context.jsx";

import NotificationPrompt from "./components/NotificationPrompt.jsx";
import CookieBanner from "./components/CookieBanner.jsx";
import { initGAIfConsented } from "./services/analytics.js";
import { requestNotificationPermission } from "./services/notifications.js";
import NavMobile from "./components/NavMobile.jsx";
import HeroMobile from "./components/HeroMobile.jsx";
import HeritageMobile from "./components/HeritageMobile.jsx";
import ShowroomMobile from "./components/ShowroomMobile.jsx";
import GalleryMobile from "./components/GalleryMobile.jsx";
import BookingModal from "./components/BookingModal.jsx";
import ChatBot from "./components/ChatBot.jsx";

import SectionDivider from "./components/ui/SectionDivider.jsx";
import FormulesSection from "./components/sections/FormulesSection.jsx";
import ActualitesSection from "./components/sections/ActualitesSection.jsx";
import StyleJournalSection from "./components/sections/StyleJournalSection.jsx";
import InstagramSection from "./components/sections/InstagramSection.jsx";
import VIPClientsSection from "./components/sections/VIPSection.jsx";
import CommunauteSection from "./components/sections/CommunauteSection.jsx";
import StyleDuMoisSection from "./components/sections/StyleDuMoisSection.jsx";
import FooterMobile from "./components/FooterMobile.jsx";

const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Bebas+Neue&family=Montserrat:wght@200;300;400;500&display=swap');`;

const _SPLASH_IMG = (typeof import.meta !== "undefined" ? (import.meta.env.BASE_URL || "/") : "/") + "images/style-parisien.jpg";

const SplashScreen = ({ onDone }) => (
  <motion.div
    exit={{ opacity: 0 }}
    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#070400", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2.4rem", overflow: "hidden" }}>

    <motion.img
      src={_SPLASH_IMG}
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 0.45, scale: 1 }}
      transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
    />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(4,2,0,0.5) 0%, rgba(4,2,0,0.3) 40%, rgba(4,2,0,0.6) 100%)" }} />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
      <motion.p
        initial={{ letterSpacing: "0.12em", opacity: 0 }}
        animate={{ letterSpacing: "0.38em", opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3.5rem", color: "#faf7f2", margin: 0, lineHeight: 1, textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
        GASPARDNZ
      </motion.p>
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.3em" }}
        animate={{ opacity: 1, letterSpacing: "0.6em" }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", color: GOLD, textTransform: "uppercase", marginTop: "10px" }}>
        Paris
      </motion.p>
    </motion.div>

    <div style={{ position: "absolute", bottom: "0.8rem", left: 0, right: 0, zIndex: 1 }}>
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: "2.3rem", color: "rgba(245,240,232,0.92)", textAlign: "center", margin: "0 0 0.8rem", textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}>
        S'habiller autrement
      </motion.p>
      <div style={{ width: "100vw", height: "1px", background: "rgba(184,151,62,0.15)", position: "relative", overflow: "hidden" }}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 2.2, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={onDone}
          style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${GOLD}, #d4ae5a)`, transformOrigin: "left" }} />
      </div>
    </div>
  </motion.div>
);

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [notifPrompt, setNotifPrompt] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [boutiqueMode, setBoutiqueMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("gnz-lang") || "FR"; } catch { return "FR"; }
  });

  const showroomRef    = useRef(null);
  const heritageRef    = useRef(null);
  const galleryRef     = useRef(null);
  const formulesRef    = useRef(null);
  const styleDuMoisRef = useRef(null);

  useEffect(() => {
    if (!document.querySelector("style[data-gnz-fonts]")) {
      const s = document.createElement("style");
      s.setAttribute("data-gnz-fonts", "1");
      s.textContent = FONTS_CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    document.title = "Gaspardnz — L'Inspirateur de la Haute Allure · Paris";
    const meta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    meta("description", "Gaspardnz — Styliste parisien spécialisé dans l'habillage sur-mesure pour mariages, galas et événements. Découvrez nos formules et prenez rendez-vous.");
    meta("og:title", "Gaspardnz — L'Inspirateur de la Haute Allure", true);
    meta("og:description", "Costumes sur-mesure, looks événementiels et conseils style. Paris.", true);
    meta("og:type", "website", true);
    meta("theme-color", highContrast ? "#fff9e6" : "#0a0602");
  }, [highContrast]);

  useEffect(() => {
    document.body.style.background = "#0a0602";
    document.body.style.margin = "0";
    document.body.style.overflowX = "hidden";
    initGAIfConsented();
  }, []);

  useEffect(() => {
    if (!splashDone) return;
    const already = localStorage.getItem("gnz-notif-asked");
    if (already) return;
    const t = setTimeout(() => setNotifPrompt(true), 3500);
    return () => clearTimeout(t);
  }, [splashDone]);

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
    <LangCtx.Provider value={{ lang, setLang }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        button, input, textarea, select { font-family: inherit; }
        ${highContrast ? `
          body { filter: contrast(1.25) brightness(1.08); }
        ` : ""}
        ${lightMode ? `
          [data-gnz-mode="light"] section { filter: brightness(1.18) saturate(0.82); }
        ` : ""}
      `}</style>

      <AnimatePresence mode="wait">
        {!splashDone && <SplashScreen key="splash" onDone={() => setSplashDone(true)} />}
      </AnimatePresence>

      <div
        data-gnz-mode={lightMode ? "light" : "dark"}
        style={{
          minHeight: "100dvh", overflowX: "hidden",
          opacity: splashDone ? 1 : 0,
          pointerEvents: splashDone ? "auto" : "none",
          transition: splashDone ? "opacity 0.4s ease" : "none",
        }}>
        <NavMobile
          onShowroom={() => scrollTo(showroomRef)}
          onGalerie={() => scrollTo(galleryRef)}
          onContact={() => window.open("https://wa.me/33664826920?text=Bonjour%20Gaspard%2C%20je%20souhaite%20vous%20contacter.", "_blank")}
          onCatalogue={() => openBooking(true)}
          onFormules={() => scrollTo(formulesRef)}
          onBiographie={() => scrollTo(heritageRef)}
          onReserver={() => openBooking(false)}
          onStyleDuMois={() => scrollTo(styleDuMoisRef)}
          highContrast={highContrast}
          onToggleContrast={() => setHighContrast(v => !v)}
          lightMode={lightMode}
          onToggleDark={() => setLightMode(v => !v)}
        />

        <HeroMobile onScrollDown={() => scrollTo(heritageRef)} />
        <SectionDivider from="#1c1208" to="#f5f0e8" />
        <HeritageMobile refEl={heritageRef} />
        <SectionDivider from="#f5f0e8" to="#0a0602" />
        <StyleJournalSection />
        <SectionDivider from="#0a0602" to="#f5f0e8" />
        <GalleryMobile refEl={galleryRef} />
        <SectionDivider from="#f5f0e8" to="#0d1b3e" />
        <FormulesSection refEl={formulesRef} onContact={() => window.open(`https://wa.me/33664826920?text=${encodeURIComponent("Bonjour Gaspard, je souhaite réserver une formule. Pouvez-vous me recontacter ?")}`, "_blank")} />
        <SectionDivider from="#0d1b3e" to="#0a0602" />
        <ActualitesSection />
        <VIPClientsSection />
        <SectionDivider from="#0f0a04" to="#f5f0e8" />
        <ShowroomMobile refEl={showroomRef} onCatalogue={() => openBooking(true)} onGalerie={() => scrollTo(galleryRef)} onFlammes={() => scrollTo(galleryRef)} />
        <InstagramSection />
        <SectionDivider from="#faf7f2" to="#0a0602" />
        <StyleDuMoisSection refEl={styleDuMoisRef} />
        <CommunauteSection />
        <FooterMobile onFormules={() => scrollTo(formulesRef)} onGalerie={() => scrollTo(galleryRef)} onShowroom={() => scrollTo(showroomRef)} />
        <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} boutiqueMode={boutiqueMode} onSwitchToBooking={() => setBoutiqueMode(false)} />
        <ChatBot onReserver={() => openBooking(false)} onGalerie={() => scrollTo(galleryRef)} onShowroom={() => scrollTo(showroomRef)} onFormules={() => scrollTo(formulesRef)} />
      </div>
      <NotificationPrompt visible={notifPrompt} onAccept={handleNotifAccept} onDecline={handleNotifDecline} />
      <CookieBanner />
    </LangCtx.Provider>
  );
}
