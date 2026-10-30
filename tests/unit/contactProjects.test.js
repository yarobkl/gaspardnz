import { describe, expect, it } from "vitest";
import { CONTACT_PROJECTS, buildContactMessage } from "../../src/data/contactProjects.js";
import { contactCountries } from "../../src/utils/contactCountries.js";
import { normalizeContactPhone } from "../../src/services/whatsappContact.js";

describe("Contact projects and international phone input", () => {
  it("lists exactly the approved projects and Other, without extra invented services", () => {
    expect(CONTACT_PROJECTS.map(p => p.FR)).toEqual([
      "Mariage — stylisme et habillage", "Gala de prestige", "Soirée VIP", "Événement professionnel", "Cérémonie",
      "Shooting photo professionnel", "Conseil en image", "Maître de cérémonie / animation", "Autre",
    ]);
    for (const project of CONTACT_PROJECTS.filter(p => p.id !== "other")) {
      const message = buildContactMessage({ firstName: "Rodrin", projectType: project.id });
      expect(message).toContain("je m’appelle Rodrin");
      expect(message).toContain(project.phrase.FR);
      expect(message).toContain("Je viens de consulter votre site");
      expect(message).toContain("Pourriez-vous me recontacter");
    }
  });

  it("includes the free description for Other and refuses missing or unknown projects", () => {
    expect(buildContactMessage({ firstName: "Marc", projectType: "other", projectDetails: "Habillage pour une remise de prix" })).toContain("Habillage pour une remise de prix");
    expect(() => buildContactMessage({ firstName: "Marc", projectType: "other" })).toThrow("invalid_project");
    expect(() => buildContactMessage({ firstName: "Marc", projectType: "invented" })).toThrow("invalid_project");
    for (const lang of ["EN", "ES", "ZH"]) expect(buildContactMessage({ firstName: "Marc", projectType: "wedding", lang })).toContain("Marc");
  });

  it("covers the world's dialing plans including both Congos, with translated labels", () => {
    const countries = contactCountries("FR");
    expect(countries.length).toBeGreaterThan(230);
    for (const [code, callingCode] of [["FR", "+33"], ["CG", "+242"], ["CD", "+243"], ["US", "+1"], ["GB", "+44"], ["CI", "+225"], ["IN", "+91"]]) {
      expect(countries.find(c => c.code === code)).toMatchObject({ code, callingCode });
    }
    expect(countries.find(c => c.code === "FR").name).toBe("France");
    expect(new Set(countries.map(c => c.code)).size).toBe(countries.length);
  });

  it("uses the selected country's numbering rules, including meaningful leading zeros", () => {
    expect(normalizeContactPhone("06 12 34 56 78", "FR")).toBe("+33612345678");
    expect(normalizeContactPhone("06 123 45 67", "CG")).toBe("+242061234567");
    expect(normalizeContactPhone("07700 900123", "GB")).toBe("+447700900123");
    expect(normalizeContactPhone("02 3661 8300", "IT")).toBe("+390236618300");
    expect(normalizeContactPhone("+44 7700 900123", "FR")).toBe("");
    expect(normalizeContactPhone("123", "FR")).toBe("");
  });
});
