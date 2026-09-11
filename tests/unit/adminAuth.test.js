import { describe, expect, it, vi, beforeEach } from "vitest";

// Le client Supabase est remplacé : ces tests portent sur les règles
// d'autorisation, pas sur le réseau.
const auth = {
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(async () => ({})),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
};
const rows = { data: null, error: null };
const query = {
  select: () => query,
  eq: () => query,
  maybeSingle: async () => rows,
};
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: { auth, from: () => query },
}));

const {
  hasPermission, refreshSession, isAuthenticated, login, logout, initAdminUsers,
} = await import("../../src/services/adminAuth.js");

const ACTIVE_ADMIN = {
  id: "row-1", email: "admin@gaspardnz.style", role: "admin",
  display_name: "Admin", active: true,
};
const withSession = (email = "admin@gaspardnz.style") =>
  auth.getSession.mockResolvedValue({ data: { session: { user: { id: "u1", email } } } });

beforeEach(() => {
  rows.data = null;
  rows.error = null;
  auth.getSession.mockResolvedValue({ data: { session: null } });
});

describe("hasPermission", () => {
  const ORDER = ["viewer", "editor", "admin", "owner"];
  it.each(ORDER.flatMap((required) => ORDER.map((held) => [required, held])))(
    "exiger %s avec le rôle %s",
    (required, held) => {
      expect(hasPermission(required, held)).toBe(ORDER.indexOf(held) >= ORDER.indexOf(required));
    },
  );

  it.each([[undefined], [null], [""], ["superadmin"], ["Owner"], [" owner"], [0], [{}]])(
    "refuse tout droit à un rôle non reconnu (%s)",
    (bogus) => {
      expect(hasPermission("viewer", bogus)).toBe(false);
    },
  );

  it("ne se laisse pas contourner par un rôle exigé inconnu", () => {
    // Un rang inconnu vaut 0 : n'importe qui le satisfait. C'est voulu pour un
    // rôle EXIGÉ absent, mais il ne doit jamais élever le rôle DÉTENU.
    expect(hasPermission("inconnu", "viewer")).toBe(true);
    expect(hasPermission("owner", "inconnu")).toBe(false);
  });
});

describe("refreshSession — autorité unique", () => {
  it("refuse sans session Supabase, même si le navigateur prétend le contraire", async () => {
    localStorage.setItem("gnz-admin-profile", JSON.stringify({ role: "owner" }));
    expect(await refreshSession()).toBeNull();
    expect(await isAuthenticated()).toBe(false);
  });

  it("refuse une session valide dont le compte n'est pas dans admin_access", async () => {
    withSession("inconnu@example.com");
    rows.data = null;
    expect(await refreshSession()).toBeNull();
  });

  it("refuse un compte désactivé", async () => {
    withSession();
    // La requête filtre sur active = true : un compte désactivé ne remonte pas.
    rows.data = null;
    expect(await refreshSession()).toBeNull();
  });

  it("refuse quand la lecture de admin_access échoue", async () => {
    withSession();
    rows.error = { message: "rls" };
    rows.data = ACTIVE_ADMIN;
    expect(await refreshSession()).toBeNull();
  });

  it("accepte une session valide adossée à un accès actif", async () => {
    withSession();
    rows.data = ACTIVE_ADMIN;
    const profile = await refreshSession();
    expect(profile).toMatchObject({ role: "admin", email: "admin@gaspardnz.style" });
    expect(await isAuthenticated()).toBe(true);
  });

  it("ne persiste jamais le profil dans le navigateur", async () => {
    withSession();
    rows.data = ACTIVE_ADMIN;
    await refreshSession();
    expect(localStorage.getItem("gnz-admin-profile")).toBeNull();
    expect(Object.keys(localStorage)).not.toContain("gnz-admin-profile");
  });
});

describe("login", () => {
  it("refuse des identifiants vides sans appeler Supabase", async () => {
    const result = await login("", "");
    expect(result.success).toBe(false);
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("déconnecte un compte authentifié mais non autorisé", async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: { id: "u2", email: "x@y.z" } }, error: null });
    rows.data = null;
    const result = await login("x@y.z", "motdepasse");
    expect(result.success).toBe(false);
    expect(auth.signOut).toHaveBeenCalled();
  });

  it("normalise l'email avant de tenter la connexion", async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: { id: "u3", email: "a@b.c" } }, error: null });
    rows.data = { ...ACTIVE_ADMIN, email: "a@b.c" };
    await login("  A@B.C  ", "motdepasse");
    expect(auth.signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({ email: "a@b.c" }),
    );
  });
});

describe("initAdminUsers", () => {
  it("purge l'ancien cache de profil laissé par les versions précédentes", () => {
    localStorage.setItem("gnz-admin-profile", JSON.stringify({ role: "owner" }));
    initAdminUsers();
    expect(localStorage.getItem("gnz-admin-profile")).toBeNull();
  });
});

describe("logout", () => {
  it("ferme la session Supabase", async () => {
    await logout();
    expect(auth.signOut).toHaveBeenCalled();
  });
});
