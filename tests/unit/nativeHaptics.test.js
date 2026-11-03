import { beforeEach, describe, expect, it, vi } from "vitest";

const { isNativePlatform, impact, selectionStart, selectionChanged, selectionEnd } = vi.hoisted(() => ({
  isNativePlatform: vi.fn(), impact: vi.fn(), selectionStart: vi.fn(),
  selectionChanged: vi.fn(), selectionEnd: vi.fn(),
}));
vi.mock("@capacitor/core", () => ({ Capacitor: { isNativePlatform } }));
vi.mock("@capacitor/haptics", () => ({
  Haptics: { impact, selectionStart, selectionChanged, selectionEnd },
  ImpactStyle: { Light: "LIGHT" },
}));
import { nativeFeedback } from "../../src/utils/nativeHaptics.js";

beforeEach(() => {
  vi.clearAllMocks();
  impact.mockResolvedValue();
  selectionStart.mockResolvedValue();
  selectionChanged.mockResolvedValue();
  selectionEnd.mockResolvedValue();
});

describe("native feedback", () => {
  it("does not vibrate in a web browser", () => {
    isNativePlatform.mockReturnValue(false);
    nativeFeedback();
    expect(impact).not.toHaveBeenCalled();
  });

  it("uses a light impact for a native tap", () => {
    isNativePlatform.mockReturnValue(true);
    nativeFeedback();
    expect(impact).toHaveBeenCalledWith({ style: "LIGHT" });
  });

  it("makes a selection hint and never blocks the interaction on a bridge error", async () => {
    isNativePlatform.mockReturnValue(true);
    nativeFeedback("selection");
    await vi.waitFor(() => expect(selectionEnd).toHaveBeenCalledOnce());
    expect(selectionStart).toHaveBeenCalledOnce();
    expect(selectionChanged).toHaveBeenCalledOnce();
    impact.mockRejectedValueOnce(new Error("unavailable"));
    expect(() => nativeFeedback()).not.toThrow();
  });
});
