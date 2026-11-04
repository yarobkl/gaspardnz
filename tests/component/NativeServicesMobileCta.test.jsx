import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import NativeServices from "../../src/components/NativeServices.jsx";

vi.mock("../../src/services/packagePricing.js", () => ({
  listPackagesWithBreakdown: vi.fn().mockResolvedValue([]),
  subscribePackagePricing: vi.fn(() => () => {}),
  sumPackageTotal: vi.fn(() => 0),
}));

describe("Services — conversion mobile GaspardNZ", () => {
  it("permet de contacter GaspardNZ directement depuis la liste des prestations", () => {
    const onContact = vi.fn();
    render(<NativeServices lang="FR" onContact={onContact} />);
    expect(screen.getByText("Un projet ou une occasion particulière ?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Parler de mon projet" }));
    expect(onContact).toHaveBeenCalledExactlyOnceWith("other");
  });

  it("traduit le bouton et conserve le même formulaire CRM en anglais", () => {
    const onContact = vi.fn();
    render(<NativeServices lang="EN" onContact={onContact} />);
    fireEvent.click(screen.getByRole("button", { name: "Discuss my project" }));
    expect(onContact).toHaveBeenCalledExactlyOnceWith("other");
  });
});
