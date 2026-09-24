import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useFocusTrap } from "../../src/hooks/useFocusTrap.js";

// Bug réel : le premier/dernier élément focusable n'était calculé qu'à
// l'ouverture. Un dialogue en plusieurs étapes (réservation) qui change ses
// champs visibles en cours de route gardait l'ancien "dernier élément" en
// mémoire — devenu invisible, plus jamais atteint par Tab, qui sortait donc
// du dialogue. Le focus n'était pas non plus rendu à l'élément d'origine à
// la fermeture.
function Harness() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const ref = useFocusTrap(open);
  return (
    <div>
      <button onClick={() => { setOpen(true); setStep(1); }}>Ouvrir</button>
      {open && (
        <div ref={ref}>
          <button onClick={() => setStep(2)}>Suivant</button>
          {step === 2 && <button onClick={() => setOpen(false)}>Dernier bouton</button>}
        </div>
      )}
    </div>
  );
}

describe("useFocusTrap", () => {
  it("recalcule le dernier élément quand le contenu change après l'ouverture (étape 2 d'un formulaire)", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByText("Ouvrir"));
    expect(screen.getByText("Suivant")).toHaveFocus();

    // Le dialogue n'a qu'un bouton à l'ouverture : Tab depuis lui devrait
    // déjà boucler sur lui-même s'il était mémorisé comme premier ET dernier.
    await user.tab();
    expect(screen.getByText("Suivant")).toHaveFocus();

    // Un second bouton apparaît après l'ouverture (étape 2) : Tab doit
    // atteindre CE nouveau dernier élément, pas boucler sur l'ancien.
    await user.click(screen.getByText("Suivant"));
    const dernierBouton = screen.getByText("Dernier bouton");
    dernierBouton.focus();
    await user.tab();
    expect(screen.getByText("Suivant")).toHaveFocus(); // reboucle sur le premier, pas sorti du dialogue
  });

  it("rend le focus à l'élément d'origine à la fermeture", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const ouvrir = screen.getByText("Ouvrir");
    await user.click(ouvrir);
    expect(ouvrir).not.toHaveFocus();

    await user.click(screen.getByText("Suivant"));
    await user.click(screen.getByText("Dernier bouton"));

    expect(ouvrir).toHaveFocus();
  });
});
