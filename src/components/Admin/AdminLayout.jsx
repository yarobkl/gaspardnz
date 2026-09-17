import { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import { hasPermission, logout } from "../../services/adminAuth.js";
import { subscribeTailoringOrders } from "../../services/adminData.js";
import AdminSEO from "./AdminSEO.jsx";
import AdminBookings from "./AdminBookings.jsx";
import AdminEmails from "./AdminEmails.jsx";
import AdminContent from "./AdminContent.jsx";
import AdminMedia from "./AdminMedia.jsx";
import AdminPromotions from "./AdminPromotions.jsx";
import AdminStyleMonth from "./AdminStyleMonth.jsx";
import AdminAlbums from "./AdminAlbums.jsx";
import AdminTexts from "./AdminTexts.jsx";
import AdminTailoringOrders from "./AdminTailoringOrders.jsx";
import "../../styles/admin-v2.css";

// `min` = rôle minimal requis. Ce filtrage est une défense en profondeur, PAS
// la sécurité : l'autorité reste les politiques RLS côté Supabase
// (supabase/migrations/20260910120100_rbac_restrictive_policies.sql). Masquer un
// écran n'empêche personne d'appeler l'API — c'est la base qui refuse.
const NAV_GROUPS = [
  { label: "Pilotage", items: [
    { id: "dashboard", label: "Tableau de bord", icon: "◫", min: "viewer" },
    { id: "analytics", label: "Analytics", icon: "⌁", min: "viewer" },
    { id: "seo", label: "Acquisition & SEO", icon: "⌕", min: "editor" },
  ]},
  { label: "Commercial", items: [
    { id: "crm", label: "CRM", icon: "◎", min: "viewer" },
    { id: "bookings", label: "Réservations", icon: "□", min: "viewer" },
    { id: "emails", label: "Emails", icon: "✉", min: "viewer" },
  ]},
  { label: "Site", items: [
    { id: "content", label: "Contenu du site", icon: "✎", min: "editor" },
    { id: "texts", label: "Textes du site", icon: "Aa", min: "editor" },
    { id: "media", label: "Médias & photos", icon: "▧", min: "editor" },
    { id: "albums", label: "Galerie & Showroom", icon: "▦", min: "editor" },
    { id: "promotions", label: "Promotions", icon: "◇", min: "editor" },
    { id: "style", label: "Style du mois", icon: "◈", min: "editor" },
    { id: "vip", label: "Clients VIP", icon: "☆", min: "editor" },
    { id: "wedding", label: "Wedding Inspiration", icon: "♢", min: "editor" },
  ]},
  // Le couturier est un rôle À PART (rang 0, comme un rôle inconnu) : il ne
  // satisfait jamais un `min` normal. `alsoFor` lui ouvre CETTE seule entrée,
  // sans toucher au reste de la hiérarchie owner > admin > editor > viewer.
  { label: "Atelier", items: [
    { id: "commandes", label: "Commandes sur-mesure", icon: "✂", min: "editor", alsoFor: ["couturier"] },
  ]},
  { label: "Administration", items: [
    { id: "users", label: "Utilisateurs", icon: "♙", min: "owner" },
    { id: "settings", label: "Paramètres", icon: "⚙", min: "admin" },
  ]},
];
const allItems = NAV_GROUPS.flatMap((group) => group.items);
const standalone = new Set(["seo","bookings","emails","content","texts","media","albums","promotions","style","commandes"]);

const AdminLayout = ({ children, currentSection, onSectionChange, user }) => {
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
  const requestedSection = allItems.some((item) => item.id === pathSection) ? pathSection : currentSection;
  const requested = allItems.find((item) => item.id === requestedSection);
  // Une section atteinte par URL directe mais hors du rôle n'est pas rendue.
  const sectionRefused = Boolean(requested) && !allowed(requested);
  const effectiveSection = sectionRefused ? null : requestedSection;
  const current = requested || visibleItems[0] || allItems[0];

  const navigate = (section) => { onSectionChange(section); setMenuOpen(false); };
  const handleLogout = async () => { await logout(); window.location.assign("/admin"); };

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

  let rendered = sectionRefused ? null : children;
  if (effectiveSection === "seo") rendered = <AdminSEO />;
  else if (effectiveSection === "bookings") rendered = <AdminBookings />;
  else if (effectiveSection === "emails") rendered = <AdminEmails />;
  else if (effectiveSection === "content") rendered = <AdminContent />;
  else if (effectiveSection === "texts") rendered = <AdminTexts />;
  else if (effectiveSection === "media") rendered = <AdminMedia />;
  else if (effectiveSection === "albums") rendered = <AdminAlbums />;
  else if (effectiveSection === "promotions") rendered = <AdminPromotions />;
  else if (effectiveSection === "style") rendered = <AdminStyleMonth />;
  else if (effectiveSection === "commandes") rendered = <AdminTailoringOrders user={user} />;
  else if (effectiveSection === "dashboard" && isValidElement(children)) rendered = cloneElement(children, { onNavigate: navigate });
  else if (standalone.has(effectiveSection)) rendered = null;

  return (
    <div className={`gnz-admin-shell ${menuOpen ? "menu-open" : ""}`}>
      {menuOpen && <button aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:35, background:"rgba(0,0,0,.55)", border:0 }} />}
      <aside className="gnz-sidebar">
        <div className="gnz-sidebar-brand"><div className="gnz-sidebar-logo">GNZ</div><div><strong>GASPARDNZ</strong><span>ADMINISTRATION</span></div></div>
        <nav className="gnz-nav" aria-label="Administration">{visibleGroups.map((group) => <div key={group.label}><div className="gnz-nav-group">{group.label}</div>{group.items.map((item) => <button key={item.id} type="button" className={`gnz-nav-button ${effectiveSection === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><span className="gnz-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></button>)}</div>)}</nav>
        <div className="gnz-sidebar-footer"><div className="gnz-user-chip"><strong>{user?.displayName || user?.email || "Administrateur"}</strong><span>{user?.role || user?.permission || "admin"}</span></div><button type="button" className="gnz-secondary-button" style={{ width:"100%" }} onClick={handleLogout}>Se déconnecter</button></div>
      </aside>
      <main className="gnz-admin-main">
        {orderNotice && <button type="button" className="gnz-toast" style={{ position: "fixed", top: 14, right: 20, bottom: "auto", left: "auto", cursor: "pointer", border: "1px solid var(--gnz-border-strong)" }} onClick={() => { navigate("commandes"); setOrderNotice(null); }}>✂ {orderNotice}</button>}
        <header className="gnz-topbar"><button type="button" className="gnz-icon-button gnz-mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">☰</button><div className="gnz-topbar-title"><strong>{current.label}</strong><span>GaspardNZ · données opérationnelles</span></div><div className="gnz-topbar-actions"><span className="gnz-live-pill"><span className="gnz-live-dot" />Synchronisation active</span></div></header>
        <div className="gnz-admin-content">{sectionRefused ? <div className="gnz-card"><div className="gnz-empty-state">Cette section n'est pas accessible avec votre rôle{role ? ` (${role})` : ""}.</div></div> : rendered || <div className="gnz-card"><div className="gnz-empty-state">Module en cours de chargement.</div></div>}</div>
      </main>
    </div>
  );
};
export default AdminLayout;
