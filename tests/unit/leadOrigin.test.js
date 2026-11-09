import { describe, expect, it } from "vitest";
import { leadOrigin } from "../../src/utils/leadOrigin.js";

describe("CRM — provenance réelle des demandes", () => {
  it("identifie les formulaires et WhatsApp iOS", () => {
    expect(leadOrigin({ channel: "contact_form", source: "Application GaspardNZ iOS" })).toBe("app");
    expect(leadOrigin({ channel: "whatsapp", source: "Application GaspardNZ iOS" })).toBe("app");
    expect(leadOrigin({ channel: "booking", source: "GaspardNZ application" })).toBe("app");
  });
  it("identifie le site même si le contact passe par WhatsApp", () => {
    expect(leadOrigin({ channel: "whatsapp", source: "Site GaspardNZ" })).toBe("web");
    expect(leadOrigin({ channel: "partner", source: "site" })).toBe("web");
  });
  it("n'invente pas une provenance pour les demandes directes", () => {
    expect(leadOrigin({ channel: "partner_application", source: "Direct" })).toBe("unknown");
    expect(leadOrigin({})).toBe("unknown");
  });
});
