import { Suspense, useEffect, useRef, useState } from "react";
import { hasPermission, logout } from "../../services/adminAuth.js";
import { subscribeTailoringOrders } from "../../services/adminData.js";
import { ALL_SECTIONS, NAV_GROUPS } from "./adminSections.js";
import "../../styles/admin-v2.css";

const DEFAULT_SECTION = "dashboard";
// Même seuil que la bascule mobile/bureau d'admin-v2.css (@media max-width: 840px).
const DESKTOP_QUERY = "(min-width: 841px)";

const AdminLayout = ({ currentSection, onSectionChange, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderNotice, setOrderNotice] = useState(null);
  const notifiedOrderIds = useRef(new Set());
  const role = user?.role || user?.permission || null;
  const allowed = (item) => hasPermission(item.min || "viewer", role) || (item.alsoFor || []).includes(role);
  const visibleGroups = NAV_GROUPS
    .map((group) => ({ ...group, items: group.items.filter(allowed) }))
    .filter((group) => group.items.length > 0);
  const visibleItems = visibleGroups.flatMap((group) => group.items);

  const pathSection = typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean)[1] : null;
  const requestedSection = ALL_SECTIONS.some((item) => item.id === pathSection) ? pathSection : currentSection;
  const requested = ALL_SECTIONS.find((item) => item.id === requestedSection);
  // « dashboard » est la page d'arrivée par défaut (connexion, /admin tout
  // court) : un rôle qui n'y a pas droit (le couturier) arrivait sur « section
  // pas accessible » au lieu de son propre écran. On l'envoie alors sur sa
  // première section autorisée ; toute AUTRE section interdite reste refusée.
  const landingFallback = requestedSection === DEFAULT_SECTION && requested && !allowed(requested) ? visibleItems[0] : null;
  // Une section atteinte par URL directe mais hors du rôle n'est pas rendue.
  const sectionRefused = Boolean(requested) && !allowed(requested) && !landingFallback;
  const current = landingFallback || requested || visibleItems[0] || ALL_SECTIONS[0];
  const ActiveComponent = !sectionRefused ? current?.component : null;

  const navigate = (section) => { onSectionChange(section); setMenuOpen(false); };
  const handleLogout = async () => { await logout(); window.location.assign("/admin"); };

  // Menu mobile ouvert : Échap le ferme, et repasser en largeur bureau
  // (tablette tournée, fenêtre agrandie) aussi — sinon le voile sombre
  // restait par-dessus tout l'écran et avalait le clic suivant.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => { if (event.key === "Escape") setMenuOpen(false); };
    const media = typeof window.matchMedia === "function" ? window.matchMedia(DESKTOP_QUERY) : null;
    const onMedia = (event) => { if (event.matches) setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    media?.addEventListener?.("change", onMedia);
    return () => {
      window.removeEventListener("keydown", onKey);
      media?.removeEventListener?.("change", onMedia);
    };
  }, [menuOpen]);

  // Prévient Gaspard (et le reste du personnel) dès qu'un couturier valide
  // une commande — les deux comptes sont côte à côte dans leurs bureaux
  // respectifs, une notification visible dans l'admin suffit, pas besoin
  // d'email ni de SMS. Le couturier lui-même n'a pas besoin d'être notifié
  // de sa propre validation.
  useEffect(() => {
    if (role === "couturier" || !hasPermission("editor", role)) return undefined;
    return subscribeTailoringOrders((payload) => {
      const order = payload?.new;
      if (!order || order.status !== "terminee" || notifiedOrderIds.current.has(order.id)) return;
      notifiedOrderIds.current.add(order.id);
      setOrderNotice(`Commande ${order.order_number} terminée par le couturier.`);
      setTimeout(() => setOrderNotice(null), 6000);
    });
  }, [role]);

  return (
    <div className={`gnz-admin-shell ${menuOpen ? "menu-open" : ""}`}>
      {menuOpen && <button aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:35, background:"rgba(0,0,0,.55)", border:0 }} />}
      <aside className="gnz-sidebar">
        <div className="gnz-sidebar-brand"><div className="gnz-sidebar-logo">GNZ</div><div><strong>GASPARDNZ</strong><span>ADMINISTRATION</span></div></div>
        <nav className="gnz-nav" aria-label="Administration">{visibleGroups.map((group) => <div key={group.label}><div className="gnz-nav-group">{group.label}</div>{group.items.map((item) => <button key={item.id} type="button" className={`gnz-nav-button ${current?.id === item.id && !sectionRefused ? "active" : ""}`} onClick={() => navigate(item.id)}><span className="gnz-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></button>)}</div>)}</nav>
        <div className="gnz-sidebar-footer"><div className="gnz-user-chip"><strong>{user?.displayName || user?.email || "Administrateur"}</strong><span>{user?.role || user?.permission || "admin"}</span></div><button type="button" className="gnz-secondary-button" style={{ width:"100%" }} onClick={handleLogout}>Se déconnecter</button></div>
      </aside>
      <main className="gnz-admin-main">
        {orderNotice && <button type="button" className="gnz-toast" style={{ position: "fixed", top: 14, right: 20, bottom: "auto", left: "auto", cursor: "pointer", border: "1px solid var(--gnz-border-strong)" }} onClick={() => { navigate("commandes"); setOrderNotice(null); }}>✂ {orderNotice}</button>}
        <header className="gnz-topbar"><button type="button" className="gnz-icon-button gnz-mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">☰</button><div className="gnz-topbar-title"><strong>{current?.label}</strong><span>GaspardNZ · données opérationnelles</span></div><div className="gnz-topbar-actions"><span className="gnz-live-pill"><span className="gnz-live-dot" />Synchronisation active</span></div></header>
        <div className="gnz-admin-content">
          {sectionRefused ? (
            <div className="gnz-card"><div className="gnz-empty-state">Cette section n'est pas accessible avec votre rôle{role ? ` (${role})` : ""}.</div></div>
          ) : ActiveComponent ? (
            <Suspense fallback={<div className="gnz-card"><div className="gnz-empty-state">Chargement…</div></div>}>
              <ActiveComponent user={user} onNavigate={navigate} />
            </Suspense>
          ) : (
            <div className="gnz-card"><div className="gnz-empty-state">Module en cours de chargement.</div></div>
          )}
        </div>
      </main>
    </div>
  );
};
export default AdminLayout;
