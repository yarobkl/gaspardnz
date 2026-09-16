// Fausse base en mémoire pour les tests de composants admin : imite juste
// assez du client Supabase (.from().select()/.update()/.insert()/.eq()/.single())
// pour que le vrai code de src/services/adminData.js s'exécute contre elle,
// sans réseau. Les fonctions testées ne sont donc pas des mocks : ce sont les
// vraies fonctions du projet.
export function createFakeSupabaseTables(initial = {}) {
  const state = {};
  for (const [table, rows] of Object.entries(initial)) state[table] = rows.map((r) => ({ ...r }));

  function makeQuery(table) {
    let mode = "select";
    let payload = null;
    const filters = [];
    let single = false;

    const matches = (row) => filters.every(([col, val]) => row[col] === val);

    const run = async () => {
      const rows = state[table] || (state[table] = []);
      if (mode === "update") {
        const touched = [];
        for (let i = 0; i < rows.length; i += 1) {
          if (matches(rows[i])) { rows[i] = { ...rows[i], ...payload }; touched.push(rows[i]); }
        }
        return single ? { data: touched[0] || null, error: null } : { data: touched, error: null };
      }
      if (mode === "insert" || mode === "upsert") {
        const row = { id: payload.id || `fake-${Math.random().toString(36).slice(2)}`, ...payload };
        rows.push(row);
        return { data: row, error: null };
      }
      if (mode === "delete") {
        state[table] = rows.filter((r) => !matches(r));
        return { data: null, error: null };
      }
      const filtered = rows.filter(matches);
      return single ? { data: filtered[0] || null, error: null } : { data: filtered, error: null };
    };

    const api = {
      select() { return api; },
      order() { return api; },
      gte() { return api; },
      lt() { return api; },
      limit() { return api; },
      eq(col, val) { filters.push([col, val]); return api; },
      update(p) { mode = "update"; payload = p; return api; },
      insert(p) { mode = "insert"; payload = p; return api; },
      upsert(p) { mode = "upsert"; payload = p; return api; },
      delete() { mode = "delete"; return api; },
      single() { single = true; return run(); },
      maybeSingle() { single = true; return run(); },
      then(resolve, reject) { return run().then(resolve, reject); },
    };
    return api;
  }

  return {
    state,
    supabase: {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        getUser: async () => ({ data: { user: null } }),
        signOut: async () => ({}),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      },
      from: (table) => makeQuery(table),
      rpc: async () => ({ data: null, error: null }),
      channel: () => ({ on() { return this; }, subscribe() { return this; } }),
      removeChannel: () => {},
      storage: { from: () => ({ upload: async () => ({ error: null }), getPublicUrl: () => ({ data: { publicUrl: "" } }), remove: async () => ({ error: null }) }) },
    },
  };
}
