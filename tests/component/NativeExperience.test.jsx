import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { LangCtx } from "../../src/context.jsx";
import NativeExperience from "../../src/components/NativeExperience.jsx";

// Test navigation without making live CRM calls or opening external apps.
vi.mock("../../src/hooks/useSettings.js", () => ({
  useSettings: () => ({ whatsappNumber: "+33600000000", lookbookHidden: true }),
}));
vi.mock("../../src/components/sections/FormulesSection.jsx", () => ({
  default: ({ onContact }) => <button onClick={onContact}>Demander un devis</button>,
}));
vi.mock("../../src/components/GalleryMobile.jsx", () => ({
  default: () => <div data-testid="gallery">Galerie chargée</div>,
}));
vi.mock("../../src/components/ChatBot.jsx", () => ({
  default: () => <div data-testid="native-chatbot">Assistant</div>,
}));
vi.mock("../../src/components/WhatsappContactModal.jsx", () => ({
  default: ({ isOpen, onClose }) => isOpen
    ? <div role="dialog" aria-label="Contact CRM"><button onClick={onClose}>Fermer le contact</button></div>
    : null,
}));

function Harness() {
  const [lang, setLang] = useState("FR");
  return (
    <LangCtx.Provider value={{ lang, setLang }}>
      <NativeExperience />
    </LangCtx.Provider>
  );
}
const navigation = () => screen.getByRole("navigation");
const openTab = (label) => fireEvent.click(within(navigation()).getByRole("button", { name: label }));

beforeEach(() => {
  vi.stubGlobal("scrollTo", vi.fn());
});

describe("GaspardNZ native iOS experience", () => {
  it("shows the authentic uploaded portrait and the five navigation tabs", async () => {
    render(<Harness />);
    expect(screen.getByRole("img", { name: "Portrait de GaspardNZ" }))
      .toHaveAttribute("src", "/images/Photo%20application%20.JPG");
    const tabs = within(navigation()).getAllByRole("button");
    expect(tabs).toHaveLength(5);
    expect(tabs.map((tab) => tab.textContent)).toEqual(["⌂Accueil", "◈Services", "▧Galerie", "▣Réserver", "•••Plus"]);
    expect(await screen.findByTestId("native-chatbot")).toBeInTheDocument();
  });

  it("sends the services lead to the CRM form, not directly to WhatsApp", async () => {
    render(<Harness />);
    openTab("Services");
    fireEvent.click(await screen.findByRole("button", { name: "Demander un devis" }));
    expect(await screen.findByRole("dialog", { name: "Contact CRM" })).toBeInTheDocument();
  });

  it("presents booking as a request and opens the CRM contact form", async () => {
    render(<Harness />);
    openTab("Réserver");
    expect(screen.getByText(/GaspardNZ pourra ensuite vous recontacter/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma demande →" }));
    expect(await screen.findByRole("dialog", { name: "Contact CRM" })).toBeInTheDocument();
  });

  it("translates all five tabs when switching to English", async () => {
    render(<Harness />);
    openTab("Plus");
    fireEvent.change(screen.getByLabelText("Langue"), { target: { value: "EN" } });
    const tabs = within(navigation()).getAllByRole("button");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["⌂Home", "◈Services", "▧Gallery", "▣Book", "•••More"]);
    openTab("Book");
    expect(screen.getByRole("button", { name: "Send my request →" })).toBeInTheDocument();
  });

  it("opens the image gallery from the bottom bar", async () => {
    render(<Harness />);
    openTab("Galerie");
    expect(await screen.findByTestId("gallery")).toBeInTheDocument();
  });
});
