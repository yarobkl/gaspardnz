import handler0 from "../../server/notifications/admin-push-pair.js";
import handler1 from "../../server/notifications/push-test-device.js";
import handler2 from "../../server/notifications/admin-notification-test.js";
import handler3 from "../../server/notifications/admin-notifications.js";

const handlers = new Map([
  ["admin-push-pair", handler0],
  ["push-test-device", handler1],
  ["admin-notification-test", handler2],
  ["admin-notifications", handler3],
]);

export default function handler(req, res) {
  const action = req.query?.action;
  const route = typeof action === "string" ? handlers.get(action) : undefined;
  res.setHeader("Cache-Control", "no-store");
  if (!route) return res.status(404).json({ error: "Route inconnue" });
  return route(req, res);
}
