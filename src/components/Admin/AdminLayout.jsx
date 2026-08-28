import { cloneElement, isValidElement, useState } from "react";
import { logout } from "../../services/adminAuth.js";
import AdminSEO from "./AdminSEO.jsx";
import AdminBookings from "./AdminBookings.jsx";
import AdminEmails from "./AdminEmails.jsx";
import AdminContent from "./AdminContent.jsx";
import AdminMedia from "./AdminMedia.jsx";
import AdminPromotions from "./AdminPromotions.jsx";
import "../../styles/admin-v2.css";

const NAV_GROUPS = [
  { label: "Pilotage", items: [
    { id: "dashboard", label: "Tableau de bord", icon: "◫" },
    { id: "analytics", label: "Analytics", icon: "⌁" },
    { id: "seo", label: "Acquisition & SEO", icon: "⌕" },
  ]},
  { label: "Commercial", items: [
    { id: "crm", label: "CRM", icon: "◎" },
    { id: "bookings", label: "Réservations", icon: "□" },
    { id: "emails", label: "Emails", icon: "✉" },
  ]},
  { label: "Site", items: [
    { id: "content", label: "Contenu du site", icon: "✎" },
    { id: "media", label: "Médias & photos", icon: "▧" },
    { id: "promotions", label: "Promotions", icon: "◇" },
    { id: "vip", label: "Clients VIP", icon: "☆" },
    { id: "wedding", label: "Wedding Inspiration", icon: "♢" },
  ]},
  { label: "Administration", items: [
    { id: "users", label: "Utilisateurs", icon: "♙" },
    { id: "settings", label: "Paramètres", icon: "⚙" },
  ]},
];
const allItems = NAV_GROUPS.flatMap((group) => group.items);
const standalone = new Set(["seo","bookings","emails","content","media","promotions"]);

const AdminLayout = ({ children, currentSection, onSectionChange, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathSection = typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean)[1] : null;
  const effectiveSection = allItems.some((item) => item.id === pathSection) ? pathSection : currentSection;
  const current = allItems.find((item) => item.id === effectiveSection) || allItems[0];

  const navigate = (section) => { onSectionChange(section); setMenuOpen(false); };
  const handleLogout = async () => { await logout(); window.location.assign("/admin"); };

  let rendered = children;
  if (effectiveSection === "seo") rendered = <AdminSEO />;
  else if (effectiveSection === "bookings") rendered = <AdminBookings />;
  else if (effectiveSection === "emails") rendered = <AdminEmails />;
  else if (effectiveSection === "content") rendered = <AdminContent />;
  else if (effectiveSection === "media") rendered = <AdminMedia />;
  else if (effectiveSection === "promotions") rendered = <AdminPromotions />;
  else if (effectiveSection === "dashboard" && isValidElement(children)) rendered = cloneElement(children, { onNavigate: navigate });
  else if (standalone.has(effectiveSection)) rendered = null;

  return (
    <div className={`gnz-admin-shell ${menuOpen ? "menu-open" : ""}`}>
      {menuOpen && <button aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:35, background:"rgba(0,0,0,.55)", border:0 }} />}
      <aside className="gnz-sidebar">
        <div className="gnz-sidebar-brand"><div className="gnz-sidebar-logo">GNZ</div><div><strong>GASPARDNZ</strong><span>ADMINISTRATION</span></div></div>
        <nav className="gnz-nav" aria-label="Administration">{NAV_GROUPS.map((group) => <div key={group.label}><div className="gnz-nav-group">{group.label}</div>{group.items.map((item) => <button key={item.id} type="button" className={`gnz-nav-button ${effectiveSection === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><span className="gnz-nav-icon" aria-hidden="true">{item.icon}</span><span>{item.label}</span></button>)}</div>)}</nav>
        <div className="gnz-sidebar-footer"><div className="gnz-user-chip"><strong>{user?.displayName || user?.email || "Administrateur"}</strong><span>{user?.role || user?.permission || "admin"}</span></div><button type="button" className="gnz-secondary-button" style={{ width:"100%" }} onClick={handleLogout}>Se déconnecter</button></div>
      </aside>
      <main className="gnz-admin-main">
        <header className="gnz-topbar"><button type="button" className="gnz-icon-button gnz-mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu">☰</button><div className="gnz-topbar-title"><strong>{current.label}</strong><span>GaspardNZ · données opérationnelles</span></div><div className="gnz-topbar-actions"><span className="gnz-live-pill"><span className="gnz-live-dot" />Synchronisation active</span></div></header>
        <div className="gnz-admin-content">{rendered || <div className="gnz-card"><div className="gnz-empty-state">Module en cours de chargement.</div></div>}</div>
      </main>
    </div>
  );
};
export default AdminLayout;
