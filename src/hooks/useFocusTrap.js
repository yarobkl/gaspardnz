import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const useFocusTrap = (isOpen) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    // Rendu à la fermeture : sans ça, fermer une fenêtre au clavier laissait
    // le focus sur le bouton devenu invisible (souvent le bouton "×" retiré
    // du DOM), le clavier perdait alors toute prise sur la page.
    const previouslyFocused = document.activeElement;

    const focusables = () => container.querySelectorAll(FOCUSABLE_SELECTOR);
    const initial = focusables();
    if (initial.length) initial[0].focus();

    const handleKeyDown = (e) => {
      if (e.key !== "Tab") return;
      // Recalculé à chaque Tab (pas une seule fois à l'ouverture) : un
      // formulaire en plusieurs étapes (ex. réservation) change les champs
      // visibles en cours de route, et le premier/dernier élément mémorisé
      // à l'ouverture n'existe parfois plus — Tab sortait alors du dialogue.
      const current = focusables();
      if (!current.length) return;
      const first = current[0];
      const last = current[current.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused && document.contains(previouslyFocused) && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
};
