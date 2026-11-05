import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { LangCtx } from "../../src/context.jsx";
import NativeExperience from "../../src/components/NativeExperience.jsx";

const mockSettings = vi.hoisted(() => ({ availability: undefined }));

// Test navigation without making live CRM calls or opening external apps.
vi.mock("../../src/hooks/useSettings.js", () => ({
  useSettings: () => ({ whatsappNumber: "+33600000000", lookbookHidden: true, bookingAvailability: mockSettings.availability }),
}));
vi.mock("../../src/hooks/usePublicCollection.js", () => ({
  usePublicCollection: () => ({ rows: [], loading: false, error: null }),
}));
vi.mock("../../src/components/NativeServices.jsx", () => ({
  default: ({ onContact }) => <button onClick={() => onContact("image_consulting")}>Parler de ce projet</button>,
}));
vi.mock("../../src/components/GalleryMobile.jsx", () => ({
  default: () => <div data-testid="gallery">Galerie chargée</div>,
}));
vi.mock("../../src/components/WhatsappContactModal.jsx", () => ({
  default: ({ isOpen, onClose, initialProjectType, initialProjectDetails }) => isOpen
    ? <div role="dialog" aria-label="Contact CRM" data-project={initialProjectType} data-details={initialProjectDetails}><button onClick={onClose}>Fermer le contact</button></div>
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
  mockSettings.availability = undefined;
  vi.stubGlobal("scrollTo", vi.fn());
});

describe("GaspardNZ native iOS experience", () => {
  it("shows the authentic uploaded portrait and the five navigation tabs", async () => {
    render(<Harness />);
    expect(screen.getByRole("img", { name: "Portrait de GaspardNZ" }))
      .toHaveAttribute("src", "/images/Photo%20application%20.JPG");
    const tabs = within(navigation()).getAllByRole("button");
    expect(tabs).toHaveLength(5);
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Accueil", "Services", "Galerie", "Actualités", "Plus"]);
    expect(screen.queryByTestId("native-chatbot")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    expect(tabs.every((tab) => tab.querySelector("svg"))).toBe(true);
  });

  it("places one full-size capsule behind the selected tab and keeps five accessible buttons", async () => {
    render(<Harness />);
    const nav = navigation();
    const pill = () => nav.querySelectorAll(":scope > .gnz-native-tab-pill");
    const activeButton = () => within(nav).getAllByRole("button")
      .find(button => button.getAttribute("aria-current") === "page");

    expect(pill()).toHaveLength(1);
    expect(pill()[0]).toHaveAttribute("aria-hidden", "true");
    expect(activeButton()).toHaveTextContent("Accueil");

    openTab("Galerie");
    expect(pill()).toHaveLength(1);
    expect(activeButton()).toHaveTextContent("Galerie");
    expect(within(nav).getAllByRole("button")).toHaveLength(5);

    openTab("Plus");
    fireEvent.click(await screen.findByRole("button", { name: /Réserver/ }));
    expect(pill()).toHaveLength(1);
    expect(activeButton()).toHaveTextContent("Plus");
  });

  it("opens and closes the notifications panel", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("Aucune notification pour le moment")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fermer" }));
    await waitFor(() => expect(screen.queryByText("Aucune notification pour le moment")).not.toBeInTheDocument());
  });

  it("sends the services lead to the CRM form, not directly to WhatsApp", async () => {
    render(<Harness />);
    openTab("Services");
    fireEvent.click(await screen.findByRole("button", { name: "Parler de ce projet" }));
    expect(await screen.findByRole("dialog", { name: "Contact CRM" })).toHaveAttribute("data-project", "image_consulting");
  });

  it("opens admin-published booking availability and the CRM contact form for a project", async () => {
    render(<Harness />);
    openTab("Plus");
    fireEvent.click(await screen.findByRole("button", { name: /Réserver/ }));
    expect(await screen.findByText("Créneaux disponibles")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Préparation de mariage" }));
    expect(await screen.findByText("Aucun créneau publié pour le moment")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Demander un rendez-vous →" }));
    expect(await screen.findByRole("dialog", { name: "Contact CRM" })).toHaveAttribute("data-project", "wedding");
  });

  it("transmet la prestation ET le créneau souhaité au CRM sans annoncer une confirmation", async () => {
    mockSettings.availability = {timezone:"Europe/Paris",slots:[
      {id:"vip-2030",date:"2030-06-16",start:"15:30",end:"16:30",active:true},
      {id:"past",date:"2021-05-10",start:"13:00",end:"14:00",active:true},
    ]};
    render(<Harness />);
    openTab("Plus");
    fireEvent.click(await screen.findByRole("button", { name: /Réserver/ }));
    fireEvent.click(await screen.findByRole("button", {name:"Préparation de mariage"}));
    const slot = screen.getByRole("button", {name:/16 juin.*15:30/i});
    fireEvent.click(slot);
    expect(slot).toHaveAttribute("aria-pressed","true");
    expect(screen.queryByRole("button",{name:/mai 2021/})).not.toBeInTheDocument();
    expect(screen.getByText("Ce créneau est souhaité, pas encore confirmé.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Demander ce créneau →"}));
    const modal = await screen.findByRole("dialog",{name:"Contact CRM"});
    expect(modal).toHaveAttribute("data-project","wedding");
    expect(modal.getAttribute("data-details")).toContain("15:30–16:30");
  });

  it("n'expose pas les outils Push internes dans une version publique", async () => {
    render(<Harness />);
    openTab("Plus");
    expect(await screen.findByText("L'univers GaspardNZ")).toBeInTheDocument();
    expect(screen.queryByText("Outils de diagnostic TestFlight")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Code d’appairage Apple")).not.toBeInTheDocument();
  });

  it("translates all five tabs when switching to English", async () => {
    render(<Harness />);
    openTab("Plus");
    fireEvent.change(await screen.findByLabelText("Langue"), { target: { value: "EN" } });
    const tabs = within(navigation()).getAllByRole("button");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Home", "Services", "Gallery", "News", "More"]);
    fireEvent.click(await screen.findByRole("button", { name: "Book" }));
    expect(await screen.findByRole("button", { name: "Request an appointment →" })).toBeInTheDocument();
  });

  it("exposes privacy, legal terms and support from the native More tab", async () => {
    render(<Harness />);
    openTab("Plus");

    const legal = within(await screen.findByRole("region", { name: "Informations légales et assistance" }));
    const links = [
      ["Politique de confidentialité", "https://gaspardnz.style/confidentialite.html"],
      ["Mentions légales", "https://gaspardnz.style/mentions-legales.html"],
      ["Conditions générales de vente", "https://gaspardnz.style/cgv.html"],
      ["Assistance", "mailto:gaspardnz.contact@gmail.com"],
    ];
    for (const [label, href] of links) {
      const link = legal.getByRole("link", { name: label });
      expect(link).toHaveAttribute("href", href);
      if (href.startsWith("https://")) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    }
  });

  it("lets native users reopen privacy consent preferences from More", async () => {
    render(<Harness />);
    openTab("Plus");
    const onOpen = vi.fn();
    window.addEventListener("gnz:open-cookie-settings", onOpen);
    try {
      const legal = within(await screen.findByRole("region", { name: "Informations légales et assistance" }));
      fireEvent.click(legal.getByRole("button", { name: "Gérer mes cookies" }));
      expect(onOpen).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener("gnz:open-cookie-settings", onOpen);
    }
  });

  it("localizes native legal links when the visitor changes language", async () => {
    render(<Harness />);
    openTab("Plus");
    fireEvent.change(await screen.findByLabelText("Langue"), { target: { value: "EN" } });
    const legal = within(await screen.findByRole("region", { name: "Legal information and support" }));
    expect(legal.getByRole("link", { name: "Privacy policy" })).toHaveAttribute(
      "href", "https://gaspardnz.style/confidentialite.html"
    );
    expect(legal.getByRole("link", { name: "Support" })).toHaveAttribute(
      "href", "mailto:gaspardnz.contact@gmail.com"
    );
    expect(legal.getByRole("button", { name: "Manage cookie preferences" })).toBeInTheDocument();
  });

  it("opens the image gallery from the bottom bar", async () => {
    render(<Harness />);
    openTab("Galerie");
    expect(await screen.findByTestId("gallery")).toBeInTheDocument();
  });

  it("finishes on the most recently selected screen after rapid tab changes", async () => {
    render(<Harness />);
    openTab("Services");
    openTab("Galerie");
    openTab("Plus");
    fireEvent.click(await screen.findByRole("button", { name: /Réserver/ }));
    expect(await screen.findByText("Créneaux disponibles")).toBeInTheDocument();
    expect(within(navigation()).getByRole("button", { name: "Plus" })).toHaveAttribute("aria-current", "page");
  });
});
