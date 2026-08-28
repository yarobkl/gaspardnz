import { createContext, useContext, useSyncExternalStore } from "react";
import { T } from "./translations.js";
import { getSiteContentServerSnapshot, getSiteContentSnapshot, subscribeSiteContent } from "./services/siteContentOverrides.js";

export const LangCtx = createContext({ lang: "FR", setLang: () => {} });

export const useTr = () => {
  const { lang } = useContext(LangCtx);
  const overrides = useSyncExternalStore(subscribeSiteContent, getSiteContentSnapshot, getSiteContentServerSnapshot);
  return (k, ...a) => {
    const overridden = overrides?.[lang]?.[k] ?? overrides?.FR?.[k];
    if (typeof overridden === "string") return overridden;
    const v = T[lang]?.[k] ?? T.FR[k] ?? k;
    return typeof v === "function" ? v(...a) : v;
  };
};
