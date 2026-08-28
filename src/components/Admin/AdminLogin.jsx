import { useState } from "react";
import { login, registerAdmin } from "../../services/adminAuth.js";
import "../../styles/admin-v2.css";

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("gaspardnz.contact@gmail.com");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const result = mode === "login"
      ? await login(email, password)
      : await registerAdmin(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Impossible de continuer.");
      return;
    }
    if (result.user) {
      onLoginSuccess(result.user);
      return;
    }
    setMessage(result.message || "Vérifiez votre boîte mail pour confirmer votre accès.");
    setPassword("");
  };

  return (
    <main className="gnz-login-shell">
      <section className="gnz-login-card" aria-labelledby="admin-login-title">
        <div className="gnz-brand-mark">GNZ</div>
        <p className="gnz-eyebrow">GASPARDNZ · ADMINISTRATION</p>
        <h1 id="admin-login-title">Pilotez votre activité.</h1>
        <p className="gnz-muted">
          Accès sécurisé au CRM, aux réservations, contenus, médias, promotions et données de performance.
        </p>

        {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
        {message && <div className="gnz-alert gnz-alert-success">{message}</div>}

        <form onSubmit={handleSubmit} className="gnz-form-stack">
          <label>
            <span>Adresse email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <span>{mode === "login" ? "Mot de passe" : "Créer mon mot de passe"}</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={mode === "login" ? 1 : 10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="gnz-primary-button" disabled={loading}>
            {loading ? "Vérification…" : mode === "login" ? "Se connecter" : "Activer mon accès"}
          </button>
        </form>

        <button
          type="button"
          className="gnz-text-button"
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setMessage(""); }}
        >
          {mode === "login" ? "Première connexion ? Créer mon mot de passe" : "J'ai déjà un mot de passe"}
        </button>
        <p className="gnz-login-note">Seules les adresses préautorisées peuvent accéder à cet espace.</p>
      </section>
    </main>
  );
};

export default AdminLogin;
