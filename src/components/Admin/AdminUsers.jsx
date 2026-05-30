import { useState } from "react";
import { getAllUsers, createUser, deleteUser, getSession } from "../../services/adminAuth.js";
import "../../styles/admin.css";

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
        <button onClick={() => setShowForm(!showForm)} className="admin-btn">
          + Nouvel Administrateur
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {showForm && (
        <form onSubmit={handleAddUser} className="admin-card" style={{ marginBottom: "2rem", maxWidth: "500px" }}>
          <div className="admin-form-group">
            <label className="admin-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Permission</label>
            <select value={formData.permission} onChange={(e) => setFormData({ ...formData, permission: e.target.value })} className="admin-select">
              <option value="admin_read">Admin (Lecture seule)</option>
              <option value="admin_full">Admin Complet</option>
            </select>
          </div>

          <button type="submit" className="admin-btn">
            Créer Administrateur
          </button>
        </form>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Permission</th>
              <th>Créé</th>
              <th>Dernière visite</th>
              <th style={{ textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.email}
                  {session?.userId === user.id && <span style={{ color: "var(--gnz-gold)", marginLeft: "0.5rem" }}>(Vous)</span>}
                </td>
                <td>{permissionLabels[user.permission]}</td>
                <td style={{ color: "var(--gnz-text-secondary)" }}>
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td style={{ color: "var(--gnz-text-secondary)" }}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("fr-FR") : "-"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {session?.userId !== user.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="admin-btn-danger"
                      style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}>
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
            Aucun administrateur
          </div>
        )}
      </div>

      <div style={{ marginTop: "2rem", fontSize: "0.875rem", color: "var(--gnz-text-secondary)" }}>
        <p>Admin Complet : Accès total à l'administration et modification des contenus</p>
        <p>Admin Lecture seule : Consultation uniquement, pas de modification</p>
      </div>
    </div>
  );
};

export default AdminUsers;
