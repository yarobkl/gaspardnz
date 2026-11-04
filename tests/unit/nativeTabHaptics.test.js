import { beforeEach, describe, expect, it, vi } from "vitest";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { nativeTabFeedback } from "../../src/utils/nativeHaptics.js";

vi.mock("@capacitor/core", () => ({
  Capacitor: { isNativePlatform: vi.fn(() => true) },
}));
vi.mock("@capacitor/haptics", () => ({
  ImpactStyle: { Heavy: "HEAVY", Medium: "MEDIUM", Light: "LIGHT" },
  Haptics: {
    impact: vi.fn(() => Promise.resolve()),
    selectionStart: vi.fn(() => Promise.resolve()),
    selectionChanged: vi.fn(() => Promise.resolve()),
    selectionEnd: vi.fn(() => Promise.resolve()),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
});

describe("retour haptique de la capsule native", () => {
  it("signale un appui prolongé par un impact fort et le début d'une sélection", () => {
    nativeTabFeedback("grab");
    expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Heavy });
    expect(Haptics.selectionStart).toHaveBeenCalledTimes(1);
  });

  it("émet un cran discret à chaque nouvelle sélection", () => {
    nativeTabFeedback("step");
    expect(Haptics.selectionChanged).toHaveBeenCalledTimes(1);
    expect(Haptics.impact).not.toHaveBeenCalled();
  });

  it("termine la sélection avec une impulsion légère au verrouillage", async () => {
    nativeTabFeedback("snap");
    expect(Haptics.selectionEnd).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    expect(Haptics.impact).toHaveBeenCalledWith({ style: ImpactStyle.Light });
  });

  it("arrête la sélection sans vibration de verrouillage si le doigt est retiré", () => {
    nativeTabFeedback("cancel");
    expect(Haptics.selectionEnd).toHaveBeenCalledTimes(1);
    expect(Haptics.impact).not.toHaveBeenCalled();
  });

  it("ne déclenche rien hors application native", () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    nativeTabFeedback("grab");
    nativeTabFeedback("step");
    nativeTabFeedback("snap");
    expect(Haptics.impact).not.toHaveBeenCalled();
    expect(Haptics.selectionStart).not.toHaveBeenCalled();
    expect(Haptics.selectionChanged).not.toHaveBeenCalled();
    expect(Haptics.selectionEnd).not.toHaveBeenCalled();
  });
});
