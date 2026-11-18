import { afterEach, describe, expect, it, vi } from "vitest";
import { notificationEndpoint } from "../../src/services/notificationEndpoint.js";

afterEach(() => vi.unstubAllEnvs());

describe("notification API cutover", () => {
  it("conserve le backend existant tant que Cloudflare n'est pas activé", () => {
    vi.stubEnv("VITE_GNZ_NOTIFICATION_API_ORIGIN", "");
    expect(notificationEndpoint("/api/admin-notifications")).toBe("/api/admin-notifications");
    expect(notificationEndpoint("/api/notifications/push-subscription", { native: true }))
      .toBe("https://gaspardnz.style/api/notifications/push-subscription");
  });

  it("envoie l'admin et les appareils vers les routes Cloudflare compatibles", () => {
    vi.stubEnv("VITE_GNZ_NOTIFICATION_API_ORIGIN", "https://gaspardnz-notifications.eliebakala.workers.dev");
    expect(notificationEndpoint("/api/admin-notifications"))
      .toBe("https://gaspardnz-notifications.eliebakala.workers.dev/api/notifications/admin-notifications");
    expect(notificationEndpoint("/api/admin-notification-test"))
      .toBe("https://gaspardnz-notifications.eliebakala.workers.dev/api/notifications/admin-notification-test");
    expect(notificationEndpoint("/api/admin-push-pair"))
      .toBe("https://gaspardnz-notifications.eliebakala.workers.dev/api/notifications/admin-push-pair");
    expect(notificationEndpoint("/api/notifications/push-subscription", { native: true }))
      .toBe("https://gaspardnz-notifications.eliebakala.workers.dev/api/notifications/push-subscription");
  });

  it("refuse les destinations risquées et les routes hors notifications", () => {
    vi.stubEnv("VITE_GNZ_NOTIFICATION_API_ORIGIN", "https://gaspardnz-notifications.eliebakala.workers.dev");
    expect(() => notificationEndpoint("/api/contact")).toThrow("Route de notification non autorisée");
    vi.stubEnv("VITE_GNZ_NOTIFICATION_API_ORIGIN", "http://example.org");
    expect(() => notificationEndpoint("/api/admin-notifications")).toThrow("Serveur de notifications non configuré");
  });
});
