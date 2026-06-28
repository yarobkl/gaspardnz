import { useState } from "react";
import { motion } from "framer-motion";
import { GOLD, SOCIAL_LINKS } from "../constants.js";
import { useTr } from "../context.jsx";
import { SvgInstagram, SvgTiktok, SvgYoutube, SvgWhatsapp } from "../icons.jsx";
import LegalModal from "./LegalModal.jsx";
import { useSettings } from "../hooks/useSettings.js";

const FooterMobile = ({ onFormules, onGalerie, onShowroom }) => {
  const t = useTr();
  const settings = useSettings();
  const [legalPage, setLegalPage] = useState(null);

  return (
    <>
      <footer style={{ background: "#070400", padding: "3.5rem 1.4rem 3rem", borderTop: "1px solid rgba(184,151,62,0.12)" }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "2.4rem" }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", letterSpacing: "0.3em", color: "#faf7f2", margin: "0 0 4px" }}>Gaspardnz</p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.5em", color: GOLD, textTransform: "uppercase" }}>{t("footer_subtitle")}</p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,151,62,0.3), transparent)", marginBottom: "2rem" }} />

        {/* Nav links */}
        <nav style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.4rem 1.4rem", marginBottom: "2rem" }}>
          {[
            [t("nav_showroom"), onShowroom],
            [t("nav_galerie"), onGalerie],
            [t("nav_formules"), onFormules],
            ["Instagram", () => window.open(settings.instagramUrl || SOCIAL_LINKS.instagram, "_blank")],
            ["TikTok", () => window.open(SOCIAL_LINKS.tiktok, "_blank")],
          ].map(([label, fn]) => (
            <button key={label} onClick={fn}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.2em", color: "rgba(245,240,232,0.7)", textTransform: "uppercase", padding: "12px 0", minHeight: "44px", minWidth: "44px", transition: "color 0.3s" }}
              onTouchStart={e => e.currentTarget.style.color = GOLD}
              onTouchEnd={e => e.currentTarget.style.color = "rgba(245,240,232,0.7)"}
            >{label}</button>
          ))}
        </nav>

        {/* Social icons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.4rem", marginBottom: "2rem" }}>
          {[
            [SvgInstagram, settings.instagramUrl || SOCIAL_LINKS.instagram, "Instagram Gaspard NZ"],
            [SvgTiktok, SOCIAL_LINKS.tiktok, "TikTok Gaspard NZ"],
            [SvgYoutube, SOCIAL_LINKS.youtube, "YouTube Gaspard NZ"],
          ].map(([Icon, href, label], i) => (
            <motion.a key={i} href={href} target="_blank" rel="noopener noreferrer"
              aria-label={label}
              whileTap={{ scale: 0.88 }}
              style={{ color: "rgba(245,240,232,0.72)", display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", transition: "color 0.3s" }}
              onTouchStart={e => e.currentTarget.style.color = GOLD}
              onTouchEnd={e => e.currentTarget.style.color = "rgba(245,240,232,0.72)"}
            ><Icon /></motion.a>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(184,151,62,0.15), transparent)", marginBottom: "1.4rem" }} />

        {/* Legal */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.4rem", marginBottom: "1.2rem" }}>
          {[
            [t("footer_mentions"), "mentions"],
            [t("footer_conf"), "confidentialite"],
            [t("footer_cgv"), "cgv"],
          ].map(([label, page]) => (
            <button key={label} onClick={() => setLegalPage(page)}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.15em", color: "rgba(245,240,232,0.62)", textDecoration: "none", textTransform: "uppercase", padding: "12px 0", minHeight: "44px", minWidth: "44px" }}>
              {label}
            </button>
          ))}
        </div>

        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", color: "rgba(245,240,232,0.55)", textAlign: "center", letterSpacing: "0.1em" }}>
          © {new Date().getFullYear()} Gaspardnz — Paris. {t("rights")}
        </p>

        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", color: "rgba(245,240,232,0.5)", textAlign: "center", letterSpacing: "0.1em", marginTop: "0.5rem" }}>
          {t("developed_by")}{" "}
          <a
            href="https://www.yaroconsulting.fr"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(245,240,232,0.68)", textDecoration: "none", borderBottom: "1px solid rgba(184,151,62,0.5)", display: "inline-flex", alignItems: "center", minHeight: "44px" }}
          >
            Rodrin Bakala
          </a>
        </p>
      </footer>

      {legalPage && <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />}
    </>
  );
};

export default FooterMobile;
