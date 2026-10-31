import { useState } from "react";
import { askAdminAssistant } from "../../services/adminAssistant.js";

const QUICK_QUESTIONS = ["Que dois-je traiter en priorité ?", "Explique-moi l’activité récente.", "Quels prospects dois-je relancer ?"];

export default function AdminAssistant({ currentSection }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (value = question) => {
    const text = String(value || "").trim();
    if (!text || loading) return;
    setQuestion("");
    setMessages((items) => [...items, { role: "user", text }]);
    setLoading(true);
    try {
      const result = await askAdminAssistant(text, { section: currentSection, previousMessages: messages.slice(-6) });
      setMessages((items) => [...items, { role: "assistant", text: result.answer }]);
    } catch (error) {
      setMessages((items) => [...items, { role: "error", text: error?.message || "Assistant indisponible." }]);
    } finally { setLoading(false); }
  };

  return <>
    <button type="button" aria-label="Ouvrir l’Assistant GaspardNZ" onClick={() => setOpen(true)} style={{ position: "fixed", right: 22, bottom: 22, zIndex: 45, border: "1px solid rgba(214,175,77,.6)", borderRadius: 999, padding: "12px 18px", background: "linear-gradient(135deg,#d6af4d,#9b7625)", color: "#160f05", fontWeight: 700, boxShadow: "0 12px 35px rgba(0,0,0,.35)", cursor: "pointer" }}>✦ Assistant GaspardNZ</button>
    {open && <div role="dialog" aria-modal="true" aria-label="Assistant GaspardNZ" style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.62)", display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 22 }} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section style={{ width: "min(520px, 100%)", maxHeight: "min(720px, 92vh)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid rgba(214,175,77,.42)", borderRadius: 18, background: "#17120d", color: "#f5f0e8", boxShadow: "0 24px 80px rgba(0,0,0,.5)" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,.1)" }}><div><strong style={{ display: "block", fontSize: 18 }}>Assistant GaspardNZ</strong><span style={{ color: "#bdb3a6", fontSize: 12 }}>Votre copilote pour le site et l’administration</span></div><button type="button" onClick={() => setOpen(false)} aria-label="Fermer l’assistant" style={{ background: "transparent", border: 0, color: "#f5f0e8", fontSize: 24, cursor: "pointer" }}>×</button></header>
        <div style={{ padding: 16, overflowY: "auto", display: "grid", gap: 10, minHeight: 190 }}>
          {!messages.length && <><p style={{ margin: 0, color: "#d8cec0", lineHeight: 1.5 }}>Posez-moi une question sur vos prospects, réservations, emails, statistiques, contenus ou le fonctionnement du site.</p><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{QUICK_QUESTIONS.map((item) => <button type="button" key={item} onClick={() => ask(item)} style={{ border: "1px solid rgba(214,175,77,.45)", background: "rgba(214,175,77,.08)", color: "#f5f0e8", borderRadius: 999, padding: "8px 10px", cursor: "pointer", fontSize: 12 }}>{item}</button>)}</div></>}
          {messages.map((message, index) => <div key={`${message.role}-${index}`} style={{ justifySelf: message.role === "user" ? "end" : "start", maxWidth: "92%", whiteSpace: "pre-wrap", lineHeight: 1.5, padding: "10px 12px", borderRadius: 12, background: message.role === "user" ? "#d6af4d" : message.role === "error" ? "rgba(176,64,64,.25)" : "rgba(255,255,255,.08)", color: message.role === "user" ? "#160f05" : "#f5f0e8" }}>{message.text}</div>)}
          {loading && <div style={{ color: "#bdb3a6", fontSize: 13 }}>Je consulte les données autorisées…</div>}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); ask(); }} style={{ display: "flex", gap: 8, padding: 14, borderTop: "1px solid rgba(255,255,255,.1)" }}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Posez votre question…" aria-label="Question à l’assistant" style={{ flex: 1, minWidth: 0, border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, padding: "12px", background: "rgba(255,255,255,.06)", color: "#fff" }} /><button type="submit" disabled={loading || !question.trim()} style={{ border: 0, borderRadius: 10, padding: "0 15px", background: "#d6af4d", color: "#160f05", fontWeight: 700, cursor: "pointer" }}>Envoyer</button></form>
      </section>
    </div>}
  </>;
}
