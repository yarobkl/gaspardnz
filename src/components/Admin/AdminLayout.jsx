import { useState } from "react";
import { logout } from "../../services/adminAuth.js";
import "../../styles/admin.css";

const AdminLayout = ({ children, currentSection, onSectionChange, user }) => {
  const sections = [
    { id: "dashboard", label: "Tableau de Bord" },
    { id: "analytics", label: "Analytics" },
    { id: "crm", label: "CRM" },
    { id: "users", label: "Utilisateurs" },
    { id: "wedding", label: "Inspirations Mariage" },
    { id: "settings", label: "Paramètres" },
  ];

  const handleLogout = () => {
    logout();
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
          Déconnexion
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
            <span>Connecté:</span>
            <strong>{user?.email}</strong>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
