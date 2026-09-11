import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { GOLD } from "../constants.js";
import { LangCtx } from "../context.jsx";

const COPY = {
  FR: {
    eyebrow: "GASPARDNZ · PARIS",
    title: "L’essentiel",
    intro: "Accédez directement aux univers principaux. Le reste reste disponible à la demande.",
    close: "Fermer la section",
    more: "Explorer tous les univers",
    less: "Réduire",
    items: {
      heritage: "La Maison",
      journal: "Style Journal",
      gallery: "Les Looks",
      video: "Vidéos",
      wedding: "Mariage",
      formules: "Formules",
      partners: "Partenaires",
      news: "Actualités",
      vip: "VIP",
      styleMonth: "Style du mois",
      community: "Communauté",
    },
  },
  EN: {
    eyebrow: "GASPARDNZ · PARIS",
    title: "The essentials",
    intro: "Go straight to the main universes. Everything else stays available on demand.",
    close: "Close section",
    more: "Explore all universes",
    less: "Collapse",
    items: { heritage: "The House", journal: "Style Journal", gallery: "Looks", video: "Videos", wedding: "Wedding", formules: "Packages", partners: "Partners", news: "News", vip: "VIP", styleMonth: "Style of the month", community: "Community" },
  },
  ES: {
    eyebrow: "GASPARDNZ · PARIS",
    title: "Lo esencial",
    intro: "Accede directamente a los universos principales. El resto sigue disponible bajo demanda.",
    close: "Cerrar sección",
    more: "Explorar todos los universos",
    less: "Reducir",
    items: { heritage: "La Casa", journal: "Style Journal", gallery: "Looks", video: "Vídeos", wedding: "Boda", formules: "Fórmulas", partners: "Socios", news: "Noticias", vip: "VIP", styleMonth: "Estilo del mes", community: "Comunidad" },
  },
  ZH: {
    eyebrow: "GASPARDNZ · PARIS",
    title: "精选内容",
    intro: "直接进入核心内容，其他栏目仍可按需打开。",
    close: "关闭内容",
    more: "探索全部内容",
    less: "收起",
    items: { heritage: "品牌故事", journal: "风格日志", gallery: "造型", video: "视频", wedding: "婚礼", formules: "服务方案", partners: "合作伙伴", news: "动态", vip: "VIP", styleMonth: "本月风格", community: "社区" },
  },
};

const PRIMARY = ["gallery", "formules", "styleMonth", "wedding"];
const SECONDARY = ["journal", "heritage", "video", "news", "partners", "vip", "community"];

const ChoiceButton = ({ label, active, onClick }) => (
  <motion.button
    type="button"
    whileTap={{ scale: .985 }}
    onClick={onClick}
    aria-pressed={active}
    style={{
      minHeight: 52,
      border: `1px solid ${active ? GOLD : "rgba(184,151,62,.28)"}`,
      borderRadius: 2,
      background: active ? "rgba(184,151,62,.14)" : "rgba(255,255,255,.018)",
      color: active ? GOLD : "rgba(250,247,242,.9)",
      padding: ".72rem .76rem",
      fontFamily: "'Montserrat',sans-serif",
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: ".11em",
      textTransform: "uppercase",
      textAlign: "left",
      cursor: "pointer",
    }}>
    {label}
  </motion.button>
);

export default function MobileHomeCompact({ activeSection, onSelect }) {
  const { lang } = useContext(LangCtx);
  const [showAll, setShowAll] = useState(false);
  const copy = COPY[lang] || COPY.FR;

  return (
    <section id="gnz-mobile-home" aria-label={copy.title} style={{ background: "#0a0602", color: "#faf7f2", padding: "1.8rem 1.15rem 2rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p style={{ margin: 0, color: GOLD, fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: ".34em", textTransform: "uppercase" }}>{copy.eyebrow}</p>
        <h2 style={{ margin: ".45rem 0 .45rem", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(28px,8vw,36px)", lineHeight: 1.02, letterSpacing: ".01em" }}>{copy.title}</h2>
        <p style={{ margin: "0 0 1rem", maxWidth: 440, color: "rgba(250,247,242,.64)", fontFamily: "'Montserrat',sans-serif", fontSize: 10.5, lineHeight: 1.55 }}>{copy.intro}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
          {PRIMARY.map((key) => (
            <ChoiceButton key={key} label={copy.items[key]} active={activeSection === key} onClick={() => onSelect(activeSection === key ? null : key)} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          aria-expanded={showAll}
          style={{ marginTop: 10, width: "100%", minHeight: 44, border: "1px solid rgba(184,151,62,.2)", borderRadius: 2, background: "transparent", color: "rgba(250,247,242,.66)", fontFamily: "'Montserrat',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".13em", textTransform: "uppercase", cursor: "pointer" }}>
          {showAll ? copy.less : `${copy.more} · ${SECONDARY.length}`}
        </button>

        {showAll && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
            {SECONDARY.map((key) => (
              <ChoiceButton key={key} label={copy.items[key]} active={activeSection === key} onClick={() => onSelect(activeSection === key ? null : key)} />
            ))}
          </motion.div>
        )}

        {activeSection && (
          <button type="button" onClick={() => onSelect(null)} style={{ marginTop: 10, minHeight: 44, width: "100%", border: 0, background: "transparent", color: "rgba(250,247,242,.5)", fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer" }}>
            {copy.close}
          </button>
        )}
      </div>
    </section>
  );
}
