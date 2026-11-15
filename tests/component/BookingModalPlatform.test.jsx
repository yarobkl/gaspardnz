import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../src/services/bookingAvailability.js", () => ({
  listBookingAvailability: vi.fn(async () => []),
  requestBooking: vi.fn(async () => ({ message: "Demande envoyée" })),
}));

const { default: BookingModal } = await import("../../src/components/BookingModal.jsx");
const { LangCtx } = await import("../../src/context.jsx");

const renderBooking = () => render(
  <LangCtx.Provider value={{ lang: "FR", setLang: vi.fn() }}>
    <BookingModal isOpen onClose={vi.fn()} />
  </LangCtx.Provider>,
);

afterEach(() => {
  delete window.Capacitor;
  delete window.Cal;
  document.querySelectorAll('script[src="https://app.cal.com/embed/embed.js"]').forEach((script) => script.remove());
});

describe("Rendez-vous — séparation site web / application iOS", () => {
  it("affiche Cal.com en provenance du menu web", async () => {
    renderBooking();
    expect(await screen.findByRole("heading", { name: "Votre rendez-vous" })).toBeInTheDocument();
    expect(screen.getByLabelText("Calendrier de réservation GaspardNZ")).toBeInTheDocument();
    expect(screen.queryByText("Rendez-vous showroom")).not.toBeInTheDocument();
  });

  it("conserve le parcours de réservation natif sur iOS", async () => {
    window.Capacitor = { isNativePlatform: () => true };
    renderBooking();
    expect(await screen.findByText("Rendez-vous showroom")).toBeInTheDocument();
    expect(screen.queryByLabelText("Calendrier de réservation GaspardNZ")).not.toBeInTheDocument();
  });
});
