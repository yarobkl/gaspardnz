import { afterEach, describe, expect, it, vi } from "vitest";
import { isNativeIOS, NATIVE_TAB_EVENT, NATIVE_TABS, sendNativeTabState } from "../../src/services/nativeTabs.js";

afterEach(() => {
  delete window.Capacitor;
  delete window.webkit;
});

describe("Pont de navigation iOS natif — GaspardNZ", () => {
  it("ne modifie pas le site web ou Android", () => {
    const postMessage = vi.fn();
    window.webkit = { messageHandlers: { gnzNativeTabs: { postMessage } } };
    expect(isNativeIOS()).toBe(false);
    expect(sendNativeTabState({ selected: "gallery", visible: true })).toBe(false);

    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => "android" };
    expect(sendNativeTabState({ selected: "gallery", visible: true })).toBe(false);
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("communique l'onglet actif et la visibilité au conteneur UIKit", () => {
    const postMessage = vi.fn();
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => "ios" };
    window.webkit = { messageHandlers: { gnzNativeTabs: { postMessage } } };

    expect(isNativeIOS()).toBe(true);
    expect(sendNativeTabState({ selected: "news", visible: true })).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({ type: "state", selected: "news", visible: true });

    expect(sendNativeTabState({ selected: "booking", visible: false })).toBe(true);
    expect(postMessage).toHaveBeenLastCalledWith({ type: "state", selected: "booking", visible: false });
  });

  it("rejette tout onglet inconnu et ne plante pas sans le handler iOS", () => {
    const postMessage = vi.fn();
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => "ios" };
    expect(sendNativeTabState({ selected: "gallery", visible: true })).toBe(false);
    window.webkit = { messageHandlers: { gnzNativeTabs: { postMessage } } };
    expect(sendNativeTabState({ selected: "unsafe", visible: 1 })).toBe(true);
    expect(postMessage).toHaveBeenCalledWith({ type: "state", selected: "home", visible: true });
    expect(NATIVE_TABS).toEqual(["home", "gallery", "news", "showroom", "booking"]);
    expect(NATIVE_TAB_EVENT).toBe("gnz:native-tab");
  });
});
