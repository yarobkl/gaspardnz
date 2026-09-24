import { useEffect } from "react";

// Aucune fenêtre modale du site public ne se fermait au clavier avec Échap
// (réservation, contact partenaire, candidature partenaire, panneau de
// points cliquables) — un oubli répété plutôt qu'un choix, vu qu'aucune ne
// s'y opposait délibérément. Un seul hook partagé plutôt qu'un
// addEventListener recopié dans chaque fenêtre.
export const useEscapeKey = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
};
