// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = { adminAccess: [], authUsers: [] };
const calls = { createUser: [], updateUserById: [] };

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async (token) => {
        const caller = state.callers?.[token];
        return caller ? { data: { user: caller }, error: null } : { data: { user: null }, error: new Error("invalid token") };
      },
      admin: {
        listUsers: async () => ({ data: { users: state.authUsers }, error: null }),
        createUser: async (payload) => {
          calls.createUser.push(payload);
          const user = { id: `new-${state.authUsers.length + 1}`, email: payload.email };
          state.authUsers.push(user);
          return { data: { user }, error: null };
        },
        updateUserById: async (id, payload) => {
          calls.updateUserById.push({ id, payload });
          return { data: {}, error: null };
        },
      },
    },
    from(table) {
      if (table !== "admin_access") throw new Error(`table inattendue : ${table}`);
      return {
        select() { return this; },
        eq(col, val) { this._email = col === "email" ? val : this._email; return this; },
        async maybeSingle() {
          const row = state.adminAccess.find((r) => r.email === this._email);
          return { data: row || null, error: null };
        },
        async upsert(row) {
          const i = state.adminAccess.findIndex((r) => r.email === row.email);
          if (i >= 0) state.adminAccess[i] = { ...state.adminAccess[i], ...row };
          else state.adminAccess.push(row);
          return { data: row, error: null };
        },
      };
    },
  }),
}));

const { default: handler } = await import("../../api/admin-create-user.js");

function makeReq({ token, body }) {
  return { method: "POST", headers: token ? { authorization: `Bearer ${token}` } : {}, body };
}
function makeRes() {
  return { statusCode: null, body: null, status(c) { this.statusCode = c; return this; }, json(p) { this.body = p; return this; } };
}

beforeEach(() => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-de-test";
  calls.createUser.length = 0;
  calls.updateUserById.length = 0;
  state.adminAccess = [{ email: "owner@test.local", role: "owner", active: true }, { email: "editor@test.local", role: "editor", active: true }];
  state.authUsers = [{ id: "existing-1", email: "deja-inscrit@test.local" }];
  state.callers = {
    "token-owner": { email: "owner@test.local" },
    "token-editor": { email: "editor@test.local" },
  };
});

describe("autorisation", () => {
  it("refuse sans en-tête d'autorisation", async () => {
    const res = makeRes();
    await handler(makeReq({ body: { email: "a@b.fr", role: "editor" } }), res);
    expect(res.statusCode).toBe(401);
    expect(calls.createUser).toHaveLength(0);
  });

  it("refuse un appelant qui n'est pas propriétaire", async () => {
    const res = makeRes();
    await handler(makeReq({ token: "token-editor", body: { email: "a@b.fr", role: "editor" } }), res);
    expect(res.statusCode).toBe(403);
    expect(calls.createUser).toHaveLength(0);
  });

  it("refuse un jeton invalide", async () => {
    const res = makeRes();
    await handler(makeReq({ token: "token-inconnu", body: { email: "a@b.fr", role: "editor" } }), res);
    expect(res.statusCode).toBe(401);
  });
});

describe("validation", () => {
  it("refuse une adresse email invalide", async () => {
    const res = makeRes();
    await handler(makeReq({ token: "token-owner", body: { email: "pas-un-email", role: "editor" } }), res);
    expect(res.statusCode).toBe(400);
    expect(calls.createUser).toHaveLength(0);
  });

  it("refuse le rôle owner — pas plus depuis cette route que depuis le formulaire", async () => {
    const res = makeRes();
    await handler(makeReq({ token: "token-owner", body: { email: "nouveau@test.local", role: "owner" } }), res);
    expect(res.statusCode).toBe(400);
    expect(calls.createUser).toHaveLength(0);
  });

  it("refuse un rôle inconnu", async () => {
    const res = makeRes();
    await handler(makeReq({ token: "token-owner", body: { email: "nouveau@test.local", role: "superadmin" } }), res);
    expect(res.statusCode).toBe(400);
  });
});

describe("création d'un nouveau compte", () => {
  it("crée le compte Supabase, active la confirmation, attribue le rôle et rend le mot de passe", async () => {
    const res = makeRes();
    await handler(makeReq({ token: "token-owner", body: { email: "couturier-a@test.local", displayName: "Atelier Dupont", role: "couturier" } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.created).toBe(true);
    expect(typeof res.body.password).toBe("string");
    expect(res.body.password.length).toBeGreaterThanOrEqual(12);

    expect(calls.createUser).toHaveLength(1);
    expect(calls.createUser[0].email).toBe("couturier-a@test.local");
    expect(calls.createUser[0].email_confirm).toBe(true);
    expect(calls.createUser[0].password).toBe(res.body.password);
    expect(calls.updateUserById).toHaveLength(0);

    const row = state.adminAccess.find((r) => r.email === "couturier-a@test.local");
    expect(row?.role).toBe("couturier");
    expect(row?.active).toBe(true);
  });

  it("génère un mot de passe sans caractères ambigus, différent à chaque appel", async () => {
    const res1 = makeRes(); const res2 = makeRes();
    await handler(makeReq({ token: "token-owner", body: { email: "un@test.local", role: "viewer" } }), res1);
    await handler(makeReq({ token: "token-owner", body: { email: "deux@test.local", role: "viewer" } }), res2);
    expect(res1.body.password).not.toBe(res2.body.password);
    expect(res1.body.password).toMatch(/^[A-HJ-NP-Za-hj-np-z2-9]+$/);
  });
});

describe("compte déjà existant", () => {
  it("réinitialise le mot de passe au lieu de recréer un compte", async () => {
    const res = makeRes();
    await handler(makeReq({ token: "token-owner", body: { email: "deja-inscrit@test.local", role: "editor" } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.created).toBe(false);
    expect(calls.createUser).toHaveLength(0);
    expect(calls.updateUserById).toHaveLength(1);
    expect(calls.updateUserById[0].id).toBe("existing-1");
    expect(calls.updateUserById[0].payload.password).toBe(res.body.password);
  });
});

describe("configuration manquante", () => {
  it("échoue proprement si la clé service_role n'est pas configurée", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = makeRes();
    await handler(makeReq({ token: "token-owner", body: { email: "x@test.local", role: "editor" } }), res);
    expect(res.statusCode).toBe(503);
  });
});
