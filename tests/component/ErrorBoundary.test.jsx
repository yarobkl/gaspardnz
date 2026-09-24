import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "../../src/components/ErrorBoundary.jsx";

// Bug réel : aucun filet de sécurité n'existait sur le site public — une
// seule erreur de rendu, dans n'importe quelle section, effaçait toute la
// page pour le visiteur (React démonte l'arbre entier sans frontière
// dédiée), sans aucun message ni moyen de s'en sortir.
const Boom = () => { throw new Error("section cassée"); };

afterEach(() => vi.restoreAllMocks());

describe("ErrorBoundary", () => {
  it("affiche un message de repli au lieu d'une page blanche quand une section plante", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary lang="FR">
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Un problème d'affichage est survenu.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recharger la page" })).toBeInTheDocument();
  });

  it("le bouton de repli déclenche un rechargement de la page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const reload = vi.fn();
    Object.defineProperty(window, "location", { value: { ...window.location, reload }, writable: true });
    const user = userEvent.setup();
    render(<ErrorBoundary lang="FR"><Boom /></ErrorBoundary>);
    await user.click(screen.getByRole("button", { name: "Recharger la page" }));
    expect(reload).toHaveBeenCalled();
  });

  it("ne montre rien qui plante quand les enfants ne provoquent aucune erreur", () => {
    render(<ErrorBoundary lang="FR"><p>Tout va bien</p></ErrorBoundary>);
    expect(screen.getByText("Tout va bien")).toBeInTheDocument();
  });

  it("affiche le message dans la langue du visiteur", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorBoundary lang="EN"><Boom /></ErrorBoundary>);
    expect(screen.getByText("Something went wrong displaying this page.")).toBeInTheDocument();
  });
});
