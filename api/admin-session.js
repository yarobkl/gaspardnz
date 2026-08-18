import {
  createHmac,
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const COOKIE_NAME = "__Host-gnz_admin_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const loginAttempts = new Map();

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const safeEqual = (left, right) => {
  const leftBuffer = createHash("sha256").update(String(left)).digest();
  const rightBuffer = createHash("sha256").update(String(right)).digest();
  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const createPasswordHash = (password, salt = randomBytes(16).toString("hex")) => {
  if (typeof password !== "string" || password.length < 12) {
    throw new Error("Le mot de passe administrateur doit contenir au moins 12 caractères");
  }

  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
};

export const verifyPassword = (password, storedHash) => {
  if (typeof password !== "string" || typeof storedHash !== "string") return false;

  const [algorithm, salt, expectedHash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHash) return false;

  try {
    const candidateHash = scryptSync(password, salt, 64).toString("hex");
    return safeEqual(candidateHash, expectedHash);
  } catch {
    return false;
  }
};

const signPayload = (payload, secret) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export const createSessionToken = ({ email, secret, now = Date.now() }) => {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("Le secret de session administrateur doit contenir au moins 32 caractères");
  }
  const issuedAt = Math.floor(now / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: normalizeEmail(email),
    permission: "admin_full",
    iat: issuedAt,
    exp: issuedAt + SESSION_DURATION_SECONDS,
  })).toString("base64url");

  return `${payload}.${signPayload(payload, secret)}`;
};

export const verifySessionToken = ({ token, secret, now = Date.now() }) => {
  if (typeof token !== "string" || typeof secret !== "string" || secret.length < 32) return null;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !safeEqual(signature, signPayload(payload, secret))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const nowSeconds = Math.floor(now / 1000);
    if (
      !session.sub ||
      session.permission !== "admin_full" ||
      !Number.isInteger(session.iat) ||
      !Number.isInteger(session.exp) ||
      session.iat > nowSeconds + 60 ||
      session.exp <= nowSeconds
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
};

const getConfig = () => ({
  email: normalizeEmail(process.env.ADMIN_AUTH_EMAIL),
  passwordHash: process.env.ADMIN_AUTH_PASSWORD_HASH || "",
  sessionSecret: process.env.ADMIN_SESSION_SECRET || "",
});

const isConfigValid = ({ email, passwordHash, sessionSecret }) =>
  Boolean(email && passwordHash.startsWith("scrypt$") && sessionSecret.length >= 32);

const getAllowedHosts = () => {
  const hosts = new Set(["gaspardnz.style", "www.gaspardnz.style"]);
  String(process.env.SITE_URL || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      try {
        hosts.add(new URL(value).host);
      } catch {}
    });
  if (process.env.VERCEL_URL) hosts.add(process.env.VERCEL_URL);
  return hosts;
};

export const isAllowedOrigin = (origin) => {
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    return getAllowedHosts().has(new URL(origin).host);
  } catch {
    return false;
  }
};

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        if (separator === -1) return [part, ""];
        return [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
      }),
  );

const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";

const getRecentAttempts = (key) => {
  const now = Date.now();
  const recent = (loginAttempts.get(key) || []).filter((timestamp) => now - timestamp < LOGIN_WINDOW_MS);
  if (recent.length > 0) loginAttempts.set(key, recent);
  else loginAttempts.delete(key);
  return recent;
};

const isRateLimited = (key) => getRecentAttempts(key).length >= MAX_LOGIN_ATTEMPTS;

const recordFailedLogin = (key) => {
  const recent = getRecentAttempts(key);
  recent.push(Date.now());
  loginAttempts.set(key, recent);
};

const setNoStoreHeaders = (res) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Vary", "Cookie");
};

const sessionCookie = (token, maxAge = SESSION_DURATION_SECONDS) =>
  `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

export default async function handler(req, res) {
  setNoStoreHeaders(res);
  const config = getConfig();

  if (req.method === "GET") {
    if (!isConfigValid(config)) {
      return res.status(503).json({ authenticated: false, error: "Admin non configuré" });
    }

    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
    const session = verifySessionToken({ token, secret: config.sessionSecret });
    if (!session || session.sub !== config.email) {
      return res.status(200).json({ authenticated: false });
    }

    return res.status(200).json({
      authenticated: true,
      user: { email: session.sub, permission: session.permission },
    });
  }

  if (req.method === "DELETE") {
    if (!isAllowedOrigin(req.headers.origin)) {
      return res.status(403).json({ error: "Requête refusée" });
    }
    res.setHeader("Set-Cookie", sessionCookie("", 0));
    return res.status(200).json({ success: true });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isConfigValid(config)) {
    return res.status(503).json({ error: "Espace administrateur non configuré" });
  }

  if (!isAllowedOrigin(req.headers.origin)) {
    return res.status(403).json({ error: "Requête refusée" });
  }

  const clientIp = getClientIp(req);
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Trop de tentatives. Réessayez plus tard." });
  }

  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const emailMatches = safeEqual(email, config.email);
  const passwordMatches = verifyPassword(password, config.passwordHash);
  if (
    email.length > 320 ||
    password.length > 256 ||
    !emailMatches ||
    !passwordMatches
  ) {
    recordFailedLogin(clientIp);
    return res.status(401).json({ error: "Email ou mot de passe incorrect" });
  }

  loginAttempts.delete(clientIp);
  const token = createSessionToken({ email: config.email, secret: config.sessionSecret });
  res.setHeader("Set-Cookie", sessionCookie(token));
  return res.status(200).json({
    success: true,
    user: { email: config.email, permission: "admin_full" },
  });
}
