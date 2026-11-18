import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { Capacitor } from "@capacitor/core";
import NativeCalBooking from "../../src/components/NativeCalBooking.jsx";

vi.mock("@capacitor/browser", () => ({ Browser: { open: vi.fn(async () => {}) } }));

beforeEach(() => {
  delete window.Cal;
  delete window.__gnzCalBookingListenerRegistered;
  delete window.webkit;
  document.querySelector('script[src="https://app.cal.com/embed/embed.js"]')?.remove();
  vi.spyOn(Capacitor, "getPlatform").mockReturnValue("ios");
});

describe("Cal.com → native iPhone appointment reminders", () => {
  it("dispatches an accepted real embed result to the native bridge only", () => {
    const postMessage = vi.fn();
    window.webkit = { messageHandlers: { gnzBookingReminders: { postMessage } } };
    render(<NativeCalBooking />);

    const listener = window.Cal.q.find(args => args[0] === "on" && args[1]?.action === "bookingSuccessfulV2");
    expect(listener).toBeTruthy();
    act(() => listener[1].callback({ detail: {
      namespace: "another-company",
      data: { uid: "ABCD123456", startTime: "2027-02-04T14:30:00Z", status: "ACCEPTED" },
    } }));
    expect(postMessage).not.toHaveBeenCalled();

    act(() => listener[1].callback({ detail: {
      namespace: "gaspardnz-ios",
      data: { uid: "ABCD123456", startTime: "2027-02-04T14:30:00Z", status: "ACCEPTED" },
    } }));
    expect(postMessage).toHaveBeenCalledExactlyOnceWith({
      type: "cal-booking-success",
      uid: "ABCD123456",
      startTime: "2027-02-04T14:30:00Z",
      status: "ACCEPTED",
    });

    act(() => window.dispatchEvent(new CustomEvent("gnz:appointment-reminder-result", { detail: { status: "scheduled" } })));
    expect(screen.getByTestId("gnz-appointment-reminder-status")).toHaveTextContent("Rappels iPhone activés");

    act(() => window.dispatchEvent(new CustomEvent("gnz:appointment-reminder-result", { detail: { status: "live-scheduled" } })));
    expect(screen.getByTestId("gnz-appointment-reminder-status")).toHaveTextContent("suivi iPhone est programmé");
  });

  it("never calls the native bridge for an unconfirmed Cal.com request", () => {
    const postMessage = vi.fn();
    window.webkit = { messageHandlers: { gnzBookingReminders: { postMessage } } };
    render(<NativeCalBooking />);
    act(() => window.dispatchEvent(new CustomEvent("gnz:cal-booking-success", {
      detail: { uid: "ABCD123456", startTime: "2027-02-04T14:30:00Z", status: "PENDING" },
    })));
    expect(postMessage).not.toHaveBeenCalled();
    expect(screen.getByTestId("gnz-appointment-reminder-status")).toHaveTextContent("attendons sa confirmation");
  });

  it("does not promise device reminders when opened outside the GNZ iPhone app", () => {
    vi.spyOn(Capacitor, "getPlatform").mockReturnValue("web");
    render(<NativeCalBooking />);
    act(() => window.dispatchEvent(new CustomEvent("gnz:cal-booking-success", {
      detail: { uid: "ABCD123456", startTime: "2027-02-04T14:30:00Z", status: "ACCEPTED" },
    })));
    expect(screen.getByTestId("gnz-appointment-reminder-status")).toHaveTextContent("application iPhone GNZ PARIS");
  });
});
