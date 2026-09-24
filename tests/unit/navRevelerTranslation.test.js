import { describe, expect, it } from "vitest";
import { T } from "../../src/translations.js";

// Bug réel (trouvé en QA interactive) : nav_reveler avait été renommé en
// "Rendez-vous" en français (ouvre la modale de réservation) mais les
// traductions EN/ES/ZH gardaient un ancien libellé sans rapport
// ("Reveal Myself" / "Revelarme" / "展现自我"), resté après un renommage
// partiel.
describe("nav_reveler — cohérent avec la modale de réservation dans toutes les langues", () => {
  it("ne contient plus l'ancien libellé « se révéler » dans aucune langue", () => {
    expect(T.EN.nav_reveler).not.toBe("Reveal Myself");
    expect(T.ES.nav_reveler).not.toBe("Revelarme");
    expect(T.ZH.nav_reveler).not.toBe("展现自我");
  });
});
