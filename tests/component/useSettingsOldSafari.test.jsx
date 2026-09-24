import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createFakeSupabaseTables } from "../support/fakeSupabaseTables.js";

// Bug réel : useSettings() nommait son canal temps réel avec
// crypto.randomUUID(), absent avant Safari 15.4 — l'effet levait une
// exception non rattrapée sur ces iPhone plus anciens dès qu'un composant
// consommant les réglages publics (une dizaine sur le site) montait.
const fake = createFakeSupabaseTables({ site_settings: [] });
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: fake.supabase,
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const FooterMobile = (await import("../../src/components/FooterMobile.jsx")).default;

describe("useSettings — résiste à un navigateur sans crypto.randomUUID", () => {
  let originalRandomUUID;
  beforeEach(() => { originalRandomUUID = crypto.randomUUID; crypto.randomUUID = undefined; });
  afterEach(() => { crypto.randomUUID = originalRandomUUID; });

  it("monte sans lever d'exception (Safari < 15.4, un iPhone encore utilisé par de vrais visiteurs)", async () => {
    expect(() => render(<FooterMobile />)).not.toThrow();
    expect(await screen.findAllByRole("link")).not.toHaveLength(0);
  });
});
