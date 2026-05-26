import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { registerAppServiceWorker } from "./serviceWorkerRegistration";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  registerAppServiceWorker(import.meta.env.BASE_URL);
}
