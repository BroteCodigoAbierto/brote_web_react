import TemaProvider from "./contextos/TemaProvider.tsx";
import { aplicarTema, leerTema } from "./servicios/almacenTema.ts";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import SesionProvider from "./contextos/SesionProvider.tsx";
import { enrutador } from "./rutas.tsx";
import "./estilos/global.css";

aplicarTema(leerTema());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TemaProvider>
      <SesionProvider>
        <RouterProvider router={enrutador} />
      </SesionProvider>
    </TemaProvider>
  </StrictMode>,
);
