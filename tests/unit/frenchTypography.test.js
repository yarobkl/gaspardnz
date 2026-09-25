import { describe, expect, it } from "vitest";
import { withFrenchSpacing } from "../../src/utils/frenchTypography.js";

// Bug réel (trouvé en QA interactive) : un titre comme "Akwaba Gaspard NZ !"
// pouvait couper juste avant le "!", le laissant seul en début de ligne
// suivante. Convention typographique française : espace insécable avant
// !, ?, :, ; — mais uniquement quand une espace existe déjà (ne doit rien
// ajouter là où il n'y en avait pas).
describe("withFrenchSpacing", () => {
  it("remplace l'espace avant ! par une espace insécable", () => {
    expect(withFrenchSpacing("Akwaba Gaspard NZ !")).toBe("Akwaba Gaspard NZ !");
  });

  it("fonctionne aussi pour ?, : et ;", () => {
    expect(withFrenchSpacing("Vraiment ?")).toBe("Vraiment ?");
    expect(withFrenchSpacing("Attention : ceci")).toBe("Attention : ceci");
    expect(withFrenchSpacing("Un point ; un autre")).toBe("Un point ; un autre");
  });

  it("n'ajoute pas d'espace là où il n'y en avait pas", () => {
    expect(withFrenchSpacing("Vraiment!")).toBe("Vraiment!");
  });

  it("laisse les valeurs non textuelles inchangées", () => {
    expect(withFrenchSpacing(undefined)).toBeUndefined();
    expect(withFrenchSpacing(null)).toBeNull();
  });
});
