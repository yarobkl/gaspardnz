import { useState } from "react";
import { getAllUsers, createUser, deleteUser, getSession } from "../../services/adminAuth.js";

const AdminUsers = () => {
  const [users, setUsers] = useState(getAllUsers());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", permission: "admin_read" });
  const [error, setError] = useState("");
  const session = getSession();

  const loadUsers = () => {
    setUsers(getAllUsers());
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email et mot de passe requis");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères");
      return;
    }

    const result = createUser(formData.email, formData.password, formData.permission);
    if (result.success) {
      setFormData({ email: "", password: "", permission: "admin_read" });
      setShowForm(false);
      loadUsers();
    } else {
      setError(result.error);
    }
  };

  const handleDeleteUser = (userId) => {
    if (session?.userId === userId) {
      setError("Vous ne pouvez pas supprimer votre propre compte");
      return;
    }

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      const result = deleteUser(userId);
      if (result.success) {
        loadUsers();
        setError("");
      } else {
        setError(result.error);
      }
    }
  };

  const permissionLabels = {
    admin_full: "Admin Complet",
    admin_read: "Admin (Lecture seule)",
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "0.8rem 1.4rem",
            background: "#b8973e",
            border: "none",
            borderRadius: "4px",
            color: "#0a0602",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            cursor: "pointer",
          }}>
          + Nouvel Administrateur
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "0.8rem",
            background: "rgba(200,50,50,0.1)",
            border: "1px solid rgba(200,50,50,0.3)",
            borderRadius: "4px",
            color: "#ff6b6b",
            fontSize: "12px",
            marginBottom: "1rem",
          }}>
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAddUser}
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(184,151,62,0.2)",
            borderRadius: "8px",
            padding: "1.6rem",
            marginBottom: "2rem",
            maxWidth: "500px",
          }}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "#b8973e",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.5rem",
              }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "#b8973e",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.5rem",
              }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.6rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "#b8973e",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.5rem",
              }}>
              Permission
            </label>
            <select
              value={formData.permission}
              onChange={(e) => setFormData({ ...formData, permission: e.target.value })}
              style={{
                width: "100%",
                padding: "0.8rem",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(184,151,62,0.2)",
                borderRadius: "4px",
                color: "#faf7f2",
                fontSize: "14px",
                boxSizing: "border-box",
              }}>
              <option value="admin_read">Admin (Lecture seule)</option>
              <option value="admin_full">Admin Complet</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: "0.8rem 1.4rem",
              background: "#b8973e",
              border: "none",
              borderRadius: "4px",
              color: "#0a0602",
              fontSize: "12px",
              fontWeight: "600",
              textTransform: "uppercase",
              cursor: "pointer",
            }}>
            Créer Administrateur
          </button>
        </form>
      )}

      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(184,151,62,0.2)",
          borderRadius: "8px",
          overflow: "hidden",
        }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(184,151,62,0.1)", background: "rgba(0,0,0,0.5)" }}>
              <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>Email</th>
              <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>Permission</th>
              <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>Créé</th>
              <th style={{ padding: "1rem", textAlign: "left", fontSize: "12px", color: "#b8973e" }}>Dernière visite</th>
              <th style={{ padding: "1rem", textAlign: "center", fontSize: "12px", color: "#b8973e" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid rgba(184,151,62,0.1)" }}>
                <td style={{ padding: "1rem", fontSize: "13px" }}>
                  {user.email}
                  {session?.userId === user.id && <span style={{ color: "#b8973e", marginLeft: "0.5rem" }}>(Vous)</span>}
                </td>
                <td style={{ padding: "1rem", fontSize: "13px" }}>{permissionLabels[user.permission]}</td>
                <td style={{ padding: "1rem", fontSize: "12px", color: "rgba(250,247,242,0.6)" }}>
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td style={{ padding: "1rem", fontSize: "12px", color: "rgba(250,247,242,0.6)" }}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("fr-FR") : "-"}
                </td>
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  {session?.userId !== user.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        background: "rgba(200,50,50,0.1)",
                        border: "1px solid rgba(200,50,50,0.3)",
                        borderRadius: "3px",
                        color: "#ff6b6b",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}>
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "rgba(250,247,242,0.4)" }}>
            Aucun administrateur
          </div>
        )}
      </div>

      <div style={{ marginTop: "2rem", fontSize: "12px", color: "rgba(250,247,242,0.5)" }}>
        <p>Admin Complet : Accès total à l'administration et modification des contenus</p>
        <p>Admin Lecture seule : Consultation uniquement, pas de modification</p>
      </div>
    </div>
  );
};

export default AdminUsers;
