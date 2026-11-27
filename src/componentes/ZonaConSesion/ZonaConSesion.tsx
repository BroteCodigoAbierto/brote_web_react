import { Outlet, ScrollRestoration } from "react-router";
import CatalogoProvider from "../../contextos/CatalogoProvider.tsx";
import { useSesion } from "../../hooks/useSesion.ts";
import PantallaCarga from "../PantallaCarga/PantallaCarga.tsx";
import PantallaSinServidor from "../PantallaSinServidor/PantallaSinServidor.tsx";

// Zona principal explorable (con o sin sesión, decisión 0020). El catálogo vive
// aquí, y no en el Layout ni en su página, para que siga cargado al ir al
// detalle de un curso y a una de sus lecciones (que va a pantalla completa,
// fuera del Layout) y volver; ScrollRestoration devuelve la lista a donde se
// dejó (brote_specs, research de F03, punto 8).
export default function ZonaConSesion() {
  const { estado } = useSesion();

  if (estado === "cargando") return <PantallaCarga />;
  if (estado === "sinServidor") return <PantallaSinServidor />;

  return (
    <>
      <CatalogoProvider>
        <Outlet />
      </CatalogoProvider>
      <ScrollRestoration />
    </>
  );
}
