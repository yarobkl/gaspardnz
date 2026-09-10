import { AnimatePresence, motion } from "framer-motion";
import { GOLD } from "../../constants.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const asPercent = (value, fallback = 50) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const POSITION_OFFSETS = [
  [0, 0],
  [4.5, 0],
  [-4.5, 0],
  [0, 4.5],
  [0, -4.5],
  [4.5, 4.5],
  [-4.5, 4.5],
  [4.5, -4.5],
  [-4.5, -4.5],
  [8.5, 0],
  [-8.5, 0],
  [0, 8.5],
  [0, -8.5],
  [8.5, 4.5],
  [-8.5, 4.5],
  [8.5, -4.5],
  [-8.5, -4.5],
];

/**
 * Keeps visual hotspot controls inside the photo and gently separates
 * controls that would otherwise sit on top of each other. The original
 * coordinates are never mutated; only the rendered position is adjusted.
 */
export const layoutHotspots = (spots = []) => {
  const placed = [];
  const minDistance = 8;

  return spots.map((spot) => {
    const baseX = clamp(asPercent(spot.x ?? spot.left), 8, 92);
    const baseY = clamp(asPercent(spot.y ?? spot.top), 8, 92);
    let chosen = { x: baseX, y: baseY };

    for (const [dx, dy] of POSITION_OFFSETS) {
      const candidate = {
        x: clamp(baseX + dx, 8, 92),
        y: clamp(baseY + dy, 8, 92),
      };
      const clear = placed.every((other) => {
        const distance = Math.hypot(candidate.x - other.x, candidate.y - other.y);
        return distance >= minDistance;
      });
      if (clear) {
        chosen = candidate;
        break;
      }
    }

    placed.push(chosen);
    return { ...spot, __renderX: chosen.x, __renderY: chosen.y };
  });
};

export function PhotoHotspots({ spots = [], activeIndex = -1, onSelect }) {
  return layoutHotspots(spots).map((spot, index) => {
    const active = index === activeIndex;
    return (
      <button
        key={`${spot.label || "hotspot"}-${index}`}
        type="button"
        aria-label={spot.label || `Détail ${index + 1}`}
        aria-pressed={active}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.(index, spot);
        }}
        style={{
          position: "absolute",
          left: `${spot.__renderX}%`,
          top: `${spot.__renderY}%`,
          transform: "translate(-50%,-50%)",
          width: 44,
          height: 44,
          border: 0,
          borderRadius: "50%",
          padding: 0,
          margin: 0,
          background: "transparent",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          zIndex: active ? 6 : 4,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: active ? 14 : 12,
            height: active ? 14 : 12,
            borderRadius: "50%",
            background: active ? "rgba(184,151,62,.28)" : "rgba(10,7,3,.55)",
            border: `1px solid ${GOLD}`,
            boxShadow: active
              ? "0 0 0 5px rgba(184,151,62,.16), 0 2px 10px rgba(0,0,0,.28)"
              : "0 0 0 3px rgba(184,151,62,.08), 0 2px 8px rgba(0,0,0,.22)",
            display: "grid",
            placeItems: "center",
            transition: "width .18s ease, height .18s ease, box-shadow .18s ease, background .18s ease",
          }}
        >
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD }} />
        </span>
      </button>
    );
  });
}

export function HotspotSheet({ spot, onClose, eyebrow = "Détail du look", actionLabel, onAction }) {
  return (
    <AnimatePresence>
      {spot && (
        <>
          <motion.button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 880,
              border: 0,
              background: "rgba(5,3,1,.56)",
              backdropFilter: "blur(2px)",
            }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={spot.label || eyebrow}
            initial={{ y: "100%", opacity: 0.96 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.96 }}
            transition={{ type: "spring", damping: 31, stiffness: 340 }}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 881,
              width: "100%",
              maxWidth: 560,
              maxHeight: "48vh",
              overflowY: "auto",
              margin: "0 auto",
              boxSizing: "border-box",
              background: "#faf7f2",
              borderRadius: "20px 20px 0 0",
              padding: "1rem 1.2rem calc(1.2rem + env(safe-area-inset-bottom))",
              boxShadow: "0 -18px 54px rgba(0,0,0,.22)",
            }}
          >
            <div style={{ width: 36, height: 3, borderRadius: 999, background: "rgba(28,18,8,.15)", margin: "0 auto .9rem" }} />
            <p style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 9, letterSpacing: ".28em", color: GOLD, textTransform: "uppercase", margin: "0 0 .45rem" }}>
              {eyebrow}
            </p>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.32rem", lineHeight: 1.2, color: "#1c1208", margin: "0 0 .45rem" }}>
              {spot.label}
            </h3>
            {spot.detail && (
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: ".98rem", lineHeight: 1.55, color: "rgba(28,18,8,.72)", margin: "0 0 .95rem" }}>
                {spot.detail}
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: onAction ? "1fr 48px" : "1fr", gap: 8 }}>
              {onAction && (
                <button
                  type="button"
                  onClick={onAction}
                  style={{
                    minHeight: 48,
                    border: 0,
                    borderRadius: 10,
                    background: GOLD,
                    color: "#1c1208",
                    fontFamily: "'Montserrat',sans-serif",
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    padding: "0 .9rem",
                  }}
                >
                  {actionLabel || "Demander à Gaspard"}
                </button>
              )}
              <button
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                style={{
                  width: onAction ? 48 : "100%",
                  minHeight: 48,
                  border: "1px solid rgba(28,18,8,.12)",
                  borderRadius: 10,
                  background: "transparent",
                  color: "#1c1208",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
