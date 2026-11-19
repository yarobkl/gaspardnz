import { Capacitor } from "@capacitor/core";

// The existing iOS experience has five primary destinations. Keep UIKit and
// React in sync without introducing website navigation or a second WebView.
export const NATIVE_TAB_EVENT = "gnz:native-tab";
export const NATIVE_TABS = ["home", "services", "gallery", "news", "more"];
export const NATIVE_SHORTCUT_ROUTE_EVENT = "gnz:shortcut-route";
export const NATIVE_SHORTCUT_ROUTES = ["services", "gallery", "news", "booking"];

export function hasNativeTabBarBridge() {
  return typeof window !== "undefined"
    && Capacitor.isNativePlatform()
    && Capacitor.getPlatform() === "ios"
    && typeof window.webkit?.messageHandlers?.gnzNativeTabs?.postMessage === "function";
}

export function sendNativeTabState({ selected, visible, labels, newsUnread }) {
  if (!hasNativeTabBarBridge()) return false;

  window.webkit.messageHandlers.gnzNativeTabs.postMessage({
    type: "state",
    selected: NATIVE_TABS.includes(selected) ? selected : "home",
    visible: Boolean(visible),
    ...(typeof newsUnread === "boolean" ? { newsUnread } : {}),
    ...(Array.isArray(labels) && labels.length === NATIVE_TABS.length
      ? { labels: labels.map((label) => String(label).slice(0, 30)) }
      : {}),
  });
  return true;
}
