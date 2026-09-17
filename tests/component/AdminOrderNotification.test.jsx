import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";

// Capture le callback enregistré par subscribeTailoringOrders (postgres_changes
// UPDATE), pour simuler nous-mêmes une validation de commande par le couturier
// — sans dépendre d'un vrai canal Supabase Realtime.
let capturedCallback = null;
const emptyQuery = {
  select: () => emptyQuery, eq: () => emptyQuery, order: () => emptyQuery,
  then: (resolve) => resolve({ data: [], error: null }),
};
vi.mock("../../src/services/supabaseClient.js", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    from: () => emptyQuery,
    // Le nom du canal inclut un suffixe aléatoire depuis la correction du
    // blocage à l'ouverture de l'écran (deux abonnements simultanés sur un
    // même topic figé) : on reconnaît le canal par préfixe, pas par égalité.
    channel: (name) => ({
      on(_event, _filter, callback) {
        if (name.startsWith("gnz-tailoring-orders")) capturedCallback = callback;
        return this;
      },
      subscribe() { return this; },
    }),
    removeChannel: () => {},
  },
  sendPublicEvent: async () => ({ ok: true }),
  publicEventEndpoint: "http://localhost/functions/v1/public-event",
  SUPABASE_URL: "http://localhost",
  SUPABASE_PUBLISHABLE_KEY: "test",
}));

const AdminLayout = (await import("../../src/components/Admin/AdminLayout.jsx")).default;
const Section = ({ children }) => <section>{children}</section>;

const fireOrderUpdate = (order) => act(() => { capturedCallback?.({ eventType: "UPDATE", new: order, old: {} }); });

// AdminLayout ne pilote pas sa propre section : c'est le parent (App.jsx en
// vrai) qui reçoit onSectionChange et fait suivre currentSection. Un no-op ici
// rendrait le clic sur la notification impossible à observer.
function Harness({ user }) {
  const [section, setSection] = useState("dashboard");
  return <AdminLayout currentSection={section} onSectionChange={setSection} user={user}><Section>contenu</Section></AdminLayout>;
}

describe("Notification de commande terminée", () => {
  it("prévient le personnel quand un couturier valide une commande", async () => {
    const user = userEvent.setup();
    render(<Harness user={{ email: "gaspard@test.local", role: "owner" }} />);

    expect(screen.queryByText(/terminée par le couturier/)).not.toBeInTheDocument();

    fireOrderUpdate({ id: "o1", order_number: "CMD-2026-0007", status: "terminee" });
    expect(await screen.findByText(/CMD-2026-0007 terminée par le couturier/)).toBeInTheDocument();

    // Cliquer la notification doit amener directement sur les commandes.
    await user.click(screen.getByText(/CMD-2026-0007 terminée par le couturier/));
    expect(screen.getByRole("heading", { name: /commandes sur-mesure/i, level: 1 })).toBeInTheDocument();
  });

  it("ne re-notifie pas la même commande une fois la première alerte disparue", () => {
    // fireOrderUpdate() est déjà synchrone (act() attend le re-rendu) : pas
    // besoin de findBy/waitFor asynchrones, qui se bloquent indéfiniment en
    // temps réel dès que les timers sont truqués (leur polling interne
    // dépend lui aussi de setTimeout).
    vi.useFakeTimers();
    try {
      render(<Harness user={{ email: "gaspard@test.local", role: "owner" }} />);
      fireOrderUpdate({ id: "o2", order_number: "CMD-2026-0008", status: "terminee" });
      expect(screen.getByText(/CMD-2026-0008/)).toBeInTheDocument();

      // L'alerte se referme toute seule après 6 s (voir AdminLayout).
      act(() => { vi.advanceTimersByTime(6100); });
      expect(screen.queryByText(/CMD-2026-0008/)).not.toBeInTheDocument();

      // Un nouvel évènement pour la MÊME commande ne doit pas la faire
      // réapparaître : déjà notifiée une fois, c'est fait.
      fireOrderUpdate({ id: "o2", order_number: "CMD-2026-0008", status: "terminee" });
      expect(screen.queryByText(/CMD-2026-0008/)).not.toBeInTheDocument();

      // Une commande DIFFÉRENTE, elle, doit bien déclencher une alerte.
      fireOrderUpdate({ id: "o2-bis", order_number: "CMD-2026-0010", status: "terminee" });
      expect(screen.getByText(/CMD-2026-0010/)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("ne notifie pas une commande qui passe seulement à « en_cours »", async () => {
    render(<Harness user={{ email: "gaspard@test.local", role: "owner" }} />);
    fireOrderUpdate({ id: "o3", order_number: "CMD-2026-0009", status: "en_cours" });
    expect(screen.queryByText(/CMD-2026-0009/)).not.toBeInTheDocument();
  });

  it("le couturier lui-même n'est pas abonné à cette notification", async () => {
    capturedCallback = null;
    // "dashboard" n'est pas dans les sections d'un couturier : refusée, donc
    // AdminTailoringOrders ne monte pas et ne prend pas SON PROPRE abonnement
    // de rafraîchissement (même nom de canal). Seul l'effet de notification
    // d'AdminLayout est en jeu ici.
    render(<Harness user={{ email: "couturier-a@test.local", role: "couturier" }} />);
    expect(capturedCallback).toBeNull();
  });

  it("un lecteur seul (viewer) n'est pas abonné non plus — réservé à editor et plus", async () => {
    capturedCallback = null;
    render(<Harness user={{ email: "viewer@test.local", role: "viewer" }} />);
    expect(capturedCallback).toBeNull();
  });
});
