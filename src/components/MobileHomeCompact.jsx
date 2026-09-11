import { useContext } from "react";
import { motion } from "framer-motion";
import { GOLD } from "../constants.js";
import { LangCtx } from "../context.jsx";

const COPY = {
  FR: {
    eyebrow: "GASPARDNZ · PARIS",
    title: "Explorer l’univers",
    intro: "Choisissez directement ce que vous souhaitez découvrir, sans parcourir toute la page.",
    close: "Fermer la section",
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
    title: "Explore the universe",
    intro: "Go straight to what you want to discover, without scrolling through the whole page.",
    close: "Close section",
    items: { heritage: "The House", journal: "Style Journal", gallery: "Looks", video: "Videos", wedding: "Wedding", formules: "Packages", partners: "Partners", news: "News", vip: "VIP", styleMonth: "Style of the month", community: "Community" },
  },
  ES: {
    eyebrow: "GASPARDNZ · PARIS",
    title: "Explorar el universo",
    intro: "Ve directamente a lo que quieres descubrir, sin recorrer toda la página.",
    close: "Cerrar sección",
    items: { heritage: "La Casa", journal: "Style Journal", gallery: "Looks", video: "Vídeos", wedding: "Boda", formules: "Fórmulas", partners: "Socios", news: "Noticias", vip: "VIP", styleMonth: "Estilo del mes", community: "Comunidad" },
  },
  ZH: {
    eyebrow: "GASPARDNZ · PARIS",
    title: "探索 GaspardNZ",
    intro: "直接选择您想看的内容，无需一直向下滚动整页。",
    close: "关闭内容",
    items: { heritage: "品牌故事", journal: "风格日志", gallery: "造型", video: "视频", wedding: "婚礼", formules: "服务方案", partners: "合作伙伴", news: "动态", vip: "VIP", styleMonth: "本月风格", community: "社区" },
  },
};

const ORDER = ["gallery", "formules", "styleMonth", "wedding", "journal", "heritage", "video", "news", "partners", "vip", "community"];

export default function MobileHomeCompact({ activeSection, onSelect }) {
  const { lang } = useContext(LangCtx);
  const copy = COPY[lang] || COPY.FR;

  return (
    <section id="gnz-mobile-home" aria-label={copy.title} style={{ background: "#0a0602", color: "#faf7f2", padding: "2.25rem 1.15rem 2.5rem" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <p style={{ margin: 0, color: GOLD, fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: ".34em", textTransform: "uppercase" }}>{copy.eyebrow}</p>
        <h2 style={{ margin: ".55rem 0 .55rem", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontSize: "clamp(29px,9vw,38px)", lineHeight: 1.02, letterSpacing: ".01em" }}>{copy.title}</h2>
        <p style={{ margin: "0 0 1.35rem", maxWidth: 440, color: "rgba(250,247,242,.68)", fontFamily: "'Montserrat',sans-serif", fontSize: 11, lineHeight: 1.65 }}>{copy.intro}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
          {ORDER.map((key) => {
            const active = activeSection === key;
            return (
              <motion.button
                key={key}
                type="button"
                whileTap={{ scale: .985 }}
                onClick={() => onSelect(active ? null : key)}
                aria-pressed={active}
                style={{
                  minHeight: 48,
                  border: `1px solid ${active ? GOLD : "rgba(184,151,62,.28)"}`,
                  borderRadius: 2,
                  background: active ? "rgba(184,151,62,.14)" : "rgba(255,255,255,.018)",
                  color: active ? GOLD : "rgba(250,247,242,.88)",
                  padding: ".7rem .72rem",
                  fontFamily: "'Montserrat',sans-serif",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: ".11em",
                  textTransform: "uppercase",
                  textAlign: "left",
                  cursor: "pointer",
                }}>
                {copy.items[key]}
              </motion.button>
            );
          })}
        </div>

        {activeSection && (
          <button type="button" onClick={() => onSelect(null)} style={{ marginTop: 14, minHeight: 44, width: "100%", border: 0, background: "transparent", color: "rgba(250,247,242,.55)", fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer" }}>
            {copy.close}
          </button>
        )}
      </div>
    </section>
  );
}
