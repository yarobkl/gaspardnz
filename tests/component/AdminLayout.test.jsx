import { describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

// Les écrans admin interrogent Supabase au montage : on neutralise le réseau,
// ce test porte sur le filtrage par rôle de la navigation.
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

// AdminLayout injecte `onNavigate` dans l'enfant du tableau de bord via
// cloneElement : un <div> brut déclencherait un avertissement React.
const Section = ({ children }) => <section>{children}</section>;

const navFor = (role) => {
  // Plusieurs rôles sont rendus dans un même test : sans démontage, les
  // navigations s'accumulent dans le document.
  cleanup();
  render(
    <AdminLayout currentSection="dashboard" onSectionChange={() => {}}
      user={{ email: `${role}@test.local`, displayName: `Compte ${role}`, role }}>
      <Section>contenu</Section>
    </AdminLayout>,
  );
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
      render(
        <AdminLayout currentSection="dashboard" onSectionChange={() => {}} user={{ role }}>
          <Section>contenu</Section>
        </AdminLayout>,
      );
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
});

describe("accès par URL directe", () => {
  const renderAt = (role, path) => {
    window.history.replaceState({}, "", path);
    render(
      <AdminLayout currentSection="users" onSectionChange={() => {}}
        user={{ email: `${role}@test.local`, role }}>
        <Section>module utilisateurs</Section>
      </AdminLayout>,
    );
  };

  it.each(["viewer", "editor", "admin"])(
    "refuse /admin/users à un compte %s et ne monte aucun module",
    (role) => {
      renderAt(role, "/admin/users");
      expect(screen.getByText(/n'est pas accessible avec votre rôle/i)).toBeInTheDocument();
      expect(screen.queryByText("module utilisateurs")).not.toBeInTheDocument();
    },
  );

  it("laisse le propriétaire accéder à /admin/users", () => {
    renderAt("owner", "/admin/users");
    expect(screen.queryByText(/n'est pas accessible avec votre rôle/i)).not.toBeInTheDocument();
    expect(screen.getByText("module utilisateurs")).toBeInTheDocument();
  });
});
