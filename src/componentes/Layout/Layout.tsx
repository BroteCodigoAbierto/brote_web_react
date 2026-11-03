import { Link, Outlet, ScrollRestoration } from "react-router";
import CatalogoProvider from "../../contextos/CatalogoProvider.tsx";
import MenuCuenta from "../MenuCuenta/MenuCuenta.tsx";
import estilos from "./Layout.module.css";

// Marco común de las páginas con sesión: encabezado (marca y cuenta) y contenido.
// El catálogo vive aquí y no en su página para que siga cargado al ir al detalle
// de un curso y volver; ScrollRestoration devuelve la lista a donde se dejó.
export default function Layout() {
  return (
    <div className={estilos.pagina}>
      <header className={estilos.encabezado}>
        <Link to="/" className={estilos.marca}>
          Brote
        </Link>
        <div className={estilos.cuenta}>
          <MenuCuenta />
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
