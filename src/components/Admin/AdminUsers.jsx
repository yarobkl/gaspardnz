import { useState } from "react";
import { getAllUsers, createUser, deleteUser, getSession } from "../../services/adminAuth.js";
import { useTr } from "../../context.jsx";
import "../../styles/admin.css";

const AdminUsers = () => {
  const t = useTr();
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

    const trimmedEmail = formData.email?.trim();
    const trimmedPassword = formData.password?.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError(t("admin_error_email_password_required"));
      return;
    }

    if (trimmedPassword.length < 6) {
      setError(t("admin_error_password_length"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError(t("admin_error_invalid_email"));
      return;
    }

    const result = createUser(trimmedEmail, trimmedPassword, formData.permission);
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
      setError(t("admin_error_delete_self"));
      return;
    }

    if (window.confirm(t("admin_confirm_delete_user"))) {
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
    admin_full: t("admin_full_label"),
    admin_read: t("admin_read_label"),
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <button onClick={() => setShowForm(!showForm)} className="admin-btn">
          {t("admin_new_admin")}
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {showForm && (
        <form onSubmit={handleAddUser} className="admin-card" style={{ marginBottom: "2rem", maxWidth: "500px" }}>
          <div className="admin-form-group">
            <label className="admin-label">{t("admin_email")}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">{t("admin_password")}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">{t("admin_permission")}</label>
            <select value={formData.permission} onChange={(e) => setFormData({ ...formData, permission: e.target.value })} className="admin-select">
              <option value="admin_read">{t("admin_read_label")}</option>
              <option value="admin_full">{t("admin_full_label")}</option>
            </select>
          </div>

          <button type="submit" className="admin-btn">
            {t("admin_create_admin")}
          </button>
        </form>
      )}

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin_email")}</th>
                <th>{t("admin_permission")}</th>
                <th>{t("admin_created")}</th>
                <th>{t("admin_last_visit")}</th>
                <th style={{ textAlign: "center" }}>{t("admin_action")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td data-label={t("admin_email")}>
                    {user.email}
                    {session?.userId === user.id && <span style={{ color: "var(--gnz-gold)", marginLeft: "0.5rem" }}>{t("admin_you")}</span>}
                  </td>
                  <td data-label={t("admin_permission")}>{permissionLabels[user.permission]}</td>
                  <td data-label={t("admin_created")} style={{ color: "var(--gnz-text-secondary)" }}>
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td data-label={t("admin_last_visit")} style={{ color: "var(--gnz-text-secondary)" }}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("fr-FR") : "-"}
                  </td>
                  <td data-label={t("admin_action")} style={{ textAlign: "center" }}>
                    {session?.userId !== user.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="admin-btn-danger"
                        style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}>
                        {t("admin_delete")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--gnz-text-secondary)" }}>
            {t("admin_no_admin")}
          </div>
        )}
      </div>

      <div style={{ marginTop: "2rem", fontSize: "0.875rem", color: "var(--gnz-text-secondary)" }}>
        <p>{t("admin_full_desc")}</p>
        <p>{t("admin_read_desc")}</p>
      </div>
    </div>
  );
};

export default AdminUsers;
