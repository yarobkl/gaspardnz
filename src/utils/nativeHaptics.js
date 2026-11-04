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


/**
 * Retour tactile de la capsule iOS :
 * grab  = impulsion franche à l'appui maintenu / début de drag
 * step  = cran subtil lors du passage à un autre onglet
 * snap  = fin de sélection + léger impact au verrouillage
 * cancel = fin sans impact (geste annulé ou appui sans glissement)
 *
 * Ne jamais émettre un signal à chaque pixel : cela saturerait le Taptic Engine.
 * Aucun échec du bridge natif ne doit bloquer la navigation.
 */
export function nativeTabFeedback(phase) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    if (phase === "grab") {
      Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
      Haptics.selectionStart().catch(() => {});
    } else if (phase === "step") {
      Haptics.selectionChanged().catch(() => {});
    } else if (phase === "snap") {
      Haptics.selectionEnd()
        .then(() => Haptics.impact({ style: ImpactStyle.Light }))
        .catch(() => {});
    } else if (phase === "cancel") {
      Haptics.selectionEnd().catch(() => {});
    }
  } catch {
    // Les appareils sans moteur haptique restent parfaitement utilisables.
  }
}
