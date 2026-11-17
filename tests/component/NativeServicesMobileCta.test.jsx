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
      "Formules", "Conciergerie", "Conseil en image", "Tenues d’événements", "Accompagnement sur mesure",
    ]);
  });

  it("ouvre le parcours conciergerie et préremplit sa demande dans le CRM existant", () => {
    const onContact = vi.fn();
    render(<NativeServices lang="FR" onContact={onContact} />);
    fireEvent.click(screen.getByRole("button", { name: /Conciergerie/ }));
    expect(screen.getByText("Une attention particulière pour votre projet")).toBeInTheDocument();
    expect(screen.queryByText(/199\s*€/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Présenter ma demande/ }));
    expect(onContact).toHaveBeenCalledWith("other", "Demande de conciergerie GaspardNZ");
    fireEvent.click(screen.getByRole("button", { name: /Tous les services/ }));
    expect(screen.getByRole("button", { name: /Conciergerie/ })).toBeInTheDocument();
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
    render(<NativeServices lang="FR" onContact={onContact} />);
    expect(screen.getByText("Un projet ou une occasion particulière ?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Parler de mon projet" }));
    expect(onContact).toHaveBeenCalledTimes(1);
    expect(onContact).toHaveBeenCalledWith("other");
  });

  it("traduit le bouton et conserve le même formulaire CRM en anglais", () => {
    const onContact = vi.fn();
    render(<NativeServices lang="EN" onContact={onContact} />);
    fireEvent.click(screen.getByRole("button", { name: "Discuss my project" }));
    expect(onContact).toHaveBeenCalledTimes(1);
    expect(onContact).toHaveBeenCalledWith("other");
  });
});
