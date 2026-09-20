import { useTr } from "../context.jsx";
import { useSettings } from "../hooks/useSettings.js";
import { SvgWhatsapp } from "../icons.jsx";
import { WA_CHANNEL_URL } from "../data/styleDuMoisData.js";

const WA_GREEN = "#25D366";

// Raccourci vers le GROUPE WhatsApp communautaire — distinct du numéro de
// contact 1:1 utilisé partout ailleurs sur le site (booking, formules,
// chatbot). Reprend le lien de groupe déjà utilisé par la rubrique
// "Communauté" par défaut ; un lien collé dans l'admin (Contenu du site →
// Réseaux sociaux) le remplace si Gaspard veut en changer sans redéploiement.
// Volontairement voyant (couleur WhatsApp, pulsation) — demande explicite,
// à l'inverse du raccourci discret initial.
const CommunityWhatsAppLink = () => {
  const t = useTr();
  const settings = useSettings();
  const url = settings.whatsappCommunityUrl?.trim() || WA_CHANNEL_URL;
  if (!url) return null;

  return (
    <div style={{ background: "#0a0602", padding: "1.3rem 1.25rem", textAlign: "center" }}>
      <style>{`
        @keyframes gnz-wa-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37,211,102,.6); transform: scale(1); }
          50% { box-shadow: 0 0 0 12px rgba(37,211,102,0); transform: scale(1.04); }
        }
        .gnz-wa-community-btn { animation: gnz-wa-pulse 1.8s ease-in-out infinite; }
      `}</style>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="gnz-wa-community-btn"
        style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: WA_GREEN, color: "#06140c", textDecoration: "none", padding: "0.9rem 1.6rem", borderRadius: "999px", fontFamily: "'Montserrat',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
        <SvgWhatsapp size={18} />
        {t("whatsapp_community_join")}
      </a>
    </div>
  );
};

export default CommunityWhatsAppLink;
