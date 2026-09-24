import { describe, expect, it } from "vitest";
import { cardOffsetX, cardWidthPx, MAX_CARD_PX } from "../../src/utils/vipCarouselGeometry.js";

// Bug réel : le carrousel VIP dimensionnait ses cartes en `${CARD_W}vw`
// (68% du viewport) — correct sur mobile, mais une carte de ~980px sur un
// écran de bureau de 1440px. La largeur doit être plafonnée en pixels au
//-delà d'un certain viewport.
describe("vipCarouselGeometry", () => {
  it("suit le pourcentage du viewport sur mobile (pas de plafond atteint)", () => {
    expect(cardWidthPx(390, 68)).toBeCloseTo(265.2, 1);
  });

  it("plafonne la largeur de carte sur un écran de bureau", () => {
    expect(cardWidthPx(1440, 68)).toBe(MAX_CARD_PX);
    expect(cardWidthPx(1440, 68)).toBeLessThan(1440 * 0.68);
  });

  it("centre toujours la carte active (offset 0 au premier index)", () => {
    const width = cardWidthPx(1440, 68);
    expect(cardOffsetX(1440, 68, 0)).toBeCloseTo((1440 - width) / 2, 5);
  });

  it("décale d'une largeur de carte pleine par index suivant", () => {
    const width = cardWidthPx(1440, 68);
    expect(cardOffsetX(1440, 68, 0) - cardOffsetX(1440, 68, 1)).toBeCloseTo(width, 5);
  });
});
