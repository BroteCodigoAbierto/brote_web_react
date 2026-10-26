import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import SesionProvider from "./contextos/SesionProvider.tsx";
import { enrutador } from "./rutas.tsx";
import "./estilos/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SesionProvider>
      <RouterProvider router={enrutador} />
    </SesionProvider>
  </StrictMode>,
);
