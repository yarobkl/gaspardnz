import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangCtx } from "../../src/context.jsx";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("../../src/services/supabaseClient.js", () => ({ sendPublicEvent: send }));
vi.mock("../../src/services/siteTracking.js", () => ({ getTrackingContext: () => ({}) }));
const Modal = (await import("../../src/components/WhatsappContactModal.jsx")).default;

let open;
beforeEach(() => { send.mockReset(); open = vi.spyOn(window, "open").mockReturnValue(window); });
afterEach(() => vi.restoreAllMocks());

async function fill(name = "Élodie", phone = "06 12 34 56 78") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Votre prénom"), name);
  await user.type(screen.getByLabelText("Votre téléphone"), phone);
  await user.selectOptions(screen.getByLabelText("Votre projet"), "wedding");
  return user;
}

describe("WhatsApp contact modal", () => {
  it("preselects France and provides all countries plus the complete approved project list", () => {
    render(<Modal isOpen onClose={() => {}} whatsappNumber="33664826920" />);
    const countries = screen.getByLabelText("Pays / indicatif");
    expect(countries).toHaveValue("FR");
    expect(countries.selectedOptions[0].textContent).toContain("France (+33)");
    expect(countries.selectedOptions[0]).not.toHaveAttribute("label");
    expect(countries.parentElement).toContainElement(screen.getByLabelText("Votre téléphone"));
    expect(countries.options[0].textContent).not.toMatch(/[\u{1F1E6}-\u{1F1FF}]/u);
    expect(countries.options.length).toBeGreaterThan(230);
    expect([...screen.getByLabelText("Votre projet").options].slice(1).map(o => o.textContent)).toEqual([
      "Mariage — stylisme et habillage", "Gala de prestige", "Soirée VIP", "Événement professionnel", "Cérémonie",
      "Shooting photo professionnel", "Conseil en image", "Maître de cérémonie / animation", "Autre",
    ]);
    expect(screen.getByLabelText("Votre projet")).toBeRequired();
  });

  it("saves the selected country and Other description and includes the client's presentation in WhatsApp", async () => {
    send.mockResolvedValue({ ok: true, id: "other-project-lead" });
    render(<Modal isOpen onClose={() => {}} whatsappNumber="33664826920" />);
    const user = await fill("Rodrin", "06 123 45 67");
    await user.selectOptions(screen.getByLabelText("Pays / indicatif"), "CG");
    await user.selectOptions(screen.getByLabelText("Votre projet"), "other");
    expect(screen.getByLabelText("Précisez votre projet")).toBeRequired();
    await user.type(screen.getByLabelText("Précisez votre projet"), "Remise de prix & présentation");
    await user.click(screen.getByRole("button", { name: "Enregistrer et ouvrir WhatsApp" }));
    await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
    const text = new URL(open.mock.calls[0][0]).searchParams.get("text");
    expect(open.mock.calls[0][1]).toBe("_self");
    expect(text).toContain("je m’appelle Rodrin");
    expect(text).toContain("Remise de prix & présentation");
    expect(send).toHaveBeenCalledWith("lead", expect.objectContaining({ phone: "+242061234567", message: text,
      metadata: expect.objectContaining({ country_code: "CG", calling_code: "+242", project_type: "other", project_label: "Autre", project_details: "Remise de prix & présentation" }),
    }));
  });

  it("requires a project selection and clears an obsolete Other description from the submitted request", async () => {
    send.mockResolvedValue({ ok: true, id: "gala-project-lead" });
    render(<Modal isOpen onClose={() => {}} whatsappNumber="33664826920" />);
    const user = await fill("Sonia");
    await user.selectOptions(screen.getByLabelText("Votre projet"), "other");
    fireEvent.submit(document.querySelector("form"));
    expect(screen.getByRole("alert")).toHaveTextContent("précisez");
    expect(send).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText("Précisez votre projet"), "Ancien besoin");
    await user.selectOptions(screen.getByLabelText("Votre projet"), "gala");
    expect(screen.queryByLabelText("Précisez votre projet")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enregistrer et ouvrir WhatsApp" }));
    await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
    expect(new URL(open.mock.calls[0][0]).searchParams.get("text")).toContain("pour un gala de prestige");
    expect(send.mock.calls[0][1].metadata.project_details).toBe(null);
    expect(send.mock.calls[0][1].message).not.toContain("Ancien besoin");
  });

  it("opens WhatsApp only after the CRM save, and blocks double clicks", async () => {
    let resolve;
    send.mockReturnValue(new Promise(r => { resolve = r; }));
    render(<Modal isOpen onClose={() => {}} whatsappNumber="33664826920" />);
    const user = await fill();
    expect(open).not.toHaveBeenCalled();
    await user.dblClick(screen.getByRole("button", { name: "Enregistrer et ouvrir WhatsApp" }));
    expect(send).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Enregistrement…" })).toBeDisabled();
    expect(open).not.toHaveBeenCalled();
    resolve({ ok: true, id: "ui-lead-1" });
    await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
    expect(new URL(open.mock.calls[0][0]).pathname).toBe("/33664826920");
    expect(new URL(open.mock.calls[0][0]).searchParams.get("text")).toContain("je m’appelle Élodie");
    expect(new URL(open.mock.calls[0][0]).searchParams.get("text")).toContain("pour mon mariage");
    expect(screen.queryByText(/Étape 2/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enregistrer et ouvrir WhatsApp" }));
    await waitFor(() => expect(open).toHaveBeenCalledTimes(2));
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("preserves input and shows a retryable error if the CRM is unavailable", async () => {
    send.mockResolvedValueOnce({ ok: false, status: 503 }).mockResolvedValueOnce({ ok: true, id: "ui-lead-2" });
    render(<Modal isOpen onClose={() => {}} whatsappNumber="33664826920" />);
    const user = await fill("Sophie");
    await user.click(screen.getByRole("button", { name: "Enregistrer et ouvrir WhatsApp" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Réessayez");
    expect(screen.getByLabelText("Votre prénom")).toHaveValue("Sophie");
    expect(screen.getByLabelText("Votre téléphone")).toHaveValue("06 12 34 56 78");
    expect(open).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Enregistrer et ouvrir WhatsApp" }));
    await waitFor(() => expect(open).toHaveBeenCalledTimes(1));
  });

  it("offers a direct link without another step if the browser blocks navigation after saving", async () => {
    send.mockResolvedValue({ ok: true, id: "blocked-navigation-lead" });
    open.mockReturnValue(null);
    render(<Modal isOpen onClose={() => {}} whatsappNumber="33664826920" />);
    const user = await fill("Lina");
    await user.click(screen.getByRole("button", { name: "Enregistrer et ouvrir WhatsApp" }));
    const link = await screen.findByRole("link", { name: "Ouvrir WhatsApp" });
    expect(link.href).toContain("33664826920");
    expect(new URL(link.href).searchParams.get("text")).toContain("je m’appelle Lina");
    expect(screen.getByRole("alert")).toHaveTextContent("enregistrées");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("rejects an invalid phone before transmitting and closes on Escape", async () => {
    const close = vi.fn();
    render(<Modal isOpen onClose={close} whatsappNumber="33664826920" />);
    const user = await fill("Marc", "123");
    await user.click(screen.getByRole("button", { name: "Enregistrer et ouvrir WhatsApp" }));
    expect(screen.getByRole("alert")).toHaveTextContent("numéro valide");
    expect(send).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("keeps native required-field validation and does not send on empty submit", () => {
    render(<Modal isOpen onClose={() => {}} whatsappNumber="33664826920" />);
    expect(screen.getByLabelText("Votre prénom")).toBeRequired();
    expect(screen.getByLabelText("Votre téléphone")).toBeRequired();
    fireEvent.submit(document.querySelector("form"));
    expect(send).not.toHaveBeenCalled();
  });

  it("supports the selected language", async () => {
    render(<LangCtx.Provider value={{ lang: "EN" }}><Modal isOpen onClose={() => {}} whatsappNumber="33664826920" /></LangCtx.Provider>);
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Talk to Gaspard");
    expect(screen.getByLabelText("First name")).toBeRequired();
    await waitFor(() => expect(screen.getByLabelText("Phone number")).toHaveAttribute("type", "tel"));
  });
});
