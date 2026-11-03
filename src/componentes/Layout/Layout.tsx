import { Link, Outlet } from "react-router";
import Marca from "../Marca/Marca.tsx";
import MenuCuenta from "../MenuCuenta/MenuCuenta.tsx";
import estilos from "./Layout.module.css";

// Marco común de las páginas con sesión: encabezado de vidrio pegajoso (marca
// y cuenta) y contenido (docs/diseno.md, sección 5). El estado del catálogo
// vive un nivel arriba, en ZonaConSesion.
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
        <Outlet />
      </main>
    </div>
  );
}
