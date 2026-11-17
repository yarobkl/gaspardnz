import { afterEach, describe, expect, it, vi } from "vitest";
import { Capacitor } from "@capacitor/core";
import { hasNativeTabBarBridge, NATIVE_TAB_EVENT, NATIVE_TABS, sendNativeTabState } from "../../src/services/nativeTabs.js";

afterEach(() => {
  vi.restoreAllMocks();
  delete window.webkit;
});

describe("Barre UIKit dans le parcours iOS existant", () => {
  it("laisse le site web et Android inchangés", () => {
    const postMessage = vi.fn();
    window.webkit = { messageHandlers: { gnzNativeTabs: { postMessage } } };
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(false);
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("web");

    expect(hasNativeTabBarBridge()).toBe(false);
    expect(sendNativeTabState({ selected: "gallery", visible: true })).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();

    Capacitor.isNativePlatform.mockReturnValue(true);
    Capacitor.getPlatform.mockReturnValue("android");
    expect(sendNativeTabState({ selected: "gallery", visible: true })).toBe(false);
  });

  it("lie les cinq destinations iOS et transmet leurs libellés", () => {
    const postMessage = vi.fn();
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    window.webkit = { messageHandlers: { gnzNativeTabs: { postMessage } } };

    const labels = ["Accueil", "Services", "Galerie", "Actualités", "Plus"];
    expect(hasNativeTabBarBridge()).toBe(true);
    expect(sendNativeTabState({ selected: "services", visible: true, labels })).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({
      type: "state", selected: "services", visible: true, labels,
    });

    expect(sendNativeTabState({ selected: "booking", visible: true })).toBe(true);
    expect(postMessage).toHaveBeenLastCalledWith({ type: "state", selected: "home", visible: true });
    expect(NATIVE_TABS).toEqual(["home", "services", "gallery", "news", "more"]);
    expect(NATIVE_TAB_EVENT).toBe("gnz:native-tab");
  });

  it("ne révèle pas la barre sans le pont installé et peut la masquer dans l'admin", () => {
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
    expect(sendNativeTabState({ selected: "home", visible: true })).toBe(false);
    const postMessage = vi.fn();
    window.webkit = { messageHandlers: { gnzNativeTabs: { postMessage } } };
    expect(sendNativeTabState({ selected: "home", visible: false })).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({ type: "state", selected: "home", visible: false });
  });
});
