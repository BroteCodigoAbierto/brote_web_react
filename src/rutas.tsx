import { createBrowserRouter } from "react-router";
import Layout from "./componentes/Layout/Layout.tsx";
import RutaProtegida from "./componentes/RutaProtegida/RutaProtegida.tsx";
import SoloSinSesion from "./componentes/SoloSinSesion/SoloSinSesion.tsx";
import ZonaConSesion from "./componentes/ZonaConSesion/ZonaConSesion.tsx";
import Catalogo from "./paginas/Catalogo/Catalogo.tsx";
import DetalleCurso from "./paginas/DetalleCurso/DetalleCurso.tsx";
import Entrar from "./paginas/Entrar/Entrar.tsx";
import Estudio from "./paginas/Estudio/Estudio.tsx";
import Leccion from "./paginas/Leccion/Leccion.tsx";
import LienzoLeccion from "./paginas/LienzoLeccion/LienzoLeccion.tsx";
import MapaCurso from "./paginas/MapaCurso/MapaCurso.tsx";
import NoEncontrada from "./paginas/NoEncontrada/NoEncontrada.tsx";
import NuevoCurso from "./paginas/NuevoCurso/NuevoCurso.tsx";
import Panel from "./paginas/Panel/Panel.tsx";
import PerfilAutor from "./paginas/PerfilAutor/PerfilAutor.tsx";
import ProbarLeccionRevision from "./paginas/ProbarLeccionRevision/ProbarLeccionRevision.tsx";
import Registro from "./paginas/Registro/Registro.tsx";
import RevisarCurso from "./paginas/RevisarCurso/RevisarCurso.tsx";

// Mapa de rutas de la web (brote_specs/specs/01-navegacion.md y decisión 0020).
// Explorar cursos, perfiles de autor, espacios públicos y probar la primera lección
// están abiertos sin iniciar sesión; Mi aprendizaje, Estudio, Editor y Moderación
// requieren sesión mediante RutaProtegida.
export const enrutador = createBrowserRouter([
  {
    element: <SoloSinSesion />,
    children: [
      { path: "/entrar", element: <Entrar /> },
      { path: "/registro", element: <Registro /> },
    ],
  },
  {
    element: <ZonaConSesion />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Catalogo /> },
          { path: "/o/:slug", element: <Catalogo /> },
          { path: "/cursos/enlace/:clave", element: <DetalleCurso /> },
          { path: "/cursos/:idCurso", element: <DetalleCurso /> },
          { path: "/autores/:idAutor", element: <PerfilAutor /> },
          {
            element: <RutaProtegida />,
            children: [
              { path: "/panel", element: <Panel /> },
              { path: "/estudio", element: <Estudio /> },
              { path: "/editor/nuevo", element: <NuevoCurso /> },
              { path: "/editor/:idCurso", element: <MapaCurso /> },
              { path: "/moderacion/:idCurso", element: <RevisarCurso /> },
            ],
          },
          { path: "*", element: <NoEncontrada /> },
        ],
      },
      { path: "/cursos/:idCurso/lecciones/:idLeccion", element: <Leccion /> },
      {
        element: <RutaProtegida />,
        children: [
          { path: "/editor/:idCurso/lecciones/:idLeccion", element: <LienzoLeccion /> },
          { path: "/moderacion/:idCurso/lecciones/:idLeccion", element: <ProbarLeccionRevision /> },
        ],
      },
    ],
  },
]);
