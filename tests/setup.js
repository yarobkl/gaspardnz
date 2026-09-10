import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

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
vi.spyOn(console, "error").mockImplementation((...args) => {
  // Une erreur React non attendue doit faire échouer le test, pas se perdre
  // dans la sortie.
  throw new Error(`console.error inattendu : ${args.join(" ")}`);
});
