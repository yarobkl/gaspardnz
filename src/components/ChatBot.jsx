import { useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GOLD, CREAM, SOCIAL_LINKS, TEXT } from "../constants.js";
import { LangCtx, useTr } from "../context.jsx";
import { findReply, getChatLabels, getFallbackReply, getGreeting } from "../data/chatbotData.js";
import { useSettings } from "../hooks/useSettings.js";
import { getWhatsappUrl } from "../utils/whatsappUtil.js";

const AVATAR_SRC = (typeof import.meta !== "undefined" ? (import.meta.env.BASE_URL || "/") : "/") + "avatar.jpg";
const cleanMessageText = (value) => {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
};

const cleanBotText = (value, fallback) => {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text || fallback;
};

const AvatarImg = ({ size, ring = true }) => {
  const [err, setErr] = useState(false);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", border: ring ? `2px solid ${GOLD}` : "none", overflow: "hidden", flexShrink: 0, background: "#1c1208", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!err
        ? <img src={AVATAR_SRC} onError={() => setErr(true)} alt="Gaspard NZ" width={size} height={size} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
        : <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: `${Math.round(size * 0.3)}px`, color: GOLD, letterSpacing: "0.05em" }}>GNZ</span>
      }
    </div>
  );
};

const ChatBot = ({ onReserver, onGalerie, onShowroom, onFormules }) => {
  const t = useTr();
  const { lang } = useContext(LangCtx);
  const settings = useSettings();
  const labels = getChatLabels(lang);
  const fallback = getFallbackReply(lang);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const fabDragging = useRef(false);
  const [showBubble, setShowBubble] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && !greeted) {
      setGreeted(true);
      setTimeout(() => {
        const greet = getGreeting(lang);
        setMsgs([{ from: "bot", text: greet.rep, btns: greet.btns, id: Date.now() }]);
      }, 400);
    }
  }, [open, greeted, lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    const t = setTimeout(() => { if (!open) { setShowBubble(true); setTimeout(() => setShowBubble(false), 7000); } }, 10000);
    return () => clearTimeout(t);
  }, []);

  const handleAction = (btn) => {
    const text = cleanMessageText(btn);
    if (!text) return;
    addUserMsg(text);
    triggerReply(text);
  };

  const addUserMsg = (text) => {
    const safeText = cleanMessageText(text);
    if (!safeText) return;
    setMsgs(m => [...m, { from: "user", text: safeText, id: `${Date.now()}-${m.length}` }]);
  };

  const triggerReply = (text) => {
    const safeText = cleanMessageText(text);
    if (!safeText) return;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const low = safeText.toLowerCase();
      const entry = findReply(safeText, lang);
      if (safeText === labels.booking || low.includes("rendez-vous") || low.includes("appointment") || low.includes("cita") || low.includes("预约") || low.includes("réserver")) {
        setMsgs(m => [...m, { from: "bot", text: cleanBotText(entry.rep, fallback.rep), btns: entry.btns || [], action: "booking", id: `${Date.now()}-${m.length}` }]);
      } else if (safeText === labels.gallery || low.includes("galerie") || low.includes("gallery") || low.includes("galería") || low.includes("画廊")) {
        const goGallery = { FR: "Je vous emmène dans la galerie.", EN: "Taking you to the gallery.", ES: "Te llevo a la galería.", ZH: "正在带你前往画廊。" };
        setMsgs(m => [...m, { from: "bot", text: goGallery[lang] || goGallery.FR, btns: [], id: `${Date.now()}-${m.length}` }]);
        setTimeout(() => { setOpen(false); onGalerie?.(); }, 600);
      } else if (safeText === labels.showroom || low.includes("showroom") || low.includes("展厅")) {
        const goShowroom = { FR: "Je vous emmène au showroom.", EN: "Taking you to the showroom.", ES: "Te llevo al showroom.", ZH: "正在带你前往展厅。" };
        setMsgs(m => [...m, { from: "bot", text: goShowroom[lang] || goShowroom.FR, btns: [], id: `${Date.now()}-${m.length}` }]);
        setTimeout(() => { setOpen(false); onShowroom?.(); }, 600);
      } else if (safeText === labels.packages || low.includes("formule") || low.includes("package") || low.includes("paquete") || low.includes("套餐")) {
        const goPackages = { FR: "Je vous emmène vers les formules.", EN: "Taking you to the packages.", ES: "Te llevo a los paquetes.", ZH: "正在带你前往套餐。" };
        setMsgs(m => [...m, { from: "bot", text: goPackages[lang] || goPackages.FR, btns: [], id: `${Date.now()}-${m.length}` }]);
        setTimeout(() => { setOpen(false); onFormules?.(); }, 600);
      } else if (safeText === labels.whatsapp) {
        window.open(getWhatsappUrl(settings.whatsappNumber), "_blank");
        const goWA = { FR: "Je vous redirige vers WhatsApp. Gaspard vous répondra sous 24h.", EN: "Redirecting you to WhatsApp. Gaspard replies within 24h.", ES: "Te redirijo a WhatsApp. Gaspard responde en 24h.", ZH: "正在打开 WhatsApp。Gaspard 会在24小时内回复。" };
        setMsgs(m => [...m, { from: "bot", text: goWA[lang] || goWA.FR, btns: [], id: `${Date.now()}-${m.length}` }]);
      } else {
        setMsgs(m => [...m, { from: "bot", text: cleanBotText(entry.rep, fallback.rep), btns: entry.btns || [], id: `${Date.now()}-${m.length}` }]);
      }
    }, 900 + Math.random() * 400);
  };

  const handleSend = () => {
    const txt = input.trim();
    if (!txt) return;
    setInput("");
    addUserMsg(txt);
    triggerReply(txt);
  };

  const formatText = (txt) => {
    return cleanBotText(txt, fallback.rep).split("\n").map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} style={{ margin: "0.15rem 0" }}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**")
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    });
  };

  return (
    <>
      <motion.button
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ top: -700, bottom: 0, left: -350, right: 0 }}
        onDragStart={() => { fabDragging.current = true; }}
        onDragEnd={() => { setTimeout(() => { fabDragging.current = false; }, 80); }}
        onClick={() => { if (fabDragging.current) return; setOpen(o => !o); setShowBubble(false); }}
        aria-label={open ? "Fermer l'assistant Gaspard NZ" : "Ouvrir l'assistant Gaspard NZ"}
        whileTap={{ scale: 0.93 }}
        style={{ position: "fixed", bottom: "1.5rem", right: "1.2rem", zIndex: 600, width: "56px", height: "56px", borderRadius: "50%", background: open ? GOLD : "transparent", border: open ? "none" : `2px solid ${GOLD}`, padding: 0, cursor: "grab", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 24px rgba(184,151,62,0.45)", overflow: "hidden", touchAction: "none" }}>
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} style={{ color: "#1c1208", fontSize: "22px", fontWeight: 300, lineHeight: 1 }}>×</motion.span>
            : <motion.div key="av" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} style={{ width: "100%", height: "100%" }}><AvatarImg size={52} ring={false} /></motion.div>
          }
        </AnimatePresence>
        {!open && <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 3 }} style={{ position: "absolute", top: "3px", right: "3px", width: "11px", height: "11px", borderRadius: "50%", background: "#25D366", border: "2px solid #fff", zIndex: 1 }} />}
      </motion.button>

      <AnimatePresence>
        {showBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => { setShowBubble(false); setOpen(true); }}
            style={{ position: "fixed", bottom: "5.2rem", right: "1.2rem", background: "transparent", padding: "0.5rem 1rem 0.5rem 0", maxWidth: "200px", cursor: "pointer", zIndex: 598, textAlign: "right" }}
          >
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.92rem", color: GOLD, lineHeight: 1.45, margin: 0, textShadow: "0 1px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)" }}>{t("chatbot_bubble")}</p>
            <button aria-label="Masquer le message de l'assistant" onClick={e => { e.stopPropagation(); setShowBubble(false); }} style={{ position: "absolute", top: "0", right: "0", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.82)", fontSize: "0.75rem", lineHeight: 1, width: "44px", height: "44px" }}>✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            drag dragMomentum={false} dragElastic={0.05} dragConstraints={{ top: -500, bottom: 50, left: -300, right: 50 }}
            style={{ position: "fixed", bottom: "5.5rem", right: "1.2rem", left: "1.2rem", maxWidth: "380px", cursor: "grab", marginLeft: "auto", zIndex: 599, background: "#faf7f2", borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", height: "70vh", maxHeight: "520px" }}>

            <div style={{ background: "#1c1208", padding: "0.85rem 1.2rem", display: "flex", alignItems: "center", gap: "0.85rem", flexShrink: 0 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <AvatarImg size={44} ring={true} />
                <span style={{ position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", borderRadius: "50%", background: "#25D366", border: "2px solid #1c1208", display: "block" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: CREAM, letterSpacing: "0.12em", margin: 0, lineHeight: 1.2 }}>GASPARD NZ</p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7.5px", color: "rgba(245,240,232,0.55)", letterSpacing: "0.2em", textTransform: "uppercase", margin: "3px 0 0" }}>{t("chatbot_status")}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#25D366" }} />
              </div>
              <button aria-label="Fermer l'assistant" onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.82)", fontSize: "1.1rem", padding: 0, lineHeight: 1, width: "44px", height: "44px" }}>✕</button>
            </div>

            <AnimatePresence>
              {showAvatar && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ position: "absolute", top: "73px", left: 0, right: 0, bottom: 0, background: "#0d0b08", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, borderBottomLeftRadius: "16px", borderBottomRightRadius: "16px" }}
                >
                  <style>{`
                    @keyframes gnzWalk {
                      0%   { transform: translateY(0px)  translateX(0px)  rotate(0deg)   scale(1);    }
                      20%  { transform: translateY(-7px) translateX(-4px) rotate(-1.5deg) scale(1.02); }
                      40%  { transform: translateY(1px)  translateX(-2px) rotate(-0.5deg) scale(0.99); }
                      60%  { transform: translateY(-7px) translateX(4px)  rotate(1.5deg)  scale(1.02); }
                      80%  { transform: translateY(1px)  translateX(2px)  rotate(0.5deg)  scale(0.99); }
                      100% { transform: translateY(0px)  translateX(0px)  rotate(0deg)   scale(1);    }
                    }
                    @keyframes gnzGlow { 0%,100%{box-shadow:0 0 0 0 rgba(184,151,62,0.0),0 0 25px rgba(184,151,62,0.12)} 50%{box-shadow:0 0 0 8px rgba(184,151,62,0.08),0 0 50px rgba(184,151,62,0.3)} }
                    @keyframes gnzShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
                  `}</style>
                  <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${GOLD}`, animation: "gnzWalk 0.85s ease-in-out infinite, gnzGlow 2.5s ease-in-out infinite", marginBottom: "1.4rem" }}>
                    <img src={AVATAR_SRC} alt="Gaspard NZ" width="150" height="150" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                  </div>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.4rem", letterSpacing: "0.2em", margin: 0, background: "linear-gradient(90deg, #9a7a2e 0%, #d4ae5a 25%, #f5e070 50%, #d4ae5a 75%, #9a7a2e 100%)", backgroundSize: "250% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "gnzShimmer 2.5s linear infinite" }}>GASPARD NZ</p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.4em", color: "rgba(184,151,62,0.55)", textTransform: "uppercase", marginTop: "8px" }}>{t("chatbot_role")}</p>
                  <button onClick={() => setShowAvatar(false)} style={{ position: "absolute", bottom: "1.2rem", background: "none", border: "1px solid rgba(184,151,62,0.45)", color: "rgba(245,240,232,0.78)", fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.35em", textTransform: "uppercase", padding: "0.7rem 1.1rem", minHeight: "44px", cursor: "pointer", borderRadius: "2px" }}>{t("chatbot_skip")}</button>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {msgs.map(m => (
                <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "user" ? "flex-end" : "flex-start", gap: "0.4rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", flexDirection: m.from === "user" ? "row-reverse" : "row" }}>
                    {m.from === "bot" && <AvatarImg size={24} ring={true} />}
                    <div style={{ maxWidth: "80%", background: m.from === "user" ? GOLD : "#fff", color: m.from === "user" ? "#1c1208" : TEXT, padding: "0.7rem 0.9rem", borderRadius: m.from === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", fontFamily: "'Montserrat', sans-serif", fontSize: "11px", lineHeight: 1.7, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                      {formatText(m.text)}
                    </div>
                  </div>
                  {m.btns && m.btns.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", maxWidth: "100%" }}>
                      {m.btns.map((btn, bi) => (
                        <button key={bi} onClick={() => {
                          if (btn === labels.booking) { setOpen(false); onReserver?.(); }
                          else if (btn === labels.gallery || btn === labels.details) { setOpen(false); onGalerie?.(); }
                          else if (btn === labels.showroom) { setOpen(false); onShowroom?.(); }
                          else if (btn === labels.whatsapp) { window.open(getWhatsappUrl(settings.whatsappNumber), "_blank"); }
                          else if (btn === "Instagram") { window.open(settings.instagramUrl || SOCIAL_LINKS.instagram, "_blank"); }
                          else if (btn === "TikTok") { window.open(SOCIAL_LINKS.tiktok, "_blank"); }
                          else if (btn === "Facebook") { window.open(SOCIAL_LINKS.facebook, "_blank"); }
                          else if (btn === "YouTube") { window.open(SOCIAL_LINKS.youtube, "_blank"); }
                          else handleAction(btn);
                        }}
                          style={{ background: "none", border: `1px solid rgba(184,151,62,0.5)`, color: GOLD, padding: "0.65rem 0.85rem", minHeight: "44px", fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.15em", cursor: "pointer", borderRadius: "20px", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                          {btn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {typing && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: "6px" }}>
                  <AvatarImg size={24} ring={true} />
                  <div style={{ background: "#fff", padding: "0.7rem 1rem", borderRadius: "12px 12px 12px 2px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", gap: "4px", alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                        style={{ width: "5px", height: "5px", borderRadius: "50%", background: GOLD }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: "0.8rem", borderTop: "1px solid rgba(184,151,62,0.1)", display: "flex", gap: "0.5rem", flexShrink: 0, background: "#faf7f2" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder={t("chatbot_placeholder")}
                style={{ flex: 1, background: "#fff", border: "1px solid rgba(184,151,62,0.2)", padding: "0.6rem 0.9rem", fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: TEXT, outline: "none", borderRadius: "20px" }}
              />
              <button onClick={handleSend}
                aria-label="Envoyer le message"
                disabled={!input.trim()}
                style={{ width: "44px", height: "44px", borderRadius: "50%", background: GOLD, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1c1208"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
