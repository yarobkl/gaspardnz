import { describe, expect, it } from "vitest";
import { isFutureBookingSlot } from "../../src/utils/bookingAvailability.js";

describe("disponibilités GaspardNZ publiées depuis l'administration", () => {
  const now=new Date("2026-11-05T10:00:00Z");

  it("conserve uniquement les créneaux dont la fin est future à Paris", () => {
    expect(isFutureBookingSlot({date:"2026-11-05",start:"15:00",end:"16:00"},now)).toBe(true);
    expect(isFutureBookingSlot({date:"2026-11-05",start:"08:00",end:"09:00"},now)).toBe(false);
    expect(isFutureBookingSlot({date:"2026-11-06",start:"09:00",end:"10:00"},now)).toBe(true);
  });

  it("ne retient ni créneau inversé ni valeurs malformées", () => {
    expect(isFutureBookingSlot({date:"2026-11-06",start:"15:00",end:"14:30"},now)).toBe(false);
    expect(isFutureBookingSlot({date:"2026-11-06",start:"99:00",end:"99:30"},now)).toBe(false);
    expect(isFutureBookingSlot({date:"invalid",start:"09:00",end:"10:00"},now)).toBe(false);
  });

  it("utilise le fuseau de Paris, indépendamment du pays du client", () => {
    const winter=new Date("2026-11-05T23:30:00Z");
    expect(isFutureBookingSlot({date:"2026-11-05",start:"22:00",end:"23:00"},winter)).toBe(false);
    expect(isFutureBookingSlot({date:"2026-11-06",start:"10:00",end:"11:00"},winter)).toBe(true);
  });
});
