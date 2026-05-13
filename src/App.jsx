import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, CREAM } from "./constants.js";
import { LangCtx } from "./context.jsx";

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
import TikTokViralSection from "./components/sections/TikTokSection.jsx";
import InstagramSection from "./components/sections/InstagramSection.jsx";
import VIPClientsSection from "./components/sections/VIPSection.jsx";
import TestimonialsSection from "./components/sections/TestimonialsSection.jsx";
import CommunauteSection from "./components/sections/CommunauteSection.jsx";
import StyleDuMoisSection from "./components/sections/StyleDuMoisSection.jsx";
import FooterMobile from "./components/FooterMobile.jsx";

/* ── Google Fonts injection ─────────────────────────────────────── */
const FONTS_CSS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Bebas+Neue&family=Montserrat:wght@200;300;400;500&display=swap');`;

/* ── Splash Screen ──────────────────────────────────────────────── */
const SplashScreen = ({ onDone }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) { p = 100; clearInterval(id); setTimeout(onDone, 400); }
      setProgress(p);
    }, 80);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#070400", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "3.5rem", letterSpacing: "0.35em", color: "#faf7f2", margin: 0, lineHeight: 1 }}>GASPARDNZ</p>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.6em", color: GOLD, textTransform: "uppercase", textAlign: "center", marginTop: "8px" }}>Paris</p>
      </motion.div>
      <div style={{ width: "140px", height: "1px", background: "rgba(184,151,62,0.2)", position: "relative" }}>
        <motion.div style={{ position: "absolute", inset: 0, background: GOLD, transformOrigin: "left", scaleX: progress / 100 }} transition={{ ease: "linear" }} />
      </div>
      <motion.p
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.5em", color: "rgba(245,240,232,0.4)", textTransform: "uppercase" }}>
        Chargement…
      </motion.p>
    </motion.div>
  );
};

/* ── Main App ───────────────────────────────────────────────────── */
export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [boutiqueMode, setBoutiqueMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("gnz-lang") || "FR"; } catch { return "FR"; }
  });

  const showroomRef = useRef(null);
  const heritageRef = useRef(null);
  const galleryRef  = useRef(null);
  const formulesRef = useRef(null);

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
  }, []);

  const scrollTo = (ref) => { ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const openBooking = (boutique = false) => { setBoutiqueMode(boutique); setBookingOpen(true); };

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
          section[data-dark="1"] { background: #1a1510 !important; }
        ` : ""}
      `}</style>

      <AnimatePresence mode="wait">
        {!splashDone && <SplashScreen key="splash" onDone={() => setSplashDone(true)} />}
      </AnimatePresence>

      {splashDone && (
        <div style={{ minHeight: "100dvh", overflowX: "hidden" }}>
          <NavMobile
            onShowroom={() => scrollTo(showroomRef)}
            onGalerie={() => scrollTo(galleryRef)}
            onContact={() => window.open("https://wa.me/33664826920?text=Bonjour%20Gaspard%2C%20je%20souhaite%20vous%20contacter.", "_blank")}
            onCatalogue={() => openBooking(true)}
            onFormules={() => scrollTo(formulesRef)}
            onBiographie={() => scrollTo(heritageRef)}
            onReserver={() => openBooking(false)}
            highContrast={highContrast}
            onToggleContrast={() => setHighContrast(v => !v)}
            lightMode={lightMode}
            onToggleDark={() => setLightMode(v => !v)}
          />

          <HeroMobile onScrollDown={() => scrollTo(heritageRef)} />
          <HeritageMobile refEl={heritageRef} />
          <SectionDivider />
          <ShowroomMobile refEl={showroomRef} onCatalogue={() => openBooking(true)} onGalerie={() => scrollTo(galleryRef)} />
          <SectionDivider />
          <FormulesSection refEl={formulesRef} />
          <SectionDivider />
          <GalleryMobile refEl={galleryRef} />
          <ActualitesSection />
          <StyleJournalSection />
          <TikTokViralSection />
          <InstagramSection />
          <VIPClientsSection />
          <TestimonialsSection />
          <StyleDuMoisSection />
          <CommunauteSection />
          <FooterMobile onFormules={() => scrollTo(formulesRef)} onGalerie={() => scrollTo(galleryRef)} onShowroom={() => scrollTo(showroomRef)} />
          <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} boutiqueMode={boutiqueMode} />
          <ChatBot onReserver={() => openBooking(false)} onGalerie={() => scrollTo(galleryRef)} onShowroom={() => scrollTo(showroomRef)} onFormules={() => scrollTo(formulesRef)} />
        </div>
      )}
    </LangCtx.Provider>
  );
}
