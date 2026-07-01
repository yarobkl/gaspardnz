import assert from "node:assert/strict";
import { escapeHtml, isAllowedOrigin, resolveRecipients, sanitizeText } from "../api/send-email.js";

process.env.NODE_ENV = "production";
process.env.ALLOWED_ORIGINS = "https://gaspardnz.style";
process.env.ALLOWED_EMAIL_RECIPIENTS = "gaspardnz.contact@gmail.com,eliebakala@gmail.com";

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

console.log("Email API security validation passed");
