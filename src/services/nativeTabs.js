// Narrow bridge to the UIKit tab bar. The public website and Android do not
// expose this handler, so their navigation stays unchanged.
export const NATIVE_TAB_EVENT = "gnz:native-tab";
export const NATIVE_TABS = ["home", "gallery", "news", "showroom", "booking"];

export function isNativeIOS() {
  return typeof window !== "undefined"
    && window.Capacitor?.isNativePlatform?.() === true
    && window.Capacitor?.getPlatform?.() === "ios";
}

export function sendNativeTabState({ selected, visible }) {
  if (!isNativeIOS()) return false;
  const handler = window.webkit?.messageHandlers?.gnzNativeTabs;
  if (!handler?.postMessage) return false;
  handler.postMessage({
    type: "state",
    selected: NATIVE_TABS.includes(selected) ? selected : "home",
    visible: Boolean(visible),
  });
  return true;
}
