import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.tsx";

import { AuthProvider } from "./context/AuthContext";
import { PreparationProvider } from "./context/PreparationContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PreparationProvider>
          <App />
        </PreparationProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

