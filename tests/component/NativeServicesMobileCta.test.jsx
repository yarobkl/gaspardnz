import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import NativeServices from "../../src/components/NativeServices.jsx";

const pricing = vi.hoisted(() => ({ rows: [] }));

vi.mock("../../src/services/packagePricing.js", () => ({
  listPackagesWithBreakdown: () => Promise.resolve(pricing.rows),
  subscribePackagePricing: () => () => {},
  sumPackageTotal: () => 0,
}));

beforeEach(() => { pricing.rows = []; });

describe("Services — conversion mobile GaspardNZ", () => {
  it("place Formules en premier, puis Conciergerie, sans déplacer les trois prestations existantes", () => {
    const { container } = render(<NativeServices lang="FR" onContact={vi.fn()} />);
    expect(Array.from(container.querySelectorAll(".gnz-native-service-card strong"), node => node.textContent)).toEqual([
      "Formules", "Groom Conciergerie", "Conseil en image", "Tenues d’événements", "Accompagnement sur mesure",
    ]);
  });

  it("présente les offres Groom Concierge communiquées et permet une demande liée à une formule", () => {
    const onContact = vi.fn();
    render(<NativeServices lang="FR" onContact={onContact} />);
    fireEvent.click(screen.getByRole("button", { name: /Groom Conciergerie/ }));
    expect(document.querySelector(".gnz-native-service-feature-portrait img")).toHaveAttribute("src", "/images/costume-bordeaux.jpg");
    expect(screen.getByText(/L'élégance à vos côtés/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Élégance Essentielle, 1 h 30, 199/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Signature, 4 h, 349/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Prestige, 8 h, 599/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Excellence Privée, 12 h, 990/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Marié Signature.*Dès 799/ })).toBeInTheDocument();
    expect(screen.getByText("Conseil vestimentaire avant mariage")).toBeInTheDocument();
    expect(screen.getByText("Déplacement hors zone")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Élégance Essentielle, 1 h 30, 199/ }));
    expect(screen.getByText("Mise en tenue du marié")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Demander cette formule/ }));
    expect(onContact).toHaveBeenCalledWith("other", expect.stringContaining("Élégance Essentielle (1 h 30, 199 €)"));
    fireEvent.click(screen.getByRole("button", { name: /Toutes les formules Groom Concierge/ }));
    expect(screen.getByRole("button", { name: /Excellence Privée, 12 h, 990/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Tous les services/ }));
    expect(screen.getByRole("button", { name: /Groom Conciergerie/ })).toBeInTheDocument();
  });

  it("ne confond pas l'offre avec costume Marié Signature et la Signature de 4 heures", () => {
    const onContact = vi.fn();
    render(<NativeServices lang="FR" onContact={onContact} />);
    fireEvent.click(screen.getByRole("button", { name: /Groom Conciergerie/ }));
    fireEvent.click(screen.getByRole("button", { name: /Marié Signature.*Dès 799/ }));
    expect(screen.getByText(/Associée à l'achat d'un costume GaspardNZ/)).toBeInTheDocument();
    expect(screen.getByText(/distincte de Signature à 349/)).toBeInTheDocument();
    expect(screen.getByText(/Tarifs communiqués à titre indicatif/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Demander cette formule/ }));
    expect(onContact).toHaveBeenCalledWith("other", expect.stringContaining("dès 799 €"));
  });

  it("transmet au CRM la formule publiée choisie et revient correctement à sa liste", async () => {
    pricing.rows = [{ id: "prestige", name: "Formule Prestige", subtitle: "Premium", published: true, deleted_at: null, package_groups: [] }];
    const onContact = vi.fn();
    render(<NativeServices lang="FR" onContact={onContact} />);
    fireEvent.click(screen.getByRole("button", { name: /Formules/ }));
    fireEvent.click(await screen.findByRole("button", { name: /Formule Prestige/ }));
    fireEvent.click(screen.getByRole("button", { name: /Contacter GaspardNZ/ }));
    expect(onContact).toHaveBeenCalledWith("other", "Formules : Formule Prestige");
    fireEvent.click(screen.getByRole("button", { name: /‹ Formules/ }));
    expect(screen.getByRole("button", { name: /Formule Prestige/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Tous les services/ })).toHaveLength(1);
  });

  it("permet de contacter GaspardNZ directement depuis la liste des prestations", () => {
    const onContact = vi.fn();
    const { container } = render(<NativeServices lang="FR" onContact={onContact} />);
    expect(container.querySelector(".gnz-native-service-list--overview")).toBeInTheDocument();
    expect(screen.getByText("Un projet ou une occasion particulière ?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Parler de mon projet" }));
    expect(onContact).toHaveBeenCalledTimes(1);
    expect(onContact).toHaveBeenCalledWith("other");
  });

  it("réserve la mise en page compacte à l'aperçu et non aux détails d'une formule", () => {
    const { container } = render(<NativeServices lang="FR" onContact={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Groom Conciergerie/ }));
    expect(container.querySelector(".gnz-native-service-list--overview")).not.toBeInTheDocument();
    expect(screen.getByText(/L'élégance à vos côtés/)).toBeInTheDocument();
  });

  it("traduit le bouton et conserve le même formulaire CRM en anglais", () => {
    const onContact = vi.fn();
    render(<NativeServices lang="EN" onContact={onContact} />);
    fireEvent.click(screen.getByRole("button", { name: "Discuss my project" }));
    expect(onContact).toHaveBeenCalledTimes(1);
    expect(onContact).toHaveBeenCalledWith("other");
  });
});
