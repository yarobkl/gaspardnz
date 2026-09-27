import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PasswordField from "../../src/components/Admin/PasswordField.jsx";

// Demandé par l'utilisateur : pouvoir voir le mot de passe en clair pendant
// la saisie sur l'admin (connexion, changement de mot de passe).
describe("PasswordField — bascule afficher/masquer le mot de passe", () => {
  it("masque le mot de passe par défaut, l'affiche en clair après un clic sur l'œil", () => {
    render(<PasswordField value="secret123" onChange={() => {}} />);
    const input = screen.getByDisplayValue("secret123");
    expect(input).toHaveAttribute("type", "password");

    const toggle = screen.getByRole("button", { name: "Afficher le mot de passe" });
    fireEvent.click(toggle);

    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Masquer le mot de passe" })).toBeInTheDocument();
  });

  it("n'est pas un bouton de type submit (ne doit pas valider un formulaire au clic)", () => {
    render(<PasswordField value="" onChange={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
