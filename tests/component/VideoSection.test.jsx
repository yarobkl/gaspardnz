import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Sur iPhone en mode économie d'énergie, la lecture automatique est
// refusée (play() rejeté) : sans rien d'autre, l'onglet "Vidéos" restait
// un cadre noir. Il faut une image d'aperçu et un bouton qui lance la
// vidéo au toucher, avec l'explication du mode économie d'énergie sur iOS.
const VideoSection = (await import("../../src/components/sections/VideoSection.jsx")).default;

const realIO = globalThis.IntersectionObserver;
const realUA = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");

beforeEach(() => {
  // Section toujours "visible" pour déclencher chargement et lecture.
  globalThis.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(target) { this.cb([{ isIntersecting: true, intersectionRatio: 1, target }], this); }
    unobserve() {} disconnect() {} takeRecords() { return []; }
  };
  Object.defineProperty(window.navigator, "userAgent", { configurable: true, get: () => "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" });
});

afterEach(() => {
  globalThis.IntersectionObserver = realIO;
  if (realUA) Object.defineProperty(window.navigator, "userAgent", realUA);
  else delete window.navigator.userAgent;
  vi.restoreAllMocks();
});

describe("Onglet Vidéos : lecture automatique bloquée (mode économie d'énergie iPhone)", () => {
  it("affiche un aperçu, puis un bouton de lecture avec le message iPhone, et lance la vidéo au toucher", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play")
      .mockRejectedValueOnce(Object.assign(new Error("blocked"), { name: "NotAllowedError" }))
      .mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});

    const { container } = render(<VideoSection />);
    await act(async () => {});

    const video = container.querySelector("video");
    expect(video.getAttribute("poster")).toMatch(/so_1.*\.jpg$/);

    const button = await screen.findByRole("button", { name: "Lancer la vidéo" });
    expect(screen.getByText(/Mode économie d'énergie activé/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Activer le son de la vidéo" })).not.toBeInTheDocument();

    const callsBeforeTap = play.mock.calls.length;
    await userEvent.setup().click(button);
    expect(play.mock.calls.length).toBeGreaterThan(callsBeforeTap);
    expect(video.muted).toBe(false);
    await act(async () => {});
    expect(screen.queryByRole("button", { name: "Lancer la vidéo" })).not.toBeInTheDocument();
  });
});
