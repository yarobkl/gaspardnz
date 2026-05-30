import { useState } from "react";
import { logout } from "../../services/adminAuth.js";

const AdminLayout = ({ children, currentSection, onSectionChange, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sections = [
    { id: "dashboard", label: "Tableau de Bord", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "crm", label: "CRM", icon: "👥" },
    { id: "users", label: "Utilisateurs", icon: "🔐" },
    { id: "settings", label: "Paramètres", icon: "⚙️" },
  ];

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0a0602",
        color: "#faf7f2",
      }}>
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "280px" : "80px",
          background: "#1c1208",
          borderRight: "1px solid rgba(184,151,62,0.2)",
          transition: "width 0.3s ease",
          padding: "1.4rem 0",
          overflow: "hidden",
        }}>
        <div style={{ padding: "0 1rem", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: sidebarOpen ? "1.4rem" : "0.8rem",
              fontFamily: "'Bebas Neue', sans-serif",
              color: "#b8973e",
              margin: 0,
              letterSpacing: "0.1em",
            }}>
            {sidebarOpen ? "GASPARDNZ" : "GA"}
          </h1>
          {sidebarOpen && (
            <p
              style={{
                fontSize: "10px",
                color: "rgba(184,151,62,0.6)",
                margin: "0.3rem 0 0 0",
                letterSpacing: "0.08em",
              }}>
              ADMIN
            </p>
          )}
        </div>

        <nav>
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              style={{
                width: "100%",
                padding: "1rem",
                border: "none",
                background: currentSection === section.id ? "rgba(184,151,62,0.15)" : "transparent",
                borderLeft: currentSection === section.id ? "3px solid #b8973e" : "3px solid transparent",
                color: currentSection === section.id ? "#b8973e" : "rgba(250,247,242,0.6)",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                textAlign: "left",
              }}>
              <span>{section.icon}</span>
              {sidebarOpen && <span>{section.label}</span>}
            </button>
          ))}
        </nav>

        <div
          style={{
            position: "absolute",
            bottom: "1.4rem",
            width: sidebarOpen ? "248px" : "48px",
            padding: "0 1rem",
            transition: "width 0.3s ease",
          }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: "100%",
              padding: "0.8rem",
              border: "1px solid rgba(184,151,62,0.2)",
              background: "transparent",
              color: "rgba(184,151,62,0.6)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "11px",
              marginBottom: "0.8rem",
            }}>
            {sidebarOpen ? "Réduire" : ">>"}
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.8rem",
              border: "1px solid rgba(184,151,62,0.2)",
              background: "rgba(184,151,62,0.1)",
              color: "#b8973e",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "11px",
            }}>
            {sidebarOpen ? "Déconnexion" : "⎋"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Header */}
        <div
          style={{
            padding: "1.4rem 2rem",
            borderBottom: "1px solid rgba(184,151,62,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0,0,0,0.3)",
          }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.08em" }}>
            {sections.find((s) => s.id === currentSection)?.label}
          </h2>
          <div style={{ fontSize: "12px", color: "rgba(250,247,242,0.6)" }}>
            Connecté: <strong style={{ color: "#faf7f2" }}>{user?.email}</strong>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "2rem" }}>{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
