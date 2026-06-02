import { useState } from "react";
import { login } from "../../services/adminAuth.js";
import "../../styles/admin.css";

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("admin@gaspardnz.style");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = login(email, password);
    setLoading(false);

    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      setError(result.error);
      setPassword("");
    }
  };

  return (
    <div className="admin-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} className="admin-card" style={{ width: "100%", maxWidth: "400px" }}>
        <h1 className="admin-h1" style={{ marginBottom: "0.5rem" }}>
          GASPARDNZ
        </h1>
        <p className="admin-label" style={{ marginBottom: "2rem" }}>
          Espace Admin
        </p>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <div className="admin-form-group">
          <label className="admin-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="admin-input"
          />
        </div>

        <button type="submit" disabled={loading} className="admin-btn" style={{ width: "100%" }}>
          {loading ? "Connexion..." : "Se Connecter"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
