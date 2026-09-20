import { GOLD } from "../constants.js";
import { useTr } from "../context.jsx";
import { useSettings } from "../hooks/useSettings.js";
import { SvgWhatsapp } from "../icons.jsx";

// Raccourci discret vers le GROUPE WhatsApp communautaire — distinct du
// numéro de contact 1:1 utilisé partout ailleurs sur le site (booking,
// formules, chatbot). N'affiche rien tant que Gaspard n'a pas collé son lien
// d'invitation dans l'admin (Contenu du site → Réseaux sociaux) : jamais de
// lien factice ou de bouton qui ne mène nulle part.
const CommunityWhatsAppLink = () => {
  const t = useTr();
  const settings = useSettings();
  const url = settings.whatsappCommunityUrl?.trim();
  if (!url) return null;

  return (
    <div style={{ background: "#0a0602", padding: ".9rem 1.25rem", textAlign: "center" }}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "inline-flex", alignItems: "center", gap: "7px", color: "rgba(184,151,62,.75)", textDecoration: "none", fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", borderBottom: `1px solid ${GOLD}44`, paddingBottom: 2 }}>
        <SvgWhatsapp size={12} />
        {t("whatsapp_community_join")}
      </a>
    </div>
  );
};

export default CommunityWhatsAppLink;
