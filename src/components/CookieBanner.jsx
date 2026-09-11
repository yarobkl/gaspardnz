import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD } from "../constants.js";
import { useTr } from "../context.jsx";
import {
  getConsentPreferences,
  hasConsentDecision,
  saveConsentPreferences,
  subscribeToCookieSettingsRequests,
} from "../services/consent.js";

const CookieBanner = () => {
  const t = useTr();
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [draft, setDraft] = useState(() => getConsentPreferences());
  const panelRef = useRef(null);

  useEffect(() => {
    const openSettings = () => {
      setDraft(getConsentPreferences());
      setShowPreferences(true);
      setVisible(true);
      window.setTimeout(() => panelRef.current?.focus(), 0);
    };
    const unsubscribe = subscribeToCookieSettingsRequests(openSettings);
    const timer = hasConsentDecision() ? null : window.setTimeout(() => setVisible(true), 1200);

    return () => {
      unsubscribe();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape" || !hasConsentDecision()) return;
      setVisible(false);
      setShowPreferences(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  const applyPreferences = (preferences) => {
    saveConsentPreferences(preferences);
    setVisible(false);
    setShowPreferences(false);
  };

  const buttonStyle = {
    flex: 1,
    borderRadius: "30px",
    padding: "0.62rem",
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "10px",
    letterSpacing: "0.13em",
    textTransform: "uppercase",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: "44px",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
          tabIndex={-1}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          style={{ position: "fixed", bottom: "max(0.85rem, env(safe-area-inset-bottom))", left: "0.85rem", right: "0.85rem", maxWidth: "520px", maxHeight: "calc(100vh - 1.7rem)", overflowY: "auto", margin: "0 auto", zIndex: 640, background: "rgba(15,10,4,0.97)", backdropFilter: "blur(18px)", border: "1px solid rgba(184,151,62,0.28)", borderRadius: "12px", padding: "1rem", display: "grid", gridTemplateColumns: "1fr", gap: "0.8rem", boxShadow: "0 10px 28px rgba(0,0,0,0.34)", outline: "none" }}
        >
          <strong id="cookie-consent-title" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#faf7f2", letterSpacing: "0.08em" }}>
            {showPreferences ? t("cookie_preferences_title") : t("cookie_title")}
          </strong>
          <p id="cookie-consent-description" style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.75)", lineHeight: 1.6, margin: 0 }}>
            {t("cookie_text")}
          </p>
          {showPreferences ? (
            <>
              {[
                ["necessary", true, true, t("cookie_necessary"), t("cookie_necessary_desc")],
                ["analytics", draft.analytics, false, t("cookie_analytics"), t("cookie_analytics_desc")],
                ["marketing", draft.marketing, false, t("cookie_marketing"), t("cookie_marketing_desc")],
              ].map(([key, checked, disabled, label, description]) => (
                <label key={key} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.3rem 0.8rem", alignItems: "center", padding: "0.65rem", border: "1px solid rgba(245,240,232,0.12)", borderRadius: "8px", cursor: disabled ? "default" : "pointer" }}>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", color: "#faf7f2", fontSize: "11px", fontWeight: 700 }}>{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(checked)}
                    disabled={Boolean(disabled)}
                    onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.checked }))}
                    style={{ width: "20px", height: "20px", accentColor: GOLD }}
                  />
                  <span style={{ gridColumn: "1 / -1", fontFamily: "'Montserrat', sans-serif", color: "rgba(245,240,232,0.65)", fontSize: "9px", lineHeight: 1.5 }}>{description}</span>
                </label>
              ))}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
                <button onClick={() => applyPreferences({ analytics: false, marketing: false })} style={{ ...buttonStyle, background: "none", color: "#faf7f2", border: "1px solid rgba(245,240,232,0.35)" }}>{t("cookie_decline_all")}</button>
                <button onClick={() => applyPreferences(draft)} style={{ ...buttonStyle, background: GOLD, color: "#0a0602", border: `1px solid ${GOLD}` }}>{t("cookie_save")}</button>
                <button onClick={() => applyPreferences({ analytics: true, marketing: true })} style={{ ...buttonStyle, background: "none", color: GOLD, border: `1px solid ${GOLD}` }}>{t("cookie_accept_all")}</button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
              <button onClick={() => applyPreferences({ analytics: false, marketing: false })} style={{ ...buttonStyle, background: "none", color: "#faf7f2", border: "1px solid rgba(245,240,232,0.35)" }}>{t("cookie_decline_all")}</button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => applyPreferences({ analytics: true, marketing: true })} style={{ ...buttonStyle, background: GOLD, color: "#0a0602", border: `1px solid ${GOLD}` }}>{t("cookie_accept_all")}</motion.button>
              <button onClick={() => { setDraft(getConsentPreferences()); setShowPreferences(true); }} style={{ ...buttonStyle, flexBasis: "100%", background: "none", color: "rgba(245,240,232,0.8)", border: "1px solid rgba(245,240,232,0.16)" }}>{t("cookie_customize")}</button>
            </div>
          )}
          <a href="/confidentialite.html" target="_blank" rel="noopener noreferrer" style={{ color: GOLD, fontFamily: "'Montserrat', sans-serif", fontSize: "9px", textAlign: "center" }}>
            {t("cookie_privacy_link")}
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
