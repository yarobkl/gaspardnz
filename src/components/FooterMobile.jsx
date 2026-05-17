import { useState } from "react";
import { motion } from "framer-motion";
import { GOLD } from "../constants.js";
import { useTr } from "../context.jsx";
import { SvgInstagram, SvgTiktok, SvgYoutube, SvgWhatsapp } from "../icons.jsx";
import LegalModal from "./LegalModal.jsx";

const WA_NUM = "33664826920";

const FooterMobile = ({ onFormules, onGalerie, onShowroom }) => {
  const t = useTr();
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
            ["Instagram", () => window.open("https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq", "_blank")],
            ["TikTok", () => window.open("https://www.tiktok.com/@gaspardnz?_r=1&_t=ZS-95wB65ZWhvB", "_blank")],
          ].map(([label, fn]) => (
            <button key={label} onClick={fn}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "8px", letterSpacing: "0.2em", color: "rgba(245,240,232,0.4)", textTransform: "uppercase", padding: "4px 0", transition: "color 0.3s" }}
              onTouchStart={e => e.currentTarget.style.color = GOLD}
              onTouchEnd={e => e.currentTarget.style.color = "rgba(245,240,232,0.4)"}
            >{label}</button>
          ))}
        </nav>

        {/* Social icons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1.4rem", marginBottom: "2rem" }}>
          {[
            [SvgInstagram, "https://www.instagram.com/gaspardnz_?igsh=YWgzb3Jua2NkeDdq"],
            [SvgTiktok, "https://www.tiktok.com/@gaspardnz?_r=1&_t=ZS-95wB65ZWhvB"],
            [SvgYoutube, "https://youtube.com/@gaspardnz?si=s4saxiuv7rt9iUmT"],
            [SvgWhatsapp, `https://wa.me/${WA_NUM}`],
          ].map(([Icon, href], i) => (
            <motion.a key={i} href={href} target="_blank" rel="noopener noreferrer"
              whileTap={{ scale: 0.88 }}
              style={{ color: "rgba(245,240,232,0.35)", display: "flex", transition: "color 0.3s" }}
              onTouchStart={e => e.currentTarget.style.color = GOLD}
              onTouchEnd={e => e.currentTarget.style.color = "rgba(245,240,232,0.35)"}
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
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.15em", color: "rgba(245,240,232,0.22)", textDecoration: "none", textTransform: "uppercase", padding: 0 }}>
              {label}
            </button>
          ))}
        </div>

        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", color: "rgba(245,240,232,0.15)", textAlign: "center", letterSpacing: "0.1em" }}>
          © {new Date().getFullYear()} Gaspardnz — Paris. Tous droits réservés.
        </p>
      </footer>

      {legalPage && <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />}
    </>
  );
};

export default FooterMobile;
