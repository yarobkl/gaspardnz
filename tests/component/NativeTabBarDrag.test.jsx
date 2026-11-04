import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import NativeTabBar from "../../src/components/NativeTabBar.jsx";
import { nativeFeedback } from "../../src/utils/nativeHaptics.js";

vi.mock("../../src/utils/nativeHaptics.js", () => ({ nativeFeedback: vi.fn() }));

const tabs = [
  ["home", "Accueil"], ["services", "Services"], ["gallery", "Galerie"],
  ["news", "Actualités"], ["more", "Plus"],
];
const labels = { navigation: "Navigation principale", tabs: tabs.map((tab) => tab[1]) };
const Icon = () => <svg aria-hidden="true" />;

function Harness() {
  const [active, setActive] = useState("home");
  return <NativeTabBar tabs={tabs} labels={labels} activeTab={active} onSelect={setActive} Icon={Icon} />;
}
const nav = () => screen.getByRole("navigation", { name: "Navigation principale" });
const buttons = () => within(nav()).getAllByRole("button");
const selected = () => buttons().find(button => button.getAttribute("aria-current") === "page");
const setupGeometry = () => {
  const element = nav();
  element.getBoundingClientRect = () => ({ left: 10, top: 0, right: 510, bottom: 96, width: 500, height: 96 });
  buttons().forEach((button, index) => {
    button.getBoundingClientRect = () => ({
      left: 10 + index * 100, top: 8, right: 110 + index * 100,
      bottom: 70, width: 100, height: 62,
    });
  });
  fireEvent.resize(window);
};

beforeEach(() => vi.clearAllMocks());

describe("barre iOS à capsule tactile", () => {
  it("encadre la cellule entière, y compris le texte, et conserve cinq boutons", () => {
    render(<Harness />);
    setupGeometry();
    const pill = nav().querySelector(":scope > .gnz-native-tab-pill");
    expect(pill).not.toBeNull();
    expect(pill).toHaveStyle({ width: "94px", height: "62px", top: "8px" });
    expect(pill).toHaveAttribute("aria-hidden", "true");
    expect(buttons()).toHaveLength(5);
    expect(selected()).toHaveTextContent("Accueil");
  });

  it("suit un balayage et verrouille sur la cellule la plus proche avec haptique", () => {
    render(<Harness />);
    setupGeometry();
    fireEvent.pointerDown(buttons()[0], {
      pointerId: 1, pointerType: "touch", clientX: 60, clientY: 40,
    });
    fireEvent.pointerMove(nav(), {
      pointerId: 1, pointerType: "touch", clientX: 259, clientY: 41,
    });
    fireEvent.pointerUp(nav(), {
      pointerId: 1, pointerType: "touch", clientX: 259, clientY: 41,
    });
    expect(selected()).toHaveTextContent("Galerie");
    expect(nativeFeedback).toHaveBeenCalledWith("selection");
    expect(nativeFeedback).toHaveBeenCalledTimes(1);
    // Le clic synthétique qui suit un glissement ne doit pas changer l'onglet.
    fireEvent.click(nav());
    expect(selected()).toHaveTextContent("Galerie");
    // Le tap classique reste disponible.
    fireEvent.click(buttons()[1]);
    expect(selected()).toHaveTextContent("Services");
  });

  it("ne change pas d'onglet pendant un défilement vertical", () => {
    render(<Harness />);
    setupGeometry();
    fireEvent.pointerDown(buttons()[0], {
      pointerId: 2, pointerType: "touch", clientX: 60, clientY: 32,
    });
    fireEvent.pointerMove(nav(), {
      pointerId: 2, pointerType: "touch", clientX: 64, clientY: 80,
    });
    fireEvent.pointerUp(nav(), {
      pointerId: 2, pointerType: "touch", clientX: 64, clientY: 80,
    });
    expect(selected()).toHaveTextContent("Accueil");
    expect(nativeFeedback).not.toHaveBeenCalled();
  });
});
