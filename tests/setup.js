import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// tests/api/ tourne en environnement Node (pas de DOM) : ce fichier de
// configuration reste partagé, donc tout ce qui suppose jsdom doit être
// gardé derrière cette détection plutôt que de planter ces tests-là.
const hasDom = typeof document !== "undefined";

afterEach(() => {
  if (!hasDom) return;
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

if (hasDom) {
  // Le site utilise IntersectionObserver et matchMedia, absents de jsdom.
  globalThis.IntersectionObserver ??= class {
    observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
  };
  globalThis.matchMedia ??= (query) => ({
    matches: false, media: query, onchange: null,
    addEventListener() {}, removeEventListener() {},
    addListener() {}, removeListener() {}, dispatchEvent() { return false; },
  });
  globalThis.scrollTo ??= () => {};
  // jsdom ne fournit pas scrollIntoView (utilisé pour amener le formulaire
  // d'édition admin dans le champ visible sur mobile).
  Element.prototype.scrollIntoView ??= function () {};
}
vi.spyOn(console, "error").mockImplementation((...args) => {
  // Une erreur React non attendue doit faire échouer le test, pas se perdre
  // dans la sortie.
  throw new Error(`console.error inattendu : ${args.join(" ")}`);
});
