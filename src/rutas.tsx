import { createBrowserRouter } from "react-router";
import Layout from "./componentes/Layout/Layout.tsx";
import RutaProtegida from "./componentes/RutaProtegida/RutaProtegida.tsx";
import SoloSinSesion from "./componentes/SoloSinSesion/SoloSinSesion.tsx";
import Entrar from "./paginas/Entrar/Entrar.tsx";
import Inicio from "./paginas/Inicio/Inicio.tsx";
import NoEncontrada from "./paginas/NoEncontrada/NoEncontrada.tsx";
import Registro from "./paginas/Registro/Registro.tsx";

// Mapa de rutas de la web. Debe coincidir con brote_specs/specs/01-navegacion.md.
// Sin sesión solo existen /entrar y /registro; todo lo demás (incluidas las
// direcciones que no existen) pasa por RutaProtegida.
export const enrutador = createBrowserRouter([
  {
    element: <SoloSinSesion />,
    children: [
      { path: "/entrar", element: <Entrar /> },
      { path: "/registro", element: <Registro /> },
    ],
  },
  {
    element: <RutaProtegida />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Inicio /> },
          { path: "*", element: <NoEncontrada /> },
        ],
      },
    ],
  },
]);
