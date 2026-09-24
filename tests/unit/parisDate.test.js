import { describe, expect, it, vi, afterEach } from "vitest";
import { todayInParis } from "../../src/utils/parisDate.js";

// "Style du mois" affiche l'entrée dont starts_at <= aujourd'hui. Le calcul
// utilisait new Date().toISOString().slice(0,10), qui donne la date en UTC :
// entre minuit et 1h ou 2h du matin à Paris (selon l'heure d'été), c'était
// encore la veille, et un style programmé pour le 1er du mois n'apparaissait
// qu'après coup.
afterEach(() => vi.useRealTimers());

describe("todayInParis", () => {
  it("reste sur le jour à Paris à 0h30, quand l'UTC est déjà le lendemain (hiver, UTC+1)", () => {
    // 2026-01-02T00:30:00+01:00 == 2026-01-01T23:30:00Z
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T23:30:00Z"));
    expect(todayInParis()).toBe("2026-01-02");
  });

  it("reste sur le jour à Paris à 1h30, quand l'UTC est déjà le lendemain (été, UTC+2)", () => {
    // 2026-07-02T01:30:00+02:00 == 2026-07-01T23:30:00Z
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-01T23:30:00Z"));
    expect(todayInParis()).toBe("2026-07-02");
  });

  it("suit bien la date UTC le reste de la journée", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-15T12:00:00Z"));
    expect(todayInParis()).toBe("2026-03-15");
  });
});
