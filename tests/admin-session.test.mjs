import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import handler, {
  createPasswordHash,
  createSessionToken,
  verifyPassword,
  verifySessionToken,
} from "../api/admin-session.js";

const TEST_EMAIL = "owner@example.com";
const TEST_PASSWORD = "StrongPassword!2026";
const TEST_SECRET = "test-session-secret-with-at-least-32-characters";

const createResponse = () => ({
  statusCode: 200,
  headers: {},
  body: null,
  setHeader(name, value) {
    this.headers[name.toLowerCase()] = value;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

const setTestEnvironment = () => {
  process.env.NODE_ENV = "production";
  process.env.SITE_URL = "https://gaspardnz.style";
  process.env.ADMIN_AUTH_EMAIL = TEST_EMAIL;
  process.env.ADMIN_AUTH_PASSWORD_HASH = createPasswordHash(TEST_PASSWORD, "fixed-test-salt");
  process.env.ADMIN_SESSION_SECRET = TEST_SECRET;
};

test("scrypt accepte le bon mot de passe et refuse un mot de passe différent", () => {
  const hash = createPasswordHash(TEST_PASSWORD, "fixed-test-salt");
  assert.equal(verifyPassword(TEST_PASSWORD, hash), true);
  assert.equal(verifyPassword("WrongPassword!2026", hash), false);
});

test("une session signée refuse les jetons modifiés et expirés", () => {
  const now = Date.UTC(2026, 7, 18, 12);
  const token = createSessionToken({ email: TEST_EMAIL, secret: TEST_SECRET, now });
  assert.equal(verifySessionToken({ token, secret: TEST_SECRET, now })?.sub, TEST_EMAIL);
  assert.equal(verifySessionToken({ token: `${token}x`, secret: TEST_SECRET, now }), null);
  assert.equal(verifySessionToken({ token, secret: TEST_SECRET, now: now + (9 * 60 * 60 * 1000) }), null);
});

test("la connexion passe par le serveur et crée un cookie HttpOnly vérifiable", async () => {
  setTestEnvironment();
  const loginResponse = createResponse();
  await handler({
    method: "POST",
    headers: {
      origin: "https://gaspardnz.style",
      "x-forwarded-for": "203.0.113.10",
    },
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
    socket: {},
  }, loginResponse);

  assert.equal(loginResponse.statusCode, 200);
  assert.equal(loginResponse.body.success, true);
  assert.equal("token" in loginResponse.body, false);
  const cookie = loginResponse.headers["set-cookie"];
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);

  const sessionResponse = createResponse();
  await handler({
    method: "GET",
    headers: { cookie: cookie.split(";")[0] },
    socket: {},
  }, sessionResponse);

  assert.equal(sessionResponse.statusCode, 200);
  assert.equal(sessionResponse.body.authenticated, true);
  assert.equal(sessionResponse.body.user.email, TEST_EMAIL);
});

test("un mot de passe incorrect et une origine étrangère sont refusés", async () => {
  setTestEnvironment();
  const wrongPasswordResponse = createResponse();
  await handler({
    method: "POST",
    headers: {
      origin: "https://gaspardnz.style",
      "x-forwarded-for": "203.0.113.11",
    },
    body: { email: TEST_EMAIL, password: "WrongPassword!2026" },
    socket: {},
  }, wrongPasswordResponse);
  assert.equal(wrongPasswordResponse.statusCode, 401);
  assert.equal(wrongPasswordResponse.headers["set-cookie"], undefined);

  const foreignOriginResponse = createResponse();
  await handler({
    method: "POST",
    headers: {
      origin: "https://attacker.example",
      "x-forwarded-for": "203.0.113.12",
    },
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
    socket: {},
  }, foreignOriginResponse);
  assert.equal(foreignOriginResponse.statusCode, 403);
});

test("aucun compte par défaut n’est créé lorsque le serveur n’est pas configuré", async () => {
  delete process.env.ADMIN_AUTH_EMAIL;
  delete process.env.ADMIN_AUTH_PASSWORD_HASH;
  delete process.env.ADMIN_SESSION_SECRET;
  process.env.NODE_ENV = "production";

  const response = createResponse();
  await handler({
    method: "POST",
    headers: { origin: "https://gaspardnz.style" },
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
    socket: {},
  }, response);

  assert.equal(response.statusCode, 503);
  assert.equal(response.headers["set-cookie"], undefined);
});

test("la déconnexion expire explicitement le cookie serveur", async () => {
  setTestEnvironment();
  const response = createResponse();
  await handler({
    method: "DELETE",
    headers: { origin: "https://gaspardnz.style" },
    socket: {},
  }, response);

  assert.equal(response.statusCode, 200);
  assert.match(response.headers["set-cookie"], /Max-Age=0/);
  assert.match(response.headers["set-cookie"], /HttpOnly/);
});

test("le client ne contient plus de compte ou de session administrateur locale", () => {
  const clientAuth = readFileSync(new URL("../src/services/adminAuth.js", import.meta.url), "utf8");
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

  assert.match(clientAuth, /\/api\/admin-session/);
  assert.doesNotMatch(clientAuth, /gnz_admin_users/);
  assert.doesNotMatch(clientAuth, /gnz_admin_session/);
  assert.doesNotMatch(clientAuth, /passwordHash/);
  assert.doesNotMatch(app, /initAdminUsers/);
});
