import { useEffect, useState } from "react";
import CookieBanner from "./CookieBanner.jsx";
import { disableGA, initGA } from "../services/analytics.js";
import { getConsentPreferences, subscribeToConsentChanges } from "../services/consent.js";

/**
 * Dedicated SEO routes bypass App.jsx for a lighter, crawlable render.
 * Keep the same consent gate here so GA is never loaded before opt-in.
 */
export default function PublicSeoEnvironment({ children }) {
  const [consentPreferences, setConsentPreferences] = useState(getConsentPreferences);

  useEffect(() => subscribeToConsentChanges(setConsentPreferences), []);

  useEffect(() => {
    if (!consentPreferences.analytics) {
      disableGA();
      return;
    }
    initGA();
  }, [consentPreferences.analytics]);

  return (
    <>
      {children}
      <CookieBanner />
    </>
  );
}
