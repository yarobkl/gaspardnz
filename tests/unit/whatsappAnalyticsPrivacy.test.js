import { describe, expect, it, vi } from "vitest";
const { send } = vi.hoisted(() => ({ send: vi.fn(async () => ({ ok: true })) }));
vi.mock("../../src/services/supabaseClient.js", () => ({ sendPublicEvent: send }));
vi.mock("../../src/services/consent.js", () => ({ hasConsent: () => true }));
import { initializeSupabaseTracking } from "../../src/services/siteTracking.js";

describe("Personalized WhatsApp message privacy", () => {
  it("counts the click without copying the client's name or project into analytics", () => {
    const stop = initializeSupabaseTracking();
    const link = document.createElement("a");
    link.href = "https://wa.me/33664826920?text=" + encodeURIComponent("Bonjour, je m’appelle Élodie. Mon projet confidentiel.");
    link.textContent = "Continuer sur WhatsApp";
    link.addEventListener("click", e => e.preventDefault());
    document.body.append(link);
    try {
      link.click();
      expect(send).toHaveBeenCalledWith("analytics_event", expect.objectContaining({ event_name: "whatsapp_click", metadata: { label: "Continuer sur WhatsApp", href: "https://wa.me/33664826920" } }));
      expect(JSON.stringify(send.mock.calls)).not.toContain("Élodie");
      expect(JSON.stringify(send.mock.calls)).not.toContain("confidentiel");
    } finally { stop(); link.remove(); }
  });
});
