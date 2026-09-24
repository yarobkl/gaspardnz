import { describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Les écrans admin interrogent Supabase au montage : on neutralise le réseau,
// ce test porte sur le filtrage par rôle de la navigation et sur le
// branchement réel des sections (AdminLayout charge maintenant lui-même
// l'écran de chaque section via Admin/adminSections.js, il n'y a plus de
// contenu injecté depuis l'extérieur).
const emptyQuery = {
  select: () => emptyQuery, eq: () => emptyQuery, gte: () => emptyQuery,
  lt: () => emptyQuery, order: () => emptyQuery, limit: () => emptyQuery,
  maybeSingle: async () => ({ data: null, error: null }),
  single: async () => ({ data: null, error: null }),
  then: (resolve) => resolve({ data: [], error: null }),
};
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      getUser: async () => ({ data: { user: null } }),
      signOut: async () => ({}),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    from: () => emptyQuery,
    rpc: async () => ({ data: null, error: null }),
    channel: () => ({ on() { return this; }, subscribe() { return this; } }),
    removeChannel: () => {},
  },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminLayout = (await import("../../src/components/Admin/AdminLayout.jsx")).default;

const navFor = (role) => {
  // Plusieurs rôles sont rendus dans un même test : sans démontage, les
  // navigations s'accumulent dans le document.
  cleanup();
  render(<AdminLayout currentSection="dashboard" onSectionChange={() => {}} user={{ email: `${role}@test.local`, displayName: `Compte ${role}`, role }} />);
  const nav = screen.getByRole("navigation", { name: /administration/i });
  return within(nav).getAllByRole("button").map((b) => b.textContent.replace(/^\W+/, "").trim());
};

describe("filtrage de la navigation admin par rôle", () => {
  it("le propriétaire voit la gestion des utilisateurs", () => {
    const labels = navFor("owner");
    expect(labels).toContain("Utilisateurs");
    expect(labels).toContain("Paramètres");
  });

  it("l'administrateur ne voit pas la gestion des utilisateurs", () => {
    const labels = navFor("admin");
    expect(labels).not.toContain("Utilisateurs");
    expect(labels).toContain("Paramètres");
  });

  it("l'éditeur ne voit ni utilisateurs ni paramètres", () => {
    const labels = navFor("editor");
    expect(labels).not.toContain("Utilisateurs");
    expect(labels).not.toContain("Paramètres");
    expect(labels).toContain("Contenu du site");
  });

  it("le lecteur seul ne voit aucun écran d'édition", () => {
    const labels = navFor("viewer");
    for (const forbidden of ["Utilisateurs", "Paramètres", "Contenu du site", "Médias & photos"]) {
      expect(labels).not.toContain(forbidden);
    }
    expect(labels).toContain("Tableau de bord");
    expect(labels).toContain("CRM");
  });

  it("un rôle absent ou inconnu ne donne accès à rien", () => {
    for (const role of [undefined, "superadmin"]) {
      cleanup();
      render(<AdminLayout currentSection="dashboard" onSectionChange={() => {}} user={{ role }} />);
      const nav = screen.getByRole("navigation", { name: /administration/i });
      expect(within(nav).queryAllByRole("button")).toHaveLength(0);
    }
  });

  it("les rôles élevés voient au moins autant d'écrans que les rôles bas", () => {
    const counts = ["viewer", "editor", "admin", "owner"].map((r) => navFor(r).length);
    for (let i = 1; i < counts.length; i += 1) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    }
    expect(counts[3]).toBeGreaterThan(counts[0]);
  });

  it("le couturier ne voit QUE « Commandes sur-mesure », rien d'autre — pas même le tableau de bord", () => {
    const labels = navFor("couturier");
    expect(labels).toEqual(["Commandes sur-mesure"]);
  });
});

