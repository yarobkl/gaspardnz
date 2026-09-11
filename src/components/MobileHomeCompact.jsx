import { useContext } from "react";
import { motion } from "framer-motion";
import { GOLD } from "../constants.js";
import { LangCtx } from "../context.jsx";
import HeritageMobile from "./HeritageMobile.jsx";
import PartnersSection from "./sections/PartnersSection.jsx";

const COPY = {
  FR: {
    eyebrow: "GASPARDNZ · PARIS",
    title: "Explorer l’univers",
    intro: "Choisissez directement ce que vous souhaitez découvrir, sans parcourir toute la page.",
    close: "Fermer la section",
    attractionEyebrow: "Votre style · votre moment",
    attractionTitle: "Votre événement mérite plus qu’une tenue.",
    attractionText: "Mariage, gala, cérémonie ou conseil en image : GaspardNZ compose une allure forte et vous accompagne jusqu’au jour J.",
    attractionPrimary: "Découvrir les formules",
    attractionSecondary: "Parler à Gaspard",
    whatsapp: "Bonjour Gaspard, je souhaite être accompagné pour mon événement.",
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
    attractionEyebrow: "Your style · your moment",
    attractionTitle: "Your event deserves more than an outfit.",
    attractionText: "Wedding, gala, ceremony or image consulting: GaspardNZ builds a strong look and supports you through the big day.",
    attractionPrimary: "Discover packages",
    attractionSecondary: "Talk to Gaspard",
    whatsapp: "Hello Gaspard, I would like support for my event.",
    items: { heritage: "The House", journal: "Style Journal", gallery: "Looks", video: "Videos", wedding: "Wedding", formules: "Packages", partners: "Partners", news: "News", vip: "VIP", styleMonth: "Style of the month", community: "Community" },
  },
  ES: {
    eyebrow: "GASPARDNZ · PARIS",
    title: "Explorar el universo",
    intro: "Ve directamente a lo que quieres descubrir, sin recorrer toda la página.",
    close: "Cerrar sección",
    attractionEyebrow: "Tu estilo · tu momento",
    attractionTitle: "Tu evento merece más que un conjunto.",
    attractionText: "Boda, gala, ceremonia o asesoría de imagen: GaspardNZ crea una presencia fuerte y te acompaña hasta el gran día.",
    attractionPrimary: "Descubrir las fórmulas",
    attractionSecondary: "Hablar con Gaspard",
    whatsapp: "Hola Gaspard, me gustaría recibir acompañamiento para mi evento.",
    items: { heritage: "La Casa", journal: "Style Journal", gallery: "Looks", video: "Vídeos", wedding: "Boda", formules: "Fórmulas", partners: "Socios", news: "Noticias", vip: "VIP", styleMonth: "Estilo del mes", community: "Comunidad" },
  },
  ZH: {
    eyebrow: "GASPARDNZ · PARIS",
    title: "探索 GaspardNZ",
    intro: "直接选择您想看的内容，无需一直向下滚动整页。",
    close: "关闭内容",
    attractionEyebrow: "你的风格 · 你的重要时刻",
    attractionTitle: "重要场合，值得的不只是一套衣服。",
    attractionText: "婚礼、晚宴、仪式或形象顾问服务：GaspardNZ 为你打造有力量的造型，并陪伴你直到重要当天。",
    attractionPrimary: "查看服务方案",
    attractionSecondary: "联系 Gaspard",
    whatsapp: "你好 Gaspard，我想咨询我的活动造型服务。",
    items: { heritage: "品牌故事", journal: "风格日志", gallery: "造型", video: "视频", wedding: "婚礼", formules: "服务方案", partners: "合作伙伴", news: "动态", vip: "VIP", styleMonth: "本月风格", community: "社区" },
  },
};

const ORDER = ["formules", "gallery", "wedding", "styleMonth", "journal", "heritage", "video", "news", "partners", "vip", "community"];

const scrollToActiveSection = (attempt = 0) => {
  if (typeof window === "undefined") return;
  const target = document.getElementById("gnz-mobile-active-section");
  if (target) {
    const top = target.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    return;
  }
  if (attempt < 12) {
    window.setTimeout(() => scrollToActiveSection(attempt + 1), 60);
  }
};

const scrollToExplorer = (attempt = 0) => {
  if (typeof window === "undefined") return;
  const target = document.getElementById("gnz-mobile-home");
  if (target) {
    const top = target.getBoundingClientRect().top + window.scrollY - 68;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    return;
  }
  if (attempt < 12) {
    window.setTimeout(() => scrollToExplorer(attempt + 1), 60);
  }
};

