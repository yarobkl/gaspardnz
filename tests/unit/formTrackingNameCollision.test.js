import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initFormTracking } from "../../src/services/analyticsTracking.js";

// Bug réel (trouvé en QA interactive, confirmé dans un vrai Chromium) : le
// formulaire "Devenir partenaire" a un champ <input name="name">. Un <form>
// expose ses champs nommés comme propriétés directes — `form.name` renvoie
// alors ce champ (un noeud DOM) au lieu de la chaîne attendue, et
// l'évènement de suivi échouait en silence ("Converting circular structure
// to JSON"), jamais enregistré. jsdom (utilisé par ce test) n'implémente
// PAS cette collision de propriétés nommées : ce test ne peut donc pas
// détecter une régression vers `form.name`, seulement vérifier le
// comportement attendu ici. La vraie confirmation vient d'un Chromium réel.
const BEHAVIOR_KEY = "gnz_behavior_tracking";

const grantAnalyticsConsent = () => {
  localStorage.setItem("gnz-consent-v1", JSON.stringify({
    version: 1, necessary: true, analytics: true, marketing: false, updatedAt: new Date().toISOString(),
  }));
};

describe("initFormTracking — formulaire avec un champ nommé « name »", () => {
  let cleanup;
  beforeEach(() => {
    localStorage.clear();
    grantAnalyticsConsent();
    document.body.innerHTML = `
      <form>
        <input name="name" id="the-name-field" />
      </form>
    `;
  });
  afterEach(() => { cleanup?.(); document.body.innerHTML = ""; });

  it("enregistre formName comme une chaîne, pas comme le champ du formulaire", () => {
    cleanup = initFormTracking();
    const input = document.getElementById("the-name-field");
    input.dispatchEvent(new FocusEvent("focus", { bubbles: true }));

    const stored = JSON.parse(localStorage.getItem(BEHAVIOR_KEY) || "[]");
    expect(stored).toHaveLength(1);
    expect(typeof stored[0].formName).toBe("string");
  });
});
