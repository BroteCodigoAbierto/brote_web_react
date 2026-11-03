import { Outlet, ScrollRestoration } from "react-router";
import CatalogoProvider from "../../contextos/CatalogoProvider.tsx";

// Todo lo que va con sesión, dentro y fuera del marco común. El catálogo vive
// aquí, y no en el Layout ni en su página, para que siga cargado al ir al
// detalle de un curso y a una de sus lecciones (que va a pantalla completa,
// fuera del Layout) y volver; ScrollRestoration devuelve la lista a donde se
// dejó (brote_specs, research de F03, punto 8).
export default function ZonaConSesion() {
  return (
    <>
      <CatalogoProvider>
        <Outlet />
      </CatalogoProvider>
      <ScrollRestoration />
    </>
  );
}
