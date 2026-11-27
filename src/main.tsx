import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import AspectoProvider from "./contextos/AspectoProvider.tsx";
import EspacioProvider from "./contextos/EspacioProvider.tsx";
import SesionProvider from "./contextos/SesionProvider.tsx";
import { enrutador } from "./rutas.tsx";
import "./estilos/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AspectoProvider>
      <SesionProvider>
        <EspacioProvider>
          <RouterProvider router={enrutador} />
        </EspacioProvider>
      </SesionProvider>
    </AspectoProvider>
  </StrictMode>,
);
