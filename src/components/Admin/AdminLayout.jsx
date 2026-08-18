import { useState } from "react";
import { logout } from "../../services/adminAuth.js";
import { useTr } from "../../context.jsx";
import "../../styles/admin.css";

const AdminLayout = ({ children, currentSection, onSectionChange, user }) => {
  const t = useTr();
  const sections = [
    { id: "dashboard", label: t("admin_dashboard") },
    { id: "analytics", label: t("admin_analytics") },
    { id: "crm", label: t("admin_crm") },
    { id: "vip", label: t("admin_vip") },
    { id: "wedding", label: t("admin_wedding") },
    { id: "settings", label: t("admin_settings") },
  ];

  const handleLogout = async () => {
    const loggedOut = await logout();
    if (!loggedOut) {
      window.alert("La déconnexion n’a pas abouti. Veuillez réessayer.");
      return;
    }
    window.location.href = "/";
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1 className="admin-h2" style={{ margin: 0, flex: 1 }}>GASPARDNZ</h1>
        </div>

        <nav className="admin-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`admin-nav-item ${currentSection === section.id ? "active" : ""}`}>
              {section.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="admin-btn-secondary" style={{ marginTop: "auto", width: "100%" }}>
          {t("admin_logout")}
        </button>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <div className="admin-header-title">
            <h2 className="admin-h2" style={{ margin: 0 }}>
              {sections.find((s) => s.id === currentSection)?.label}
            </h2>
          </div>
          <div className="admin-user-info">
            <span>{t("admin_connected")}</span>
            <strong>{user?.email}</strong>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
