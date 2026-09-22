import { createPortal } from "react-dom";

// Un ancêtre avec `filter` (nos filtres CSS "contraste élevé" / "mode jour"
// sur body et sur chaque <section>) devient un bloc de positionnement pour
// ses descendants en position:fixed — au même titre qu'un transform. Un
// modal/overlay rendu à l'intérieur d'une section se retrouvait donc
// positionné par rapport à cette section plutôt que par rapport à l'écran
// dès que l'un de ces deux réglages était actif (le mode jour l'est par
// défaut pour beaucoup de visiteurs, via prefers-color-scheme). Rendre ces
// overlays directement sous document.body via un portail les rend immunisés
// contre n'importe quel ancêtre filtré, présent ou futur.
const Portal = ({ children }) => createPortal(children, document.body);

export default Portal;
