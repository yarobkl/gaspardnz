import { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, TEXT } from "../constants.js";
import { LangCtx, useTr } from "../context.jsx";
import { SvgInstagram, SvgTiktok, SvgYoutube, SvgBag } from "../icons.jsx";
import { useSettings } from "../hooks/useSettings.js";

const NavMobile = ({ onShowroom, onGalerie, onContact, onCatalogue, onFormules, highContrast, onToggleContrast, onBiographie, onReserver, lightMode, onToggleDark, onStyleDuMois }) => {
  const { lang, setLang } = useContext(LangCtx);
  const t = useTr();
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigating = useRef(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (open) {
      const y = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.width = "100%";
    } else {
      const y = Math.abs(parseInt(document.body.style.top || "0"));
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (!navigating.current) window.scrollTo(0, y);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [open]);

  const close = (fn) => {
    if (fn) navigating.current = true;
    setLangOpen(false);
    setOpen(false);
    if (fn) setTimeout(() => { navigating.current = false; fn(); }, 60);
  };
  const chooseLang = (nextLang) => {
    setLang(nextLang);
    setLangOpen(false);
  };

  const navLight = !scrolled && !open;
  const navTextColor = navLight ? "#f5f0e8" : TEXT;

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 700,
        paddingTop: "calc(env(safe-area-inset-top) + 1rem)",
        paddingBottom: "1rem", paddingLeft: "1.4rem", paddingRight: "1.4rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: scrolled || open ? "rgba(245,240,232,0.97)" : "transparent",
        borderBottom: scrolled || open ? "1px solid rgba(184,151,62,0.25)" : "1px solid transparent",
        transition: "background 0.4s, border 0.4s, color 0.4s",
        }}>
        <button onClick={() => close(() => window.scrollTo({ top: 0, behavior: "smooth" }))}
          aria-label={t("nav_top")}
          style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", minHeight: "44px", padding: "5px 0" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "0.3em", color: navTextColor, lineHeight: 1, transition: "color 0.4s" }}>Gaspardnz</div>
          <div style={{ fontSize: "7px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginTop: "3px" }}>Paris</div>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <motion.button onClick={onToggleContrast} whileTap={{ scale: 0.88 }}
            aria-label={highContrast ? t("nav_contrast_off") : t("nav_contrast_on")}
            style={{ background: "none", border: "none", cursor: "pointer", color: highContrast ? GOLD : navTextColor, transition: "color 0.4s", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, width: "44px", height: "44px" }}>
            <motion.div
              animate={{ rotate: highContrast ? 180 : 0, scale: highContrast ? 1.15 : 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {highContrast && <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.8, opacity: 1 }} transition={{ duration: 0.4 }} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, rgba(184,151,62,0.35) 0%, transparent 70%)` }} />}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
                <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>
              </svg>
            </motion.div>
          </motion.button>

          <motion.button onClick={onToggleDark} whileTap={{ scale: 0.95 }}
            aria-label={lightMode ? t("nav_night") : t("nav_day")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", minWidth: "62px", height: "44px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", background: lightMode ? "#faf7f2" : "rgba(255,255,255,0.12)", border: `1px solid ${lightMode ? GOLD : "rgba(255,255,255,0.25)"}`, borderRadius: "20px", padding: "4px 8px", transition: "all 0.35s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={lightMode ? "#333" : "rgba(255,255,255,0.5)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.3s" }} aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <div style={{ width: "1px", height: "12px", background: lightMode ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)" }} />
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={lightMode ? GOLD : "rgba(255,255,255,0.35)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.3s" }} aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/></svg>
            </div>
          </motion.button>

          {(() => {
            const LANGS = ["FR","EN","ES","ZH"];
            return (
              <div style={{ position: "relative" }}>
                <motion.button onClick={() => setLangOpen(v => !v)} whileTap={{ scale: 0.88 }}
                  aria-label={t("nav_language", lang)}
                  aria-expanded={langOpen}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", padding: 0, color: navTextColor, transition: "color 0.4s", width: "44px", height: "44px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "5px", letterSpacing: "0.3em", color: GOLD }}>{lang}</span>
                </motion.button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      style={{ position: "absolute", top: "42px", right: 0, display: "grid", gap: "4px", background: "rgba(245,240,232,0.98)", border: `1px solid rgba(184,151,62,0.3)`, padding: "8px", zIndex: 720, boxShadow: "0 12px 32px rgba(0,0,0,0.16)" }}>
                      {LANGS.map(l => (
                        <button key={l} onClick={() => chooseLang(l)}
                          style={{ background: lang === l ? "rgba(184,151,62,0.12)" : "transparent", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.24em", color: lang === l ? GOLD : TEXT, padding: "10px 9px", minWidth: "44px", minHeight: "44px", textAlign: "center" }}>
                          {l}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}

          <motion.button onClick={onCatalogue} whileTap={{ scale: 0.88 }}
            aria-label={t("nav_open_shop")}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", padding: 0, color: navTextColor, transition: "color 0.4s", width: "44px", height: "44px", position: "relative" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", top: "-3px", right: "-4px", width: "7px", height: "7px", background: GOLD, borderRadius: "50%", border: "1.5px solid rgba(245,240,232,0.9)" }} />
            </div>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "5px", letterSpacing: "0.3em", color: GOLD, userSelect: "none" }}>SHOP</span>
          </motion.button>

          <button onClick={() => setOpen(v => !v)}
            aria-label={open ? t("nav_close_menu") : t("nav_open_menu")}
            aria-expanded={open}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", width: "44px", height: "44px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }} transition={{ duration: 0.3 }}
              style={{ display: "block", width: "24px", height: "1.5px", background: open ? GOLD : navTextColor, transition: "background 0.4s" }} />
            <motion.span animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }} transition={{ duration: 0.2 }}
              style={{ display: "block", width: "16px", height: "1.5px", background: navTextColor, transition: "background 0.4s" }} />
            <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }} transition={{ duration: 0.3 }}
              style={{ display: "block", width: "24px", height: "1.5px", background: open ? GOLD : navTextColor, transition: "background 0.4s" }} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", top: "calc(env(safe-area-inset-top) + 64px)", left: 0, right: 0, bottom: 0, zIndex: 699,
              background: "rgba(245,240,232,0.98)", borderBottom: `1px solid rgba(184,151,62,0.12)`,
              padding: "2rem 1.4rem 2.5rem",
              backdropFilter: "blur(20px)",
              overflowY: "auto",
            }}
          >
            {[
              [t("nav_reveler"), onReserver],
              [t("nav_bio"), onBiographie],
              [t("nav_showroom"), onShowroom],
              [t("nav_formules"), onFormules],
              [t("nav_galerie"), onGalerie],
              [t("style_month"), onStyleDuMois],
              [t("lookbook"), () => { const a = document.createElement("a"); a.href = `${import.meta.env.BASE_URL}lookbook-gaspardnz.pdf`; a.download = "Lookbook-GaspardNZ-2025.pdf"; a.click(); }],
            ].map(([label, fn], i) => (
              <motion.button key={label}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                onClick={() => close(fn)}
                style={{ display: "block", width: "100%", background: "none", border: "none", textAlign: "left", cursor: "pointer", padding: "1.1rem 0", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", letterSpacing: "0.08em", color: label === t("lookbook") ? GOLD : TEXT, borderBottom: "1px solid rgba(28,18,8,0.07)" }}
              >
                {label}{label === t("lookbook") && <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.3em", marginLeft: "10px", opacity: 0.7 }}>↓ PDF</span>}
              </motion.button>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              onClick={() => close(onCatalogue)}
              style={{ marginTop: "1.8rem", width: "100%", background: "none", border: `1px solid rgba(184,151,62,0.4)`, color: GOLD, padding: "1rem", fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.4em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
            >
              <SvgBag /><span>{t("nav_boutique")}</span>
            </motion.button>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              style={{ display: "flex", gap: "1.2rem", marginTop: "1.8rem", justifyContent: "center" }}>
              {[[SvgInstagram, settings.instagramUrl || "https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq", "Instagram"], [SvgTiktok, "https://www.tiktok.com/@gaspardnz?_r=1&_t=ZS-95wB65ZWhvB", "TikTok"], [SvgYoutube, "https://youtube.com/@gaspardnz?si=s4saxiuv7rt9iUmT", "YouTube"]].map(([Icon, href, label], i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{ color: "rgba(28,18,8,0.72)", transition: "color 0.3s" }}
                  onTouchStart={e => e.currentTarget.style.color = GOLD}
                  onTouchEnd={e => e.currentTarget.style.color = "rgba(28,18,8,0.4)"}
                ><span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px" }}><Icon /></span></a>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "1.4rem" }}>
              {["FR", "EN", "ES", "ZH"].map(l => (
                <button key={l} onClick={() => chooseLang(l)}
                  aria-label={t("nav_switch_lang", l)}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.3em", padding: "4px 6px", minWidth: "44px", minHeight: "44px",
                    color: lang === l ? GOLD : "rgba(28,18,8,0.3)", borderBottom: lang === l ? `1px solid ${GOLD}` : "1px solid transparent", transition: "all 0.3s" }}>
                  {l}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavMobile;
