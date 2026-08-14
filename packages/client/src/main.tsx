import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import { mountRoot } from "./shell.ts";

createRoot(mountRoot()).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
