import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { GOLD } from "../../constants.js";

const VIPClientsSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const [cur, setCur] = useState(0);
  const [vw, setVw] = useState(() => typeof window !== "undefined" ? window.innerWidth / 100 : 3.9);
  const curRef = useRef(0);
  useEffect(() => { curRef.current = cur; });
  const clients = [
    { initials: "R.B", name: "Rodrin Bakala Mouengue", city: "Paris", event: "Mariage · 1er client", gradient: "linear-gradient(135deg,#1e3a5f,#2d6a9f)", photo: "/rodrin-bakala.jpg.JPG" },
    { initials: "C.M", name: "Cédric M.", city: "Monaco", event: "Gala de prestige", gradient: "linear-gradient(135deg,#4a1942,#8b2fc9)" },
    { initials: "Y.B", name: "Yannick B.", city: "Lyon", event: "Soirée VIP", gradient: "linear-gradient(135deg,#1a3a1a,#2d6b2d)" },
    { initials: "A.N", name: "Alexis N.", city: "Dubaï", event: "Business meeting", gradient: "linear-gradient(135deg,#3d1a00,#8b3d00)" },
    { initials: "D.K", name: "Diarietou K.", city: "Abidjan", event: "Cérémonie", gradient: "linear-gradient(135deg,#1a1a3d,#3d3d8b)" },
    { initials: "T.R", name: "Théo R.", city: "Paris", event: "Shooting pro", gradient: "linear-gradient(135deg,#3d001a,#8b0030)" },
  ];
  const CARD_W = 68;
  const getX = (idx) => ((100 - CARD_W) / 2 - idx * CARD_W) * vw;
  const x = useMotionValue(getX(0));
  const snapTo = (idx) => {
    setCur(idx);
    curRef.current = idx;
    animate(x, getX(idx), { type: "spring", stiffness: 380, damping: 38 });
  };
  useEffect(() => {
    const update = () => setVw(window.innerWidth / 100);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useEffect(() => {
    x.set(((100 - CARD_W) / 2 - curRef.current * CARD_W) * vw);
  }, [vw]);
  return (
    <section ref={ref} style={{ background: "#0a0602", padding: "4.5rem 0 5rem", overflow: "hidden" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", marginBottom: "2.4rem", padding: "0 1.4rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "7px", letterSpacing: "0.55em", color: GOLD, textTransform: "uppercase", marginBottom: "10px" }}>GALERIE EXCLUSIVE</p>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", fontWeight: 300, color: "#faf7f2", letterSpacing: "0.02em", lineHeight: 1.2 }}>Ils ont fait confiance<br/>à Gaspardnz</p>
      </motion.div>

      <div style={{ position: "relative", overflow: "hidden", cursor: "grab" }}>
        <motion.div
          drag="x"
          dragMomentum={false}
          dragElastic={0}
          dragConstraints={{ left: getX(clients.length - 1), right: getX(0) }}
          onDragEnd={(_, { offset, velocity }) => {
            const cw = CARD_W * vw;
            if (offset.x < -cw * 0.2 || velocity.x < -300) snapTo(Math.min(curRef.current + 1, clients.length - 1));
            else if (offset.x > cw * 0.2 || velocity.x > 300) snapTo(Math.max(curRef.current - 1, 0));
            else snapTo(curRef.current);
          }}
          style={{ x, display: "flex", alignItems: "center" }}>
          {clients.map((c, i) => {
            const isActive = i === cur;
            const dist = Math.abs(i - cur);
            return (
              <motion.div key={i}
                onClick={() => snapTo(i)}
                animate={{ scale: isActive ? 1 : 0.80, opacity: dist === 0 ? 1 : dist === 1 ? 0.55 : 0.3 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                style={{ flexShrink: 0, width: `${CARD_W}vw`, paddingLeft: "6px", paddingRight: "6px", cursor: isActive ? "grab" : "pointer", transformOrigin: "center center" }}>
                <div style={{ borderRadius: "16px", background: c.gradient, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: isActive ? `1px solid rgba(184,151,62,0.5)` : "1px solid rgba(184,151,62,0.15)", position: "relative", overflow: "hidden", aspectRatio: "3/4", boxShadow: isActive ? "0 20px 60px rgba(0,0,0,0.7)" : "none", transition: "border 0.4s, box-shadow 0.4s" }}>
                  {c.photo
                    ? <img src={c.photo} alt={c.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                    : <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(184,151,62,0.15), transparent 70%)" }} />
                  }
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.85) 100%)" }} />
                  {!c.photo && (
                    <div style={{ width: "68px", height: "68px", borderRadius: "50%", border: `1.5px solid ${isActive ? GOLD : "rgba(184,151,62,0.35)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px", background: "rgba(0,0,0,0.3)", transition: "border 0.4s", position: "relative", zIndex: 1 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 500, color: GOLD }}>{c.initials}</span>
                    </div>
                  )}
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", letterSpacing: "0.15em", color: isActive ? "rgba(250,247,242,0.7)" : "rgba(250,247,242,0.4)", textTransform: "uppercase", transition: "color 0.4s", position: "absolute", bottom: "12px", zIndex: 1 }}>{c.event}</p>
                </div>
                <motion.div animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 6 }} transition={{ duration: 0.35 }}
                  style={{ paddingTop: "12px", paddingLeft: "4px" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "17px", fontWeight: 400, color: "#faf7f2", marginBottom: "3px" }}>{c.name}</p>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(250,247,242,0.4)", letterSpacing: "0.05em" }}>{c.city}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "7px", marginTop: "1.6rem" }}>
        {clients.map((_, i) => (
          <button key={i} onClick={() => snapTo(i)}
            style={{ width: i === cur ? "22px" : "6px", height: "6px", borderRadius: "3px", background: i === cur ? GOLD : "rgba(184,151,62,0.25)", border: "none", cursor: "pointer", transition: "all 0.35s", padding: 0 }} />
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.7 }}
        style={{ textAlign: "center", marginTop: "2.4rem", padding: "0 1.4rem" }}>
        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", color: "rgba(250,247,242,0.3)", letterSpacing: "0.08em" }}>Vous souhaitez apparaître dans cette galerie ?</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => window.open(`https://wa.me/33664826920?text=${encodeURIComponent("Bonjour Gaspard, je souhaite être habillé(e) par vous et apparaître dans votre galerie VIP.")}`, "_blank")}
          style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9.5px", letterSpacing: "0.2em", color: GOLD, textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", borderBottom: `1px solid rgba(184,151,62,0.4)`, paddingBottom: "2px", marginTop: "8px" }}>
          Contactez Gaspardnz
        </motion.button>
      </motion.div>
    </section>
  );
};

export default VIPClientsSection;
