import handler0 from "../../server/notifications/admin-push-pair.js";
import handler1 from "../../server/notifications/push-test-device.js";
import handler2 from "../../server/notifications/admin-notification-test.js";
import handler3 from "../../server/notifications/admin-notifications.js";
import handler4 from "../../server/notifications/push-subscription.js";
import handler5 from "../../server/notifications/send-campaign.js";

const handlers = new Map([
  ["admin-push-pair", handler0],
  ["push-test-device", handler1],
  ["admin-notification-test", handler2],
  ["admin-notifications", handler3],
  ["push-subscription", handler4],
  ["send-campaign", handler5],
]);

export default function handler(req, res) {
  const action = req.query?.action;
  const route = typeof action === "string" ? handlers.get(action) : undefined;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-GaspardNZ-Notifications", "apns-opt-in-v1");
  if (!route) return res.status(404).json({ error: "Route inconnue" });
  return route(req, res);
}
