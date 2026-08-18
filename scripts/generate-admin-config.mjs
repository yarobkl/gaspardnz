import { randomBytes } from "node:crypto";
import { createPasswordHash } from "../api/admin-session.js";

const email = String(process.argv[2] || "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage : npm run admin:generate-config -- votre@email.fr");
  process.exit(1);
}

const password = randomBytes(18).toString("base64url");
const passwordHash = createPasswordHash(password);
const sessionSecret = randomBytes(48).toString("base64url");

console.log("\nConfiguration administrateur générée. Conservez le mot de passe dans un gestionnaire sécurisé.\n");
console.log(`Adresse de connexion : ${email}`);
console.log(`Mot de passe : ${password}\n`);
console.log("Variables privées à ajouter dans Vercel :");
console.log(`ADMIN_AUTH_EMAIL=${email}`);
console.log(`ADMIN_AUTH_PASSWORD_HASH=${passwordHash}`);
console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`);
