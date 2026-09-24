import { Component } from "react";
import { GOLD, CREAM } from "../constants.js";

// Aucun filet de sécurité n'existait sur le site public : une seule erreur
// de rendu (dans n'importe quelle section) faisait disparaître toute la
// page pour le visiteur, sans aucun message ni moyen de s'en sortir. Cette
// frontière protège juste le contenu (pas le menu, resté hors de ce
// périmètre dans App.jsx) et distingue un cas précis : un visiteur resté
// sur une page après une mise en ligne, dont un fichier chargé à la demande
// (une rubrique jamais encore ouverte) n'existe plus sous son ancienne
// adresse — on recharge une seule fois plutôt que d'afficher un message
// d'erreur pour ce qui n'est qu'une version périmée en mémoire.
const RELOAD_ONCE_KEY = "gnz_error_boundary_reloaded";
const isChunkLoadError = (error) => /dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(
  `${error?.name || ""} ${error?.message || ""}`,
);

const COPY = {
  FR: { title: "Un problème d'affichage est survenu.", body: "Rechargez la page pour continuer votre visite.", action: "Recharger la page" },
  EN: { title: "Something went wrong displaying this page.", body: "Reload the page to continue browsing.", action: "Reload the page" },
  ES: { title: "Ha ocurrido un problema al mostrar esta página.", body: "Recarga la página para continuar.", action: "Recargar la página" },
  ZH: { title: "页面显示出现问题。", body: "请重新加载页面以继续浏览。", action: "重新加载页面" },
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (!isChunkLoadError(error)) return;
    try {
      if (sessionStorage.getItem(RELOAD_ONCE_KEY)) return;
      sessionStorage.setItem(RELOAD_ONCE_KEY, "1");
      window.location.reload();
    } catch {}
  }

  render() {
    if (!this.state.error) return this.props.children;
    if (isChunkLoadError(this.state.error)) return null; // le rechargement est déjà en cours

    const copy = COPY[this.props.lang] || COPY.FR;
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.4rem", textAlign: "center", background: "#0a0602" }}>
        <div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.3rem, 5vw, 1.7rem)", color: CREAM, margin: "0 0 0.8rem" }}>{copy.title}</p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(245,240,232,0.65)", margin: "0 0 1.6rem" }}>{copy.body}</p>
          <button type="button" onClick={() => window.location.reload()}
            style={{ background: GOLD, color: "#0a0602", border: "none", padding: "0.9rem 1.8rem", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, borderRadius: "4px", cursor: "pointer" }}>
            {copy.action}
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
