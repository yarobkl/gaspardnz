import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LangCtx } from "../../src/context.jsx";

// Bug réel : `const content = aboutContent[t?.lang || "FR"]` lisait une
// propriété `.lang` sur `t`, qui est une FONCTION (useTr() renvoie
// `(k, ...a) => ...`, jamais un objet avec un champ `lang`). `t?.lang` valait
// donc toujours `undefined`, et la section restait figée en français quelle
// que soit la langue choisie par le visiteur.
const AboutSection = (await import("../../src/components/sections/AboutSection.jsx")).default;

const renderIn = (lang) => render(
  <LangCtx.Provider value={{ lang, setLang: () => {} }}>
    <AboutSection />
  </LangCtx.Provider>,
);

describe("AboutSection — suit vraiment la langue choisie", () => {
  it("affiche le texte anglais quand la langue est EN", () => {
    renderIn("EN");
    expect(screen.getByText("Client experience")).toBeInTheDocument();
    expect(screen.queryByText("Expérience client")).not.toBeInTheDocument();
  });

  it("affiche le texte espagnol quand la langue est ES", () => {
    renderIn("ES");
    expect(screen.getByText("Experiencia cliente")).toBeInTheDocument();
  });

  it("reste en français par défaut", () => {
    renderIn("FR");
    expect(screen.getByText("Expérience client")).toBeInTheDocument();
  });
});
