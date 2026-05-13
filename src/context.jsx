import { createContext, useContext } from "react";
import { T } from "./translations.js";

export const LangCtx = createContext({ lang: "FR", setLang: () => {} });

export const useTr = () => {
  const { lang } = useContext(LangCtx);
  return (k, ...a) => { const v = T[lang]?.[k] ?? T.FR[k] ?? k; return typeof v === "function" ? v(...a) : v; };
};
