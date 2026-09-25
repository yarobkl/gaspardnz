import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

// Bugs réels (trouvés en QA interactive, desktop) : ni la vignette portrait
// ni le paragraphe de biographie n'avaient de largeur maximale.
// - La vignette (height:80vw, maxHeight:520px, sans maxWidth) s'étirait sur
//   toute la largeur de l'écran, cadrant le portrait comme un bandeau large
//   et bas (recadré au niveau des yeux, le reste du corps hors-champ).
// - Le paragraphe courait sur ~1400px de large à 1440px d'écran.
const HeritageMobile = (await import("../../src/components/HeritageMobile.jsx")).default;

describe("HeritageMobile — largeur plafonnée sur bureau", () => {
  it("la vignette portrait a une largeur maximale", () => {
    render(<HeritageMobile />);
    const showcase = document.querySelector('div[style*="overflow: hidden"][style*="position: relative"]');
    expect(showcase).toHaveStyle({ maxWidth: "900px" });
  });

  it("le bloc de texte a une largeur maximale", () => {
    render(<HeritageMobile />);
    const text = screen.getByText("Gaspardnz est habilleur, styliste et maître de cérémonie basé à Paris.");
    const wrapper = text.closest('div[style*="text-align: center"]');
    expect(wrapper).toHaveStyle({ maxWidth: "700px" });
  });
});
