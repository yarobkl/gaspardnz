import { useEffect, useState } from "react";
import { login, registerAdmin } from "../../services/adminAuth.js";
import {
  isPasswordRecoveryLink,
  saveNewAdminPassword,
  sendAdminPasswordReset,
} from "../../services/adminPasswordRecovery.js";
import "../../styles/admin-v2.css";

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPasswordRecoveryLink()) setMode("recovery");
  }, []);

  const clearFeedback = () => {
    setError("");
    setMessage("");
  };

  const changeMode = (nextMode) => {
    clearFeedback();
    setPassword("");
    setConfirmPassword("");
    setMode(nextMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();
    setLoading(true);

    if (mode === "forgot") {
      const result = await sendAdminPasswordReset(email);
      setLoading(false);
      if (!result.success) {
        setError(result.error || "Impossible d'envoyer l'email de réinitialisation.");
        return;
      }
      setMessage(result.message || "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.");
      return;
    }

    if (mode === "recovery") {
      if (password !== confirmPassword) {
        setLoading(false);
        setError("Les deux mots de passe ne correspondent pas.");
        return;
      }
      const result = await saveNewAdminPassword(password);
      setLoading(false);
      if (!result.success) {
        setError(result.error || "Impossible de modifier le mot de passe.");
        return;
      }
      window.history.replaceState({}, "", "/admin");
      setPassword("");
      setConfirmPassword("");
      setMessage("Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.");
      setMode("login");
      return;
    }

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

  const title = mode === "forgot"
    ? "Réinitialisez votre accès."
    : mode === "recovery"
      ? "Choisissez un nouveau mot de passe."
      : "Pilotez votre activité.";

  const intro = mode === "forgot"
    ? "Saisissez votre adresse Owner ou administrateur. Vous recevrez un lien sécurisé par email."
    : mode === "recovery"
      ? "Créez un nouveau mot de passe d'au moins 10 caractères pour votre compte GaspardNZ."
      : "Accès sécurisé au CRM, aux réservations, contenus, médias, promotions et données de performance.";

  return (
    <main className="gnz-login-shell">
      <section className="gnz-login-card" aria-labelledby="admin-login-title">
        <div className="gnz-brand-mark">GNZ</div>
        <p className="gnz-eyebrow">GASPARDNZ · ADMINISTRATION</p>
        <h1 id="admin-login-title">{title}</h1>
        <p className="gnz-muted">{intro}</p>

        {error && <div className="gnz-alert gnz-alert-error">{error}</div>}
        {message && <div className="gnz-alert gnz-alert-success">{message}</div>}

        <form onSubmit={handleSubmit} className="gnz-form-stack">
          {mode !== "recovery" && (
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
          )}

          {(mode === "login" || mode === "register" || mode === "recovery") && (
            <label>
              <span>
                {mode === "login"
                  ? "Mot de passe"
                  : mode === "recovery"
                    ? "Nouveau mot de passe"
                    : "Créer mon mot de passe"}
              </span>
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "login" ? 1 : 10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          )}

          {mode === "recovery" && (
            <label>
              <span>Confirmer le nouveau mot de passe</span>
              <input
                type="password"
                autoComplete="new-password"
                minLength={10}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
          )}

          <button type="submit" className="gnz-primary-button" disabled={loading}>
            {loading
              ? "Vérification…"
              : mode === "login"
                ? "Se connecter"
                : mode === "register"
                  ? "Activer mon accès"
                  : mode === "forgot"
                    ? "Envoyer le lien de réinitialisation"
                    : "Enregistrer le nouveau mot de passe"}
          </button>
        </form>

        {mode === "login" && (
          <>
            <button type="button" className="gnz-text-button" onClick={() => changeMode("forgot")}>
              Mot de passe oublié ?
            </button>
            <button type="button" className="gnz-text-button" onClick={() => changeMode("register")}>
              Première connexion ? Créer mon mot de passe
            </button>
          </>
        )}

        {(mode === "forgot" || mode === "register") && (
          <button type="button" className="gnz-text-button" onClick={() => changeMode("login")}>
            Retour à la connexion
          </button>
        )}

        <p className="gnz-login-note">Seules les adresses préautorisées peuvent accéder à cet espace.</p>
      </section>
    </main>
  );
};

export default AdminLogin;
