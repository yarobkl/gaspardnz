import { describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const mocks = vi.hoisted(() => ({
  availability: vi.fn((req, res) => res.status(201).json({ action: "availability" })),
  request: vi.fn((req, res) => res.status(202).json({ action: "request" })),
  confirmation: vi.fn((req, res) => res.status(203).json({ action: "confirmation" })),
  googleConnect: vi.fn((req, res) => res.status(204).end()),
  googleSync: vi.fn((req, res) => res.status(205).end()),
}));

vi.mock("../../server/booking/availability.js", () => ({ default: mocks.availability }));
vi.mock("../../server/booking/booking-request.js", () => ({ default: mocks.request }));
vi.mock("../../server/booking/booking-confirmation.js", () => ({ default: mocks.confirmation }));
vi.mock("../../server/google/connect.js", () => ({ default: mocks.googleConnect }));
vi.mock("../../server/google/sync.js", () => ({ default: mocks.googleSync }));

import booking from "../../api/booking.js";
import google from "../../api/google/[action].js";

const response = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  setHeader: vi.fn().mockReturnThis(),
  end: vi.fn().mockReturnThis(),
});

describe("Vercel Hobby API consolidation", () => {
  it.each([
    ["legacy-availability", "availability", 201],
    ["legacy-request", "request", 202],
    ["legacy-confirmation", "confirmation", 203],
  ])("preserves the %s handler", async (route, action, status) => {
    const req = { method: "POST", query: { route } };
    const res = response();
    await booking(req, res);
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({ action });
  });

  it.each(["connect", "sync"])("keeps Google %s delegated to its existing implementation", async (action) => {
    const res = response();
    await google({ method: "POST", query: { action } }, res);
    expect(res.status).toHaveBeenCalledWith(action === "connect" ? 204 : 205);
  });

  it("does not expose unintended Google actions", async () => {
    const res = response();
    await google({ method: "GET", query: { action: "unknown" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("uses no more than twelve API function entrypoints", () => {
    const root = resolve(process.cwd(), "api");
    const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      if (entry.isDirectory()) return entry.name.startsWith("_") ? [] : walk(resolve(directory, entry.name));
      return entry.name.endsWith(".js") ? [entry.name] : [];
    });
    expect(walk(root)).toHaveLength(12);
  });

  it("keeps existing public booking URLs through Vercel rewrites", () => {
    const config = JSON.parse(readFileSync(resolve(process.cwd(), "vercel.json"), "utf8"));
    const route = Object.fromEntries(config.rewrites.map(({ source, destination }) => [source, destination]));
    expect(route["/api/booking-request"]).toBe("/api/booking?route=legacy-request");
    expect(route["/api/availability"]).toBe("/api/booking?route=legacy-availability");
    expect(route["/api/booking-confirmation"]).toBe("/api/booking?route=legacy-confirmation");
  });
});