export default function MobileHomeCompact({ activeSection, onSelect }) {
  const { lang } = useContext(LangCtx);
  const copy = COPY[lang] || COPY.FR;

  const openSection = (key) => {
    onSelect(key);
    window.requestAnimationFrame(() => {
      scrollToActiveSection();
      window.setTimeout(() => scrollToActiveSection(), 260);
    });
  };

  const closeSection = () => {
    onSelect(null);
    window.requestAnimationFrame(() => {
      scrollToExplorer();
      window.setTimeout(() => scrollToExplorer(), 220);
    });
  };

  return (
    <>
      <HeritageMobile />

      <section aria-label={copy.attractionTitle} style={{ background: "#0a0602", color: "#faf7f2", padding: "3.2rem 1.25rem 3.4rem", borderTop: "1px solid rgba(184,151,62,.16)" }}>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: .7 }}
          style={{ maxWidth: 560, margin: "0 auto" }}>
          <p style={{ margin: 0, color: GOLD, fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: ".34em", textTransform: "uppercase" }}>{copy.attractionEyebrow}</p>
          <h2 style={{ margin: ".7rem 0 .9rem", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(31px,9.8vw,43px)", lineHeight: 1.05, color: "#faf7f2" }}>{copy.attractionTitle}</h2>
          <p style={{ margin: "0 0 1.45rem", color: "rgba(250,247,242,.72)", fontFamily: "'Montserrat',sans-serif", fontSize: 11, lineHeight: 1.75 }}>{copy.attractionText}</p>
          <div style={{ display: "grid", gap: 9 }}>
            <button
              type="button"
              onClick={() => openSection("formules")}
              style={{ minHeight: 50, border: `1px solid ${GOLD}`, background: GOLD, color: "#0a0602", fontFamily: "'Montserrat',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", cursor: "pointer", touchAction: "manipulation" }}>
              {copy.attractionPrimary}
            </button>
            <a
              href={`https://wa.me/33664826920?text=${encodeURIComponent(copy.whatsapp)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ minHeight: 50, border: "1px solid rgba(184,151,62,.42)", color: GOLD, textDecoration: "none", fontFamily: "'Montserrat',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: ".18em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {copy.attractionSecondary}
            </a>
          </div>
        </motion.div>
      </section>

      {activeSection !== "partners" && (
        <PartnersSection compact onShowAll={() => openSection("partners")} />
      )}

      <section id="gnz-mobile-home" aria-label={copy.title} style={{ background: "#0a0602", color: "#faf7f2", padding: "2.6rem 1.15rem 2.8rem", borderTop: "1px solid rgba(184,151,62,.12)" }}>
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
                  whileTap={{ scale: .975 }}
                  onClick={() => openSection(key)}
                  aria-pressed={active}
                  aria-controls="gnz-mobile-active-section"
                  style={{
                    minHeight: 52,
                    border: `1px solid ${active ? GOLD : "rgba(184,151,62,.28)"}`,
                    borderRadius: 2,
                    background: active ? "rgba(184,151,62,.16)" : "rgba(255,255,255,.018)",
                    color: active ? GOLD : "rgba(250,247,242,.88)",
                    padding: ".78rem .78rem",
                    fontFamily: "'Montserrat',sans-serif",
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: ".11em",
                    textTransform: "uppercase",
                    textAlign: "left",
                    cursor: "pointer",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}>
                  {copy.items[key]}
                </motion.button>
              );
            })}
          </div>

          {activeSection && (
            <button type="button" onClick={closeSection} style={{ marginTop: 14, minHeight: 44, width: "100%", border: 0, background: "transparent", color: "rgba(250,247,242,.55)", fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", cursor: "pointer" }}>
              {copy.close}
            </button>
          )}
        </div>
      </section>

      {activeSection && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: .92, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: .92, y: -6 }}
          whileTap={{ scale: .94 }}
          onClick={closeSection}
          aria-label={copy.close}
          title={copy.close}
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top, 0px) + 82px)",
            right: 14,
            zIndex: 120,
            minWidth: 46,
            height: 46,
            borderRadius: 999,
            border: "1px solid rgba(184,151,62,.58)",
            background: "rgba(10,6,2,.88)",
            color: GOLD,
            boxShadow: "0 8px 28px rgba(0,0,0,.32)",
            WebkitBackdropFilter: "blur(12px)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 14px",
            fontFamily: "'Montserrat',sans-serif",
            fontSize: 20,
            lineHeight: 1,
            cursor: "pointer",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}>
          ×
        </motion.button>
      )}
    </>
  );
}
