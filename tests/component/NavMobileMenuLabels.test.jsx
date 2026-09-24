import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel : "Style Journal", "Vidéos", "Galerie clients" et "Communauté"
// étaient codés en dur en français dans le menu, quelle que soit la langue
// choisie — incohérent avec les titres des sections elles-mêmes, déjà
// traduits (ex. "风格日志" en chinois pour la section Style Journal, mais
// "Style Journal" resterait affiché dans le menu).
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const NavMobile = (await import("../../src/components/NavMobile.jsx")).default;
const { LangCtx } = await import("../../src/context.jsx");

const renderInZh = () => render(
  <LangCtx.Provider value={{ lang: "ZH", setLang: () => {} }}>
    <NavMobile />
  </LangCtx.Provider>,
);

describe("NavMobile — menu traduit dans toutes les langues", () => {
  it("affiche les libellés du menu en chinois quand la langue choisie est ZH, pas en français", async () => {
    renderInZh();
    fireEvent.click(screen.getByLabelText("打开菜单"));

    expect(await screen.findByText("风格日志")).toBeInTheDocument();
    expect(screen.getByText("视频")).toBeInTheDocument();
    expect(screen.getByText("客户画廊")).toBeInTheDocument();
    expect(screen.getByText("社区")).toBeInTheDocument();

    expect(screen.queryByText("Style Journal")).not.toBeInTheDocument();
    expect(screen.queryByText("Vidéos")).not.toBeInTheDocument();
    expect(screen.queryByText("Galerie clients")).not.toBeInTheDocument();
    expect(screen.queryByText("Communauté")).not.toBeInTheDocument();
  });
});