describe("accès par URL directe", () => {
  const renderAt = (role, path) => {
    window.history.replaceState({}, "", path);
    render(<AdminLayout currentSection="users" onSectionChange={() => {}} user={{ email: `${role}@test.local`, role }} />);
  };

  it.each(["viewer", "editor", "admin"])(
    "refuse /admin/users à un compte %s et ne monte aucun module",
    async (role) => {
      renderAt(role, "/admin/users");
      expect(await screen.findByText(/n'est pas accessible avec votre rôle/i)).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Utilisateurs" })).not.toBeInTheDocument();
    },
  );

  it("laisse le propriétaire accéder à /admin/users et y charge le vrai écran Utilisateurs", async () => {
    renderAt("owner", "/admin/users");
    expect(await screen.findByRole("heading", { name: "Utilisateurs" })).toBeInTheDocument();
    expect(screen.queryByText(/n'est pas accessible avec votre rôle/i)).not.toBeInTheDocument();
  });
});

describe("chaque section branchée charge bien son propre écran", () => {
  // Garde-fou contre l'oubli d'une entrée dans Admin/adminSections.js : si
  // une section reste sans composant, cet écran resterait bloqué sur
  // « Module en cours de chargement. » en silence.
  it.each([
    ["dashboard", "Tableau de bord"],
    ["crm", "CRM"],
    ["media", "Médias & photos"],
    ["settings", "Paramètres"],
  ])("la section « %s » affiche son propre titre « %s »", async (section, title) => {
    cleanup();
    window.history.replaceState({}, "", `/admin/${section}`);
    render(<AdminLayout currentSection={section} onSectionChange={() => {}} user={{ email: "owner@test.local", role: "owner" }} />);
    expect(await screen.findByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.queryByText("Module en cours de chargement.")).not.toBeInTheDocument();
  });
});

describe("arrivée sur l'admin et menu mobile", () => {
  it("le couturier qui arrive sur la page par défaut voit ses commandes, pas un refus", async () => {
    cleanup();
    window.history.replaceState({}, "", "/admin");
    render(<AdminLayout currentSection="dashboard" onSectionChange={() => {}} user={{ email: "atelier@test.local", role: "couturier" }} />);
    expect(await screen.findByRole("heading", { name: "Commandes sur-mesure" })).toBeInTheDocument();
    expect(screen.queryByText(/n'est pas accessible avec votre rôle/i)).not.toBeInTheDocument();
  });

  it("le couturier qui force une autre section interdite reste refusé", async () => {
    cleanup();
    window.history.replaceState({}, "", "/admin/crm");
    render(<AdminLayout currentSection="crm" onSectionChange={() => {}} user={{ email: "atelier@test.local", role: "couturier" }} />);
    expect(await screen.findByText(/n'est pas accessible avec votre rôle/i)).toBeInTheDocument();
  });

  it("Échap ferme le menu mobile ouvert", async () => {
    cleanup();
    window.history.replaceState({}, "", "/admin");
    const user = userEvent.setup();
    render(<AdminLayout currentSection="dashboard" onSectionChange={() => {}} user={{ email: "owner@test.local", role: "owner" }} />);
    await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
    expect(screen.getByRole("button", { name: "Fermer le menu" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: "Fermer le menu" })).not.toBeInTheDocument();
  });

  it("repasser en largeur bureau ferme le menu mobile (plus de voile qui bloque l'écran)", async () => {
    cleanup();
    window.history.replaceState({}, "", "/admin");
    const listeners = new Set();
    const original = window.matchMedia;
    window.matchMedia = (query) => ({
      matches: false, media: query,
      addEventListener: (_type, cb) => listeners.add(cb),
      removeEventListener: (_type, cb) => listeners.delete(cb),
    });
    try {
      const user = userEvent.setup();
      render(<AdminLayout currentSection="dashboard" onSectionChange={() => {}} user={{ email: "owner@test.local", role: "owner" }} />);
      await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
      expect(listeners.size).toBe(1);
      act(() => { for (const cb of listeners) cb({ matches: true }); });
      expect(screen.queryByRole("button", { name: "Fermer le menu" })).not.toBeInTheDocument();
    } finally {
      window.matchMedia = original;
    }
  });

  it("une carte KPI cliquable du tableau de bord s'active aussi au clavier", async () => {
    cleanup();
    window.history.replaceState({}, "", "/admin");
    const onSectionChange = vi.fn();
    const user = userEvent.setup();
    render(<AdminLayout currentSection="dashboard" onSectionChange={onSectionChange} user={{ email: "owner@test.local", role: "owner" }} />);
    const kpi = (await screen.findByText("Demandes reçues")).closest('[role="button"]');
    kpi.focus();
    await user.keyboard("{Enter}");
    expect(onSectionChange).toHaveBeenCalledWith("crm");
  });
});
