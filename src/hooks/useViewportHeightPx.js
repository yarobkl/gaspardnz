import { useEffect, useState } from "react";

// window.innerHeight, mesuré en JS : contrairement aux unités dvh/svh, il est
// supporté par tous les navigateurs y compris les webviews intégrées les
// plus anciennes (TikTok, Instagram...), qui les calculent parfois mal sur
// une section plein écran.
const measure = () => (typeof window !== "undefined" ? window.innerHeight : 0);

export default function useViewportHeightPx() {
  const [height, setHeight] = useState(measure);

  useEffect(() => {
    const update = () => setHeight(measure());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return height;
}
