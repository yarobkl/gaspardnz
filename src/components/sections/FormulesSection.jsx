import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { GOLD, CREAM } from "../../constants.js";
import { SvgArrow, SvgLock } from "../../icons.jsx";
import { useTr } from "../../context.jsx";
import { useSettings } from "../../hooks/useSettings.js";
import { listPackagesWithBreakdown, subscribePackagePricing, sumGroupItems, sumPackageTotal } from "../../services/packagePricing.js";
import { downloadFile } from "../../utils/downloadFile.js";

// Les formules (menus, articles, prix) viennent entièrement de Supabase —
// plus rien n'est codé en dur ici. Gaspard peut créer, modifier ou retirer
// une formule depuis l'admin (Contenu du site → Formules) sans redéploiement.
// RLS filtre déjà ce qu'un visiteur peut voir (publiée, non supprimée) :
// listPackagesWithBreakdown() renvoie donc directement la bonne liste.
const FormulesSection = ({ refEl, onContact }) => {
  const t = useTr();
  const settings = useSettings();
  const [packages, setPackages] = useState([]);
  // Distingue "encore en train de charger" de "a fini de charger, rien à
  // montrer" : sans ça, une panne ou une lenteur Supabase laisse cette
  // section vide en permanence, sans aucun message ni moyen de contact —
  // exactement ce qui se passait avant, tant que le premier chargement
  // n'avait pas abouti.
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [lookbookDownload, setLookbookDownload] = useState("idle"); // idle | busy | error
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  useEffect(() => {
    let alive = true;
    const load = () => listPackagesWithBreakdown()
      .then((rows) => { if (alive) { setPackages(rows); setLoaded(true); } })
      .catch(() => { if (alive) setLoaded(true); });
    load();
    const unsubscribe = subscribePackagePricing(load);
    return () => { alive = false; unsubscribe(); };
  }, []);

  const formules = packages.filter((pkg) => pkg.published && !pkg.deleted_at);

  const handleLookbookDownload = async () => {
    setLookbookDownload("busy");
    try {
      await downloadFile(settings.lookbookPdfUrl, settings.lookbookFilename || "lookbook-gaspardnz.pdf");
      setLookbookDownload("idle");
    } catch {
      setLookbookDownload("error");
    }
  };

  const formatPrice = (price, currency) => {
    if (price === null || price === undefined || Number.isNaN(Number(price))) return t("prix_sur_demande");
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency || "EUR", maximumFractionDigits: 0 }).format(Number(price));
  };

  return (
    <section ref={node => { ref.current = node; if (refEl) refEl.current = node; }} style={{ background: "#0d1b3e", padding: "5rem 0 6rem", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", right: "-1rem", top: "50%", transform: "translateY(-50%)", fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(80px, 35vw, 220px)", color: "rgba(255,255,255,0.03)", lineHeight: 1, letterSpacing: "0.05em", whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none" }}>{t("formules_title")}</div>
      <div ref={ref} style={{ padding: "0 1.4rem", position: "relative" }}>
        <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.7 }} style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}>{t("formules_surtitle")}</motion.p>
        <div style={{ overflow: "hidden", marginBottom: "0.6rem" }}><motion.h2 initial={{ y: "105%" }} animate={inView ? { y: 0 } : {}} transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 13vw, 72px)", lineHeight: 0.9, letterSpacing: "0.04em", color: CREAM, margin: 0 }}>{t("formules_title")}</motion.h2></div>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(0.95rem, 3.8vw, 1.1rem)", fontWeight: 300, color: "rgba(245,240,232,0.75)", lineHeight: 1.7, fontStyle: "italic", marginBottom: "3rem" }}>{t("formules_sub")}</motion.p>

        {loaded && formules.length === 0 && (
          <div style={{ padding: "1.6rem 1.4rem", border: "1px solid rgba(184,151,62,0.3)", background: "rgba(184,151,62,0.05)", textAlign: "center", marginBottom: "1.5rem" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", fontStyle: "italic", color: "rgba(245,240,232,0.8)", margin: "0 0 1.2rem" }}>{t("formules_indisponibles")}</p>
            <button onClick={onContact} style={{ background: "none", border: "1px solid rgba(184,151,62,0.5)", color: GOLD, padding: "0.9rem 1.6rem", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", cursor: "pointer" }}>{t("btn_reveler")}</button>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {formules.map((pkg, fi) => {
            const groups = pkg.package_groups || [];
            const total = sumPackageTotal(pkg);
            const hasBreakdown = groups.length > 0;
            return (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 + fi * 0.08, duration: 0.55 }} style={{ border: `1px solid rgba(184,151,62,${selected === pkg.id ? "0.5" : "0.18"})`, background: selected === pkg.id ? "rgba(184,151,62,0.05)" : "rgba(255,255,255,0.02)", transition: "all 0.3s" }}>
              <button onClick={() => setSelected(selected === pkg.id ? null : pkg.id)} aria-expanded={selected === pkg.id} aria-controls={`formule-content-${pkg.id}`} style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "1.6rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", textAlign: "left" }}>
                <div>
                  {pkg.subtitle && <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}><span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", border: "1px solid rgba(184,151,62,0.3)", padding: "3px 8px" }}>{pkg.subtitle}</span></div>}
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.3rem, 5.5vw, 1.7rem)", color: CREAM, fontWeight: 400, letterSpacing: "0.02em", margin: 0 }}>{pkg.name}</p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.3em", color: "rgba(184,151,62,0.8)", textTransform: "uppercase", marginTop: "6px" }}>{formatPrice(hasBreakdown ? total : pkg.price, pkg.currency)}{hasBreakdown ? ` · ${t("hors_chaussures")}` : ""}</p>
                </div>
                <motion.div animate={{ rotate: selected === pkg.id ? 45 : 0 }} transition={{ duration: 0.3 }} style={{ color: GOLD, marginTop: "0.5rem", flexShrink: 0 }}><SvgArrow size={16} /></motion.div>
              </button>

              <AnimatePresence>{selected === pkg.id && <motion.div id={`formule-content-${pkg.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: "hidden" }}><div style={{ padding: "0 1.4rem 1.8rem", borderTop: "1px solid rgba(184,151,62,0.1)" }}>
                {groups.map((group) => (
                  <div key={group.id} style={{ marginTop: "1.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.9rem" }}><div style={{ height: "1px", width: "20px", background: GOLD }} /><p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase" }}>{group.label}{group.tag ? ` — ${group.tag}` : ""}</p></div>
                    {(group.package_items || []).map((item) => (
                      <div key={item.id} style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem" }}>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(245,240,232,0.65)", fontWeight: 300, margin: 0 }}>{item.label}</p>
                        {item.price !== null && item.price !== undefined && <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: GOLD, whiteSpace: "nowrap", margin: 0 }}>{item.price_is_from ? `${t("item_prix_a_partir_de")} ${formatPrice(item.price, pkg.currency)}` : formatPrice(item.price, pkg.currency)}</p>}
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.85rem 0 0", fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: CREAM, textTransform: "uppercase", letterSpacing: "0.08em" }}><span>{t("sous_total_lbl")} · {group.label}</span><strong style={{ color: GOLD }}>{formatPrice(sumGroupItems(group), pkg.currency)}</strong></div>
                  </div>
                ))}

                {hasBreakdown && <div style={{ marginTop: "1.5rem", padding: "1rem", borderTop: "1px solid rgba(184,151,62,0.35)", borderBottom: "1px solid rgba(184,151,62,0.35)", display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}><span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.16em", color: CREAM, textTransform: "uppercase" }}>{t("total_lbl")} · {t("hors_chaussures")}</span><strong style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", color: GOLD }}>{formatPrice(total, pkg.currency)}</strong></div>}

                <div style={{ marginTop: "1.4rem", padding: "1.2rem", background: "rgba(184,151,62,0.08)", border: "1px solid rgba(184,151,62,0.25)", textAlign: "center" }}>{pkg.description && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", color: "rgba(245,240,232,0.75)", fontStyle: "italic", marginBottom: "1.2rem" }}>{pkg.description}</p>}<button onClick={onContact} data-track="booking_click" style={{ width: "100%", background: "none", border: "1px solid rgba(184,151,62,0.5)", color: GOLD, padding: "0.9rem", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>{pkg.cta_label || t("btn_reveler")} <SvgArrow size={13} /></button></div>
              </div></motion.div>}</AnimatePresence>
            </motion.div>
          );})}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.7, duration: 0.7 }} style={{ margin: "2.5rem 0 0", padding: "2rem 1.4rem", border: "1px solid rgba(184,151,62,0.3)", background: "rgba(184,151,62,0.05)", textAlign: "center" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.4em", color: GOLD, textTransform: "uppercase", marginBottom: "1rem" }}>GASPARDNZ · 2025</p>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 7vw, 2.2rem)", fontWeight: 300, color: CREAM, letterSpacing: "0.02em", margin: "0 0 0.6rem" }}>{t("lookbook_title")}</h3>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.9rem", color: "rgba(245,240,232,0.62)", marginBottom: "1.6rem" }}>{t("lookbook_desc")}</p>
          {/* Téléchargement gratuit temporairement désactivé (le PDF et la
              logique de téléchargement en place restent prêts — cf.
              handleLookbookDownload / downloadFile — pour une réactivation
              rapide, il suffira de retirer ce `disabled`). */}
          <button type="button" onClick={handleLookbookDownload} disabled aria-disabled="true" data-track="lookbook_download" style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: GOLD, color: "#0d1b3e", border: "none", opacity: 0.45, cursor: "not-allowed", padding: "1rem 2.2rem", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", fontWeight: 700 }}>{t("lookbook_download")}</button>
          <p style={{ marginTop: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", color: "rgba(245,240,232,0.55)", fontFamily: "'Montserrat', sans-serif", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase" }}><SvgLock size={12} />{settings.lookbookHiddenMessage?.trim() || t("lookbook_soon")}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default FormulesSection;
