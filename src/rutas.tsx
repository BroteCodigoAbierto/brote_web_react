import { createBrowserRouter } from "react-router";
import Layout from "./componentes/Layout/Layout.tsx";
import Inicio from "./paginas/Inicio/Inicio.tsx";
import NoEncontrada from "./paginas/NoEncontrada/NoEncontrada.tsx";

// Mapa de rutas de la web. Debe coincidir con brote_specs/specs/01-navegacion.md.
export const enrutador = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Inicio /> },
      { path: "*", element: <NoEncontrada /> },
    ],
  },
]);
