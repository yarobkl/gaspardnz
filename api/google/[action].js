import connect from "../../server/google/connect.js";
import sync from "../../server/google/sync.js";

const actions = new Map([
  ["connect", connect],
  ["sync", sync],
]);

export default function handler(req, res) {
  const action = req.query?.action;
  const target = typeof action === "string" ? actions.get(action) : undefined;
  res.setHeader("Cache-Control", "no-store");
  if (!target) return res.status(404).json({ error: "Route Google inconnue" });
  return target(req, res);
}
