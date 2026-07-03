import { useContext, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GOLD, CREAM } from "../../constants.js";
import { LangCtx, useTr } from "../../context.jsx";
import { PARTNERS_DATA } from "../../data/partners.js";
import PartnersContactModal from "../PartnersContactModal.jsx";

// Badge "-X%" masqué temporairement (accord partenaire pas encore finalisé) — repasser à true pour le réafficher.
const SHOW_PARTNER_DISCOUNT_BADGE = false;

const PartnersSection = ({ refEl }) => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const ref = refEl || useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleContactClick = (partner) => {
    setSelectedPartner(partner);
    setModalOpen(true);
  };

  const getPartnerText = (partner, key, fallback) => {
    if (lang === "EN" && partner[`${key}En`]) return partner[`${key}En`];
    if (lang === "ES" && partner[`${key}Es`]) return partner[`${key}Es`];
    if (lang === "ZH" && partner[`${key}Zh`]) return partner[`${key}Zh`];
    return partner[key] || fallback;
  };

  return (
    <>
      <section ref={ref} style={{ background: "#0a0602", padding: "5rem 0 6rem", color: CREAM }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.4rem" }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7 }}
            style={{ marginBottom: "3.5rem" }}>
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.42em",
              color: GOLD,
              textTransform: "uppercase",
              margin: "0 0 0.8rem 0",
            }}>
              {t("partners_surtitle") || "Partenaires"}
            </p>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(40px, 13vw, 72px)",
              color: CREAM,
              margin: "0 0 1.2rem 0",
              letterSpacing: "0.04em",
            }}>
              {t("partners_title") || "Nos Partenaires"}
            </h2>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(16px, 4vw, 20px)",
              fontStyle: "italic",
              color: "rgba(245,240,232,0.8)",
              margin: 0,
              letterSpacing: "0.02em",
            }}>
              {t("partners_subtitle") || "Les meilleurs professionnels pour votre événement"}
            </p>
          </motion.div>

          {/* Partners Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            marginBottom: "1rem",
          }}>
            {PARTNERS_DATA.map((partner, idx) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                style={{
                  background: "rgba(184,151,62,0.03)",
                  border: `1px solid ${GOLD}33`,
                  borderRadius: "8px",
                  padding: "1.8rem",
                  position: "relative",
                  overflow: "hidden",
                }}>

                {/* Badge Réduction Client */}
                {SHOW_PARTNER_DISCOUNT_BADGE && !partner.placeholder && partner.clientDiscount && (
                  <div style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    background: GOLD,
                    color: "#0a0602",
                    padding: "0.6rem 1.2rem",
                    borderRadius: "20px",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "13px",
                    fontWeight: "600",
                    letterSpacing: "0.05em",
                  }}>
                    -{partner.clientDiscount}%
                  </div>
                )}

                {/* Logo */}
                {partner.logo && !partner.placeholder ? (
                  <div style={{
                    height: "120px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                    borderBottom: `1px solid ${GOLD}22`,
                  }}>
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                    background: "rgba(184,151,62,0.1)",
                    borderRadius: "4px",
                    color: GOLD,
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "24px",
                    opacity: partner.placeholder ? 0.5 : 1,
                  }}>
                    {partner.placeholder ? "?" : "🎭"}
                  </div>
                )}

                {/* Category */}
                <p style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  color: GOLD,
                  textTransform: "uppercase",
                  margin: "0 0 0.6rem 0",
                }}>
                  {getPartnerText(partner, "category", "Catégorie")}
                </p>

                {/* Name */}
                <h3 style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(20px, 5vw, 28px)",
                  color: CREAM,
                  margin: "0 0 0.8rem 0",
                  letterSpacing: "0.04em",
                  opacity: partner.placeholder ? 0.6 : 1,
                }}>
                  {getPartnerText(partner, "name", "Nom")}
                </h3>

                {/* Description */}
                <p style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "14px",
                  color: "rgba(245,240,232,0.75)",
                  lineHeight: 1.6,
                  margin: "0 0 1.5rem 0",
                  minHeight: "50px",
                  opacity: partner.placeholder ? 0.6 : 1,
                }}>
                  {getPartnerText(partner, "description", "Description")}
                </p>

                {/* Button */}
                {!partner.placeholder && partner.status !== 'coming_soon' ? (
                  <motion.button
                    onClick={() => {
                      if (partner.status === 'coming_soon') {
                        alert(t("partners_coming_soon_msg") || "Ce partenaire sera bientôt disponible. Merci de votre patience!");
                      } else {
                        handleContactClick(partner);
                      }
                    }}
                    disabled={partner.status === 'coming_soon'}
                    whileHover={partner.status !== 'coming_soon' ? { background: `${GOLD}22` } : {}}
                    whileTap={partner.status !== 'coming_soon' ? { scale: 0.98 } : {}}
                    style={{
                      width: "100%",
                      padding: "0.8rem 1.2rem",
                      background: partner.status === 'coming_soon' ? `rgba(184,151,62,0.05)` : `rgba(184,151,62,0.1)`,
                      border: `1px solid ${partner.status === 'coming_soon' ? `${GOLD}33` : GOLD}`,
                      color: partner.status === 'coming_soon' ? "rgba(245,240,232,0.5)" : CREAM,
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: partner.status === 'coming_soon' ? "not-allowed" : "pointer",
                      borderRadius: "4px",
                      transition: "all 0.3s ease",
                      opacity: partner.status === 'coming_soon' ? 0.6 : 1,
                    }}>
                    {partner.status === 'coming_soon' ? (t("partners_coming_soon") || "À venir") : (t("partners_contact_btn") || "Prendre Contact")}
                  </motion.button>
                ) : (
                  <button
                    disabled
                    onClick={() => alert(t("partners_coming_soon_msg") || "Ce partenaire sera bientôt disponible. Merci de votre patience!")}
                    style={{
                      width: "100%",
                      padding: "0.8rem 1.2rem",
                      background: "rgba(184,151,62,0.05)",
                      border: `1px solid ${GOLD}33`,
                      color: "rgba(245,240,232,0.7)",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      textAlign: "center",
                      borderRadius: "4px",
                      cursor: "not-allowed",
                    }}>
                    {t("partners_coming_soon") || "À venir"}
                  </button>
                )}

                {/* Website Link (visible for active partners) */}
                {partner.website && !partner.placeholder && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "1rem",
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "10px",
                      color: GOLD,
                      textDecoration: "none",
                      letterSpacing: "0.05em",
                      borderBottom: `1px solid ${GOLD}`,
                    }}>
                    {t("partners_visit_site") || "Visiter le site →"}
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{
              background: `rgba(184,151,62,0.08)`,
              border: `1px solid ${GOLD}33`,
              padding: "1.5rem 1.8rem",
              borderRadius: "8px",
              marginTop: "2.5rem",
            }}>
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: "12px",
              color: CREAM,
              margin: 0,
              letterSpacing: "0.05em",
              lineHeight: 1.6,
            }}>
              <span style={{ color: GOLD, fontWeight: "600" }}>💡 {t("partners_info_title") || "Avantage Partenaires"}:</span> {" "}
              {t("partners_commission_info") || "Bénéficiez de 5% de réduction avec nos partenaires sélectionnés"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Modal Contact */}
      <PartnersContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        partner={selectedPartner || {}}
      />
    </>
  );
};

export default PartnersSection;
