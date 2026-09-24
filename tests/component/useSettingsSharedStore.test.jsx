import { describe, expect, it, vi } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel : useSettings() était ré-implémenté indépendamment par chaque
// composant consommateur (~12 sur le site public) — chacun relançait son
// propre fetch Supabase et ouvrait son propre canal realtime au montage,
// pour les mêmes données. Un magasin partagé ne doit faire ce travail
// qu'une seule fois, quel que soit le nombre de composants montés en même
// temps.
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const { useSettings } = await import("../../src/hooks/useSettings.js");

const Consumer = () => {
  const settings = useSettings();
  return <span>{settings.siteTitle}</span>;
};

describe("useSettings — magasin partagé entre composants", () => {
  it("ne fait qu'un seul fetch et n'ouvre qu'un seul canal realtime, peu importe le nombre de composants montés", async () => {
    const fromSpy = vi.spyOn(fake.supabase, "from");
    const channelSpy = vi.spyOn(fake.supabase, "channel");

    render(
      <>
        <Consumer />
        <Consumer />
        <Consumer />
      </>,
    );

    await waitFor(() => expect(fromSpy).toHaveBeenCalled());
    // 4 tables interrogées par loadRemoteSettings, une seule fois au total.
    expect(fromSpy).toHaveBeenCalledTimes(4);
    expect(channelSpy).toHaveBeenCalledTimes(1);

    cleanup();
    fromSpy.mockRestore();
    channelSpy.mockRestore();
  });
});
