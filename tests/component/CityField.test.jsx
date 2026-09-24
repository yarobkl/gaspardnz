import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CityField from "../../src/components/ui/CityField.jsx";
import { FRENCH_CITIES } from "../../src/data/frenchCities.js";

// Le formulaire pro doit proposer un vrai menu déroulant (pas une saisie
// libre en premier lieu) : c'est ce qui a été demandé après une première
// version, qui laissait seulement taper le nom.
const Harness = () => {
  const [value, setValue] = useState("");
  return <CityField id="city" label="Ville" value={value} onChange={setValue} required labelStyle={{}} inputStyle={{}} />;
};

describe("CityField — menu déroulant des villes de France", () => {
  it("est un <select>, pas un champ de saisie libre", () => {
    render(<Harness />);
    expect(screen.getByLabelText("Ville *").tagName).toBe("SELECT");
  });

  it("liste toutes les communes d'Île-de-France, avec Paris et une option « Autre ville »", () => {
    render(<Harness />);
    expect(FRENCH_CITIES.length).toBeGreaterThan(1000);
    expect(FRENCH_CITIES.every(([, dep]) => ["75", "77", "78", "91", "92", "93", "94", "95"].includes(dep))).toBe(true);
    expect(screen.getByRole("option", { name: "Paris (75)" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Versailles (78)" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Autre ville…" })).toBeInTheDocument();
  });

  it("choisir une ville dans la liste met à jour la valeur", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const field = screen.getByLabelText("Ville *");
    const [nom, dep] = FRENCH_CITIES[0];
    await user.selectOptions(field, `${nom} (${dep})`);
    expect(field).toHaveValue(`${nom} (${dep})`);
  });

  it("« Autre ville » révèle une saisie libre", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.selectOptions(screen.getByLabelText("Ville *"), "Autre ville…");
    const freeInput = screen.getByPlaceholderText("Nom de votre ville");
    await user.type(freeInput, "Genève");
    expect(freeInput).toHaveValue("Genève");
  });
});
