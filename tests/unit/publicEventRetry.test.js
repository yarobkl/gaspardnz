import { afterEach, describe, expect, it, vi } from "vitest";
import { sendPublicEventWithRetry } from "../../src/services/supabaseClient.js";

// Sur 4G, un envoi de formulaire peut se perdre. L'enregistrement se fait en
// arrière-plan : il doit réessayer sur coupure réseau ou erreur serveur,
// mais pas sur une donnée refusée (4xx), qui échouerait à nouveau.
afterEach(() => vi.unstubAllGlobals());

const reply = (status, body = {}) => ({ ok: status < 400, status, json: async () => body });

describe("sendPublicEventWithRetry", () => {
  it("réessaie après une coupure réseau puis une erreur serveur, et finit par enregistrer", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError("Load failed"))
      .mockResolvedValueOnce(reply(503))
      .mockResolvedValueOnce(reply(201, { ok: true, id: "lead-1" }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await sendPublicEventWithRetry("lead", { email: "a@b.fr" }, [0, 0]);
    expect(result).toEqual({ ok: true, id: "lead-1" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][1].keepalive).toBe(true);
  });

  it("ne réessaie pas une demande refusée (400)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(400));
    vi.stubGlobal("fetch", fetchMock);
    const result = await sendPublicEventWithRetry("lead", {}, [0, 0]);
    expect(result).toEqual({ ok: false, status: 400 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
