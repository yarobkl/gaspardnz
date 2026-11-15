import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CalBookingPanel from "../../src/components/CalBookingPanel.jsx";
import { CALCOM_BOOKING_PATH, CALCOM_BOOKING_URL } from "../../src/constants.js";

describe("Cal.com — rendez-vous sur le site GaspardNZ", () => {
  beforeEach(() => {
    delete window.Cal;
  });

  afterEach(() => {
    document.querySelectorAll('script[src="https://app.cal.com/embed/embed.js"]').forEach((script) => script.remove());
    delete window.Cal;
  });

  it("affiche un calendrier aux couleurs du site avec un lien de secours", () => {
    render(<CalBookingPanel onClose={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Votre rendez-vous" })).toBeInTheDocument();
    expect(screen.getByLabelText("Calendrier de réservation GaspardNZ")).toBeInTheDocument();
    const watermark = screen.getByTestId("cal-watermark");
    expect(watermark).toHaveAttribute("src", "/images/gaspardnz-watermark.svg");
    expect(watermark).toHaveAttribute("aria-hidden", "true");
    expect(watermark).toHaveStyle({ pointerEvents: "none", opacity: "0.065" });
    expect(screen.getByRole("link", { name: /Ouvrir le calendrier/ })).toHaveAttribute("href", CALCOM_BOOKING_URL);
    expect(document.querySelector('script[src="https://app.cal.com/embed/embed.js"]')).toBeInTheDocument();

    const calls = window.Cal.ns.gaspardnz.q.map((entry) => Array.from(entry));
    expect(calls[1]).toEqual(["inline", expect.objectContaining({ calLink: CALCOM_BOOKING_PATH })]);
    expect(calls[2]).toEqual(["ui", expect.objectContaining({ theme: "light", styles: { branding: { brandColor: "#b8973e" } } })]);
  });

  it("propose une fermeture accessible", () => {
    const onClose = vi.fn();
    render(<CalBookingPanel onClose={onClose} />);
    screen.getByRole("button", { name: "Fermer les rendez-vous" }).click();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
