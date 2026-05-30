import { useState } from "react";
import { login } from "../../services/adminAuth.js";

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("admin@gaspardnz.style");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0602",
        padding: "1.4rem",
      }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "2rem",
          background: "#1c1208",
          border: "1px solid rgba(184,151,62,0.2)",
          borderRadius: "8px",
        }}>
        <h1
          style={{
            fontSize: "1.8rem",
            color: "#faf7f2",
            marginBottom: "0.5rem",
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: "0.1em",
          }}>
          GASPARDNZ
        </h1>
        <p
          style={{
            fontSize: "11px",
            color: "#b8973e",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "2rem",
          }}>
          Espace Admin
        </p>

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

        <div style={{ marginBottom: "1.2rem" }}>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(184,151,62,0.2)",
              borderRadius: "4px",
              color: "#faf7f2",
              fontSize: "14px",
              fontFamily: "inherit",
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
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.8rem",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(184,151,62,0.2)",
              borderRadius: "4px",
              color: "#faf7f2",
              fontSize: "14px",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.8rem",
            background: "#b8973e",
            border: "none",
            borderRadius: "4px",
            color: "#0a0602",
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}>
          {loading ? "Connexion..." : "Se Connecter"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
