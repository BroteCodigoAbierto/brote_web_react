import { createBrowserRouter } from "react-router";
import Layout from "./componentes/Layout/Layout.tsx";
import RutaProtegida from "./componentes/RutaProtegida/RutaProtegida.tsx";
import SoloSinSesion from "./componentes/SoloSinSesion/SoloSinSesion.tsx";
import ZonaConSesion from "./componentes/ZonaConSesion/ZonaConSesion.tsx";
import Catalogo from "./paginas/Catalogo/Catalogo.tsx";
import DetalleCurso from "./paginas/DetalleCurso/DetalleCurso.tsx";
import Entrar from "./paginas/Entrar/Entrar.tsx";
import Leccion from "./paginas/Leccion/Leccion.tsx";
import NoEncontrada from "./paginas/NoEncontrada/NoEncontrada.tsx";
import Registro from "./paginas/Registro/Registro.tsx";

// Mapa de rutas de la web. Debe coincidir con brote_specs/specs/01-navegacion.md.
// Sin sesión solo existen /entrar y /registro; todo lo demás (incluidas las
// direcciones que no existen) pasa por RutaProtegida. El catálogo es el inicio
// (F02); su estado vive en ZonaConSesion, de la que cuelgan el Layout (catálogo
// y detalle) y la lección, que va a pantalla completa fuera del Layout (F03).
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
        element: <ZonaConSesion />,
        children: [
          {
            element: <Layout />,
            children: [
              { path: "/", element: <Catalogo /> },
              { path: "/cursos/:idCurso", element: <DetalleCurso /> },
              { path: "*", element: <NoEncontrada /> },
            ],
          },
          { path: "/cursos/:idCurso/lecciones/:idLeccion", element: <Leccion /> },
        ],
      },
    ],
  },
]);
