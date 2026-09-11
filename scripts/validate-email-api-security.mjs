import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  consumePersistentRateLimit,
  escapeHtml,
  hashRateLimitKey,
  isAllowedOrigin,
  isBotSubmission,
  resolveRecipients,
  sanitizeText,
} from "../api/send-email.js";

process.env.NODE_ENV = "production";
process.env.ALLOWED_ORIGINS = "https://gaspardnz.style";
process.env.ALLOWED_EMAIL_RECIPIENTS = "gaspardnz.contact@gmail.com,eliebakala@gmail.com";
process.env.RATE_LIMIT_SALT = "test-only-rate-limit-salt";

assert.equal(isAllowedOrigin("https://gaspardnz.style"), true);
assert.equal(isAllowedOrigin("https://evil.example"), false);
assert.equal(isAllowedOrigin("not-a-url"), false);

assert.deepEqual(resolveRecipients({
  to: ["gaspardnz.contact@gmail.com"],
  cc: ["eliebakala@gmail.com"],
}).ok, true);

assert.equal(resolveRecipients({
  to: ["attacker@example.com"],
  cc: [],
}).ok, false);

assert.equal(sanitizeText("Bonjour\u0000\n test", 20), "Bonjour test");
assert.equal(escapeHtml("<img src=x onerror=alert(1)>"), "&lt;img src=x onerror=alert(1)&gt;");

const now = 2_000_000;
assert.equal(isBotSubmission({ website: "https://spam.example" }, now), true, "honeypot must reject bots");
assert.equal(isBotSubmission({ website: "", formStartedAt: now - 500 }, now), true, "instant submit must be rejected");
assert.equal(isBotSubmission({ website: "", formStartedAt: now - 2_000 }, now), false, "human-like submit must pass");
assert.equal(isBotSubmission({ website: "", formStartedAt: now - (3 * 60 * 60 * 1000) }, now), true, "stale form must be rejected");
assert.equal(isBotSubmission({}, now), false, "older open bundles remain compatible and are still rate-limited");

const hashA = hashRateLimitKey("ip:203.0.113.4", "unit-test-salt");
const hashB = hashRateLimitKey("ip:203.0.113.4", "unit-test-salt");
assert.equal(hashA, hashB, "rate-limit hashing must be deterministic");
assert.equal(hashA.includes("203.0.113.4"), false, "raw IP must not be stored in the rate-limit key");
assert.equal(hashA.length, 64, "SHA-256 key must be hexadecimal");

let rpcCall = null;
const allowedDb = {
  rpc: async (name, params) => {
    rpcCall = { name, params };
    return { data: true, error: null };
  },
};
const allowed = await consumePersistentRateLimit(allowedDb, {
  key: "ip:203.0.113.4",
  action: "send_email_ip",
  limit: 8,
  windowSeconds: 600,
});
assert.deepEqual(allowed, { ok: true, allowed: true, reason: "allowed" });
assert.equal(rpcCall.name, "consume_public_rate_limit");
assert.equal(rpcCall.params.p_limit, 8);
assert.equal(rpcCall.params.p_window_seconds, 600);
assert.equal(rpcCall.params.p_key_hash.includes("203.0.113.4"), false);

const deniedDb = { rpc: async () => ({ data: false, error: null }) };
assert.deepEqual(
  await consumePersistentRateLimit(deniedDb, { key: "global", action: "send_email_global", limit: 120, windowSeconds: 600 }),
  { ok: true, allowed: false, reason: "limited" },
);

const brokenDb = { rpc: async () => ({ data: null, error: { message: "db unavailable" } }) };
assert.deepEqual(
  await consumePersistentRateLimit(brokenDb, { key: "global", action: "send_email_global", limit: 120, windowSeconds: 600 }),
  { ok: false, allowed: false, reason: "unavailable" },
  "rate-limit backend failure must fail closed",
);

const source = readFileSync("api/send-email.js", "utf8");
assert.equal(source.includes("new Map("), false, "serverless email rate limit must not use process memory");
assert.equal(source.includes("consume_public_rate_limit"), true, "persistent Supabase limiter must be used");
assert.equal(source.includes("Retry-After"), true, "429 responses must tell clients when to retry");
assert.equal(source.includes("MAX_REQUEST_BYTES"), true, "oversized payloads must be bounded");
assert.equal(source.includes("SUPABASE_SERVICE_ROLE_KEY"), true, "rate limit must run with server-only credentials");

console.log("Email API security validation passed");
