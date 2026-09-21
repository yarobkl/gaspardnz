import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Même classe de bug que Partenaires (voir PartnersSection.test.jsx) mais
// dans useSettings.js : "aucun VIP publié" retombait sur une liste figée de
// clients (mêmes noms que ceux déjà réellement présents dans vip_clients),
// donc un masquage complet depuis l'admin n'était jamais respecté.
let fake;
vi.mock("../../src/services/supabaseClient.js", () => ({
  get supabase() { return fake.supabase; },
}));

const VIPSection = (await import("../../src/components/sections/VIPSection.jsx")).default;

describe("Galerie clients (VIP) — aucun repli figé quand rien n'est publié", () => {
  it("n'affiche rien (section masquée) quand le seul client VIP est masqué, plutôt que la liste figée", async () => {
    fake = createFakeSupabaseTables({
      vip_clients: [{ id: "v1", name: "Boris", city: "Paris", published: false, sort_order: 0 }],
    });
    const { container } = render(<VIPSection />);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(screen.queryByText("Boris")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
