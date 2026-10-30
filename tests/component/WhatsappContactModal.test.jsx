import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangCtx } from "../../src/context.jsx";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("../../src/services/supabaseClient.js", () => ({ sendPublicEvent: send }));
vi.mock("../../src/services/siteTracking.js", () => ({ getTrackingContext: () => ({}) }));
const Modal = (await import("../../src/components/WhatsappContactModal.jsx")).default;
const url = "https://wa.me/33664826920?text=Bonjour%20Gaspard";
beforeEach(() => send.mockReset());

async function fill(name = "Élodie", phone = "06 12 34 56 78") {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Votre prénom"), name);
  await user.type(screen.getByLabelText("Votre téléphone"), phone);
  return user;
}

describe("WhatsApp contact modal", () => {
  it("only exposes WhatsApp after the server confirms the CRM save, and blocks double clicks", async () => {
    let resolve;
    send.mockReturnValue(new Promise(r => { resolve = r; }));
    render(<Modal isOpen onClose={() => {}} whatsappUrl={url} />);
    const user = await fill();
    expect(screen.queryByRole("link", { name: "Continuer sur WhatsApp" })).not.toBeInTheDocument();
    await user.dblClick(screen.getByRole("button", { name: "Continuer", exact: true }));
    expect(send).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Enregistrement…" })).toBeDisabled();
    expect(screen.queryByRole("link", { name: "Continuer sur WhatsApp" })).not.toBeInTheDocument();
    resolve({ ok: true, id: "ui-lead-1" });
    const link = await screen.findByRole("link", { name: "Continuer sur WhatsApp" });
    expect(link).toHaveAttribute("href", url);
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("status")).toHaveTextContent("Vos coordonnées sont enregistrées.");
    await user.click(screen.getByRole("button", { name: "Modifier mes coordonnées" }));
    expect(screen.getByLabelText("Votre prénom")).toHaveValue("Élodie");
    await user.click(screen.getByRole("button", { name: "Continuer", exact: true }));
    await screen.findByRole("link", { name: "Continuer sur WhatsApp" });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("preserves input and shows a retryable error if the CRM is unavailable", async () => {
    send.mockResolvedValueOnce({ ok: false, status: 503 }).mockResolvedValueOnce({ ok: true, id: "ui-lead-2" });
    render(<Modal isOpen onClose={() => {}} whatsappUrl={url} />);
    const user = await fill("Sophie");
    await user.click(screen.getByRole("button", { name: "Continuer", exact: true }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Réessayez");
    expect(screen.getByLabelText("Votre prénom")).toHaveValue("Sophie");
    expect(screen.getByLabelText("Votre téléphone")).toHaveValue("06 12 34 56 78");
    expect(screen.queryByRole("link", { name: "Continuer sur WhatsApp" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continuer", exact: true }));
    await screen.findByRole("link", { name: "Continuer sur WhatsApp" });
  });

  it("rejects an invalid phone before transmitting and closes on Escape", async () => {
    const close = vi.fn();
    render(<Modal isOpen onClose={close} whatsappUrl={url} />);
    const user = await fill("Marc", "123");
    await user.click(screen.getByRole("button", { name: "Continuer", exact: true }));
    expect(screen.getByRole("alert")).toHaveTextContent("numéro valide");
    expect(send).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("keeps native required-field validation and does not send on empty submit", () => {
    render(<Modal isOpen onClose={() => {}} whatsappUrl={url} />);
    expect(screen.getByLabelText("Votre prénom")).toBeRequired();
    expect(screen.getByLabelText("Votre téléphone")).toBeRequired();
    fireEvent.submit(document.querySelector("form"));
    expect(send).not.toHaveBeenCalled();
  });

  it("supports the selected language", async () => {
    render(<LangCtx.Provider value={{ lang: "EN" }}><Modal isOpen onClose={() => {}} whatsappUrl={url} /></LangCtx.Provider>);
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Talk to Gaspard");
    expect(screen.getByLabelText("First name")).toBeRequired();
    await waitFor(() => expect(screen.getByLabelText("Phone number")).toHaveAttribute("type", "tel"));
  });
});
