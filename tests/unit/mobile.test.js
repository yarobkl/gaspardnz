import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";

// `git grep` sort en code 1 quand il ne trouve rien : sans ce garde-fou, le
// test échouerait précisément quand le code est correct.
const gitGrep = (pattern, paths) => {
  try {
    return execFileSync("git", ["grep", "-lI", "-e", pattern, "--", ...paths], { encoding: "utf8" }).trim();
  } catch (error) {
    if (error.status === 1) return "";
    throw error;
  }
};

const config = JSON.parse(readFileSync("capacitor.config.json", "utf8"));
const gitignore = readFileSync(".gitignore", "utf8");

describe("configuration Capacitor", () => {
  it("ne charge aucun contenu distant : le bundle embarqué fait foi", () => {
    // `server.url` ferait charger à l'application une URL distante au lieu de
    // son bundle : le contenu deviendrait modifiable sans passer par le store,
    // et une machine de développement pourrait se retrouver en production.
    expect(config.server?.url).toBeUndefined();
    expect(config.webDir).toBe("dist");
  });

  it("sert la WebView en HTTPS", () => {
    // En http://, l'origine de la WebView est non sécurisée : les API
    // sensibles du navigateur et l'isolation du stockage en dépendent.
    expect(config.server?.androidScheme).toBe("https");
  });

  it("refuse le trafic en clair et le contenu mixte", () => {
    expect(config.server?.cleartext).toBe(false);
    expect(config.android?.allowMixedContent).toBe(false);
  });

  it("désactive le débogage distant de la WebView", () => {
    // Activé, il permet d'inspecter et de piloter la WebView depuis un poste
    // relié en USB, y compris sur une version publiée.
    expect(config.android?.webContentsDebuggingEnabled).toBe(false);
  });

  it("conserve l'identifiant d'application publié", () => {
    // Changer l'appId d'une application déjà publiée la déréférence du store.
    expect(config.appId).toBe("com.gaspardnz.app");
  });
});

describe("secrets de signature mobile", () => {
  it.each(["*.jks", "*.keystore", "*.p12", "*.mobileprovision", "key.properties"])(
    "%s est ignoré par git",
    (pattern) => {
      expect(gitignore).toContain(pattern);
    },
  );

  it("aucun fichier de signature n'est suivi par git", () => {
    const tracked = execFileSync("git", ["ls-files"], { encoding: "utf8" })
      .split("\n")
      .filter((f) => /\.(jks|keystore|p12|pem|mobileprovision)$|key\.properties$|google-services\.json$|GoogleService-Info\.plist$/i.test(f));
    expect(tracked).toEqual([]);
  });
});

describe("secrets côté client", () => {
  const supabaseClient = readFileSync("src/services/supabaseClient.js", "utf8");

  it("n'embarque aucune clé de service Supabase", () => {
    // Une service role key contourne toutes les politiques RLS. Embarquée dans
    // une application mobile, elle est extractible de l'APK par n'importe qui.
    expect(supabaseClient).not.toMatch(/service_role|SERVICE_ROLE|sb_secret_/);
    expect(supabaseClient).toMatch(/sb_publishable_/);
  });

  it.each(["SMTP_PASSWORD", "EMAIL_PASSWORD", "GOOGLE_CLIENT_SECRET", "CALENDLY_TOKEN"])(
    "n'expose pas %s via une variable VITE_ (donc dans le bundle)",
    (name) => {
      expect(gitGrep(`VITE_${name}`, ["src", "api", "index.html"])).toBe("");
    },
  );
});
