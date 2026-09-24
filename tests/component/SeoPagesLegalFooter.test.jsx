import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

// Bug réel : aucune des 5 pages SEO (ImageConsultingSeoPage, MarriageSeoPage,
// ServicesRoutePage, SeoRoutePage, SecondarySeoRoutePage) ne renvoyait vers
// les pages légales (mentions légales, confidentialité, CGV) — un vrai
// manque de conformité, pas seulement un défaut de cohérence visuelle.
// SeoLayout (partagé) garantit désormais ce pied de page partout.
const pages = [
  ["ImageConsultingSeoPage", () => import("../../src/components/ImageConsultingSeoPage.jsx")],
  ["MarriageSeoPage", () => import("../../src/components/MarriageSeoPage.jsx")],
  ["ServicesRoutePage", () => import("../../src/components/ServicesRoutePage.jsx")],
  ["SeoRoutePage", () => import("../../src/components/SeoRoutePage.jsx")],
  ["SecondarySeoRoutePage", () => import("../../src/components/SecondarySeoRoutePage.jsx")],
];

describe("Pages SEO — pied de page légal partagé", () => {
  it.each(pages)("%s renvoie vers mentions légales, confidentialité et CGV", async (_name, importPage) => {
    const Page = (await importPage()).default;
    render(<Page />);
    expect(screen.getByRole("link", { name: "Mentions légales" })).toHaveAttribute("href", "/mentions-legales.html");
    expect(screen.getByRole("link", { name: "Confidentialité" })).toHaveAttribute("href", "/confidentialite.html");
    expect(screen.getByRole("link", { name: "CGV" })).toHaveAttribute("href", "/cgv.html");
  });
});
