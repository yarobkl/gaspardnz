import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const fetchCalls = [];
let fetchResponse = { success: true, created: true, password: "Ab3dEfGh4jKm" };

vi.stubGlobal("fetch", vi.fn(async (url, options) => {
  fetchCalls.push({ url, body: JSON.parse(options.body) });
  return { ok: fetchResponse.ok !== false, json: async () => fetchResponse };
}));

const USERS = [
  { id: "u1", email: "owner@test.local", display_name: "Gaspard", role: "owner", active: true, created_at: "2026-01-01" },
  { id: "u2", email: "couturier-a@test.local", display_name: "Atelier Dupont", role: "couturier", active: true, created_at: "2026-02-01" },
];

vi.mock("../../src/services/adminAuth.js", () => ({
  getAllUsers: async () => USERS,
  deleteUser: vi.fn(async () => ({ success: true })),
  generateUserAccess: async (email, displayName, role) => {
    const res = await fetch("/api/admin-create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer token-de-test" },
      body: JSON.stringify({ email, displayName, role }),
    });
    const payload = await res.json();
    return res.ok && payload.success ? { success: true, password: payload.password, created: payload.created } : { success: false, error: payload.error };
  },
}));

const AdminUsers = (await import("../../src/components/Admin/AdminUsers.jsx")).default;

beforeEach(() => {
  fetchCalls.length = 0;
  fetchResponse = { success: true, created: true, password: "Ab3dEfGh4jKm" };
});

describe("Générer un accès (identifiant + mot de passe)", () => {
  it("crée un accès et affiche le mot de passe généré, une seule fois", async () => {
    const user = userEvent.setup();
    render(<AdminUsers />);
    await screen.findByText("owner@test.local");

    await user.type(screen.getByLabelText("Email"), "couturier-b@test.local");
    await user.selectOptions(screen.getByLabelText("Rôle"), "couturier");
    await user.click(screen.getByRole("button", { name: /Générer l'accès/ }));

    expect(await screen.findByDisplayValue("Ab3dEfGh4jKm")).toBeInTheDocument();
    expect(fetchCalls[0].body).toEqual({ email: "couturier-b@test.local", displayName: "", role: "couturier" });

    // Le mot de passe reste affiché tant qu'on ne ferme pas explicitement —
    // pas comme un toast qui s'efface tout seul après quelques secondes.
    expect(screen.getByText(/ne sera plus jamais affiché/)).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 200));
    expect(screen.getByDisplayValue("Ab3dEfGh4jKm")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /J'ai transmis les identifiants/ }));
    expect(screen.queryByDisplayValue("Ab3dEfGh4jKm")).not.toBeInTheDocument();
  });

  it("affiche l'erreur du serveur sans planter si la génération échoue", async () => {
    fetchResponse = { ok: false, error: "Réservé au propriétaire du compte" };
    const user = userEvent.setup();
    render(<AdminUsers />);
    await screen.findByText("owner@test.local");
    await user.type(screen.getByLabelText("Email"), "x@test.local");
    await user.click(screen.getByRole("button", { name: /Générer l'accès/ }));
    expect(await screen.findByText("Réservé au propriétaire du compte")).toBeInTheDocument();
  });

  it("propose de régénérer le mot de passe d'un couturier existant, pas d'un propriétaire", async () => {
    render(<AdminUsers />);
    await screen.findByText("owner@test.local");
    const rows = screen.getAllByRole("row");
    const ownerRow = rows.find((r) => r.textContent.includes("owner@test.local"));
    const couturierRow = rows.find((r) => r.textContent.includes("couturier-a@test.local"));

    expect(within(ownerRow).queryByRole("button", { name: /Nouveau mot de passe/ })).not.toBeInTheDocument();
    expect(within(couturierRow).getByRole("button", { name: /Nouveau mot de passe/ })).toBeInTheDocument();
  });

  it("régénère le mot de passe d'un utilisateur existant, avec confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<AdminUsers />);
    await screen.findByText("couturier-a@test.local");
    await user.click(screen.getByRole("button", { name: /Nouveau mot de passe/ }));

    expect(window.confirm).toHaveBeenCalled();
    expect(fetchCalls[0].body).toEqual({ email: "couturier-a@test.local", displayName: "Atelier Dupont", role: "couturier" });
    expect(await screen.findByDisplayValue("Ab3dEfGh4jKm")).toBeInTheDocument();
  });

  it("n'appelle rien si la confirmation est annulée", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<AdminUsers />);
    await screen.findByText("couturier-a@test.local");
    await user.click(screen.getByRole("button", { name: /Nouveau mot de passe/ }));
    expect(fetchCalls).toHaveLength(0);
  });
});
