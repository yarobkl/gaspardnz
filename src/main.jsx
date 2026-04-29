import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../gaspardnz-mobile 60.jsx";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(import.meta.env.BASE_URL + "sw.js").catch(() => {});
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
