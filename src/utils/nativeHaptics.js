import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

// Haptics are a small enhancement to native gestures; a bridge failure must not block a tap.
export function nativeFeedback(kind = "tap") {
  if (!Capacitor.isNativePlatform()) return;
  const feedback = kind === "selection"
    ? Haptics.selectionStart().then(() => Haptics.selectionChanged()).then(() => Haptics.selectionEnd())
    : Haptics.impact({ style: ImpactStyle.Light });
  feedback.catch(() => {});
}
