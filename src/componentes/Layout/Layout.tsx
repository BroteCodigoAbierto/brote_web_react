import { Link, Outlet, ScrollRestoration } from "react-router";
import CatalogoProvider from "../../contextos/CatalogoProvider.tsx";
import Marca from "../Marca/Marca.tsx";
import MenuCuenta from "../MenuCuenta/MenuCuenta.tsx";
import estilos from "./Layout.module.css";

// Marco común de las páginas con sesión: encabezado de vidrio pegajoso (marca
// y cuenta) y contenido (docs/diseno.md, sección 5). El catálogo vive aquí y no
// en su página para que siga cargado al ir al detalle de un curso y volver;
// ScrollRestoration devuelve la lista a donde se dejó.
export default function Layout() {
  return (
    <div className={estilos.pagina}>
      <header className={estilos.encabezado}>
        <div className={estilos.barra}>
          <Link to="/" className={estilos.enlaceMarca} aria-label="Brote, ir al catálogo">
            <Marca />
          </Link>
          <div className={estilos.cuenta}>
            <MenuCuenta />
          </div>
        </div>
      </header>
      <main className={estilos.contenido}>
        <CatalogoProvider>
          <Outlet />
        </CatalogoProvider>
      </main>
      <ScrollRestoration />
    </div>
  );
}
