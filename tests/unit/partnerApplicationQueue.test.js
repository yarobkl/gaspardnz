import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  enqueuePartnerApplication,
  flushPartnerApplicationQueue,
  getQueuedPartnerApplications,
} from "../../src/services/partnerApplicationQueue.js";

// Bug réel : une candidature partenaire qui échouait après les 3 tentatives
// réseau de submitPartnerApplication était perdue en silence — rien ne la
// gardait pour une nouvelle tentative plus tard.
describe("partnerApplicationQueue", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("garde une candidature mise en file d'attente", () => {
    enqueuePartnerApplication({ name: "Test" });
    const queue = getQueuedPartnerApplications();
    expect(queue).toHaveLength(1);
    expect(queue[0].data).toEqual({ name: "Test" });
  });

  it("retire une candidature de la file une fois retentée avec succès", async () => {
    enqueuePartnerApplication({ name: "Réussira" });
    const submitFn = vi.fn(async () => ({ success: true }));
    await flushPartnerApplicationQueue(submitFn);
    expect(submitFn).toHaveBeenCalledWith({ name: "Réussira" });
    expect(getQueuedPartnerApplications()).toHaveLength(0);
  });

  it("garde la candidature en file si la nouvelle tentative échoue aussi", async () => {
    enqueuePartnerApplication({ name: "Échouera encore" });
    const submitFn = vi.fn(async () => ({ success: false }));
    await flushPartnerApplicationQueue(submitFn);
    expect(getQueuedPartnerApplications()).toHaveLength(1);
  });
});
