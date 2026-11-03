import { LayoutDashboard } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import Marca from "../Marca/Marca.tsx";
import MenuCuenta from "../MenuCuenta/MenuCuenta.tsx";
import estilos from "./Layout.module.css";

// Marco común de las páginas con sesión: encabezado de vidrio pegajoso (marca,
// "Mi panel" y cuenta) y contenido (docs/diseno.md, secciones 4 y 5). El estado del catálogo
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
            {/* NavLink pone aria-current="page" en /panel */}
            <NavLink
              to="/panel"
              aria-label="Mi panel"
              className={({ isActive }) =>
                `${estilos.enlacePanel} ${isActive ? estilos.enlacePanelActivo : ""}`
              }
            >
              <LayoutDashboard className={estilos.iconoPanel} aria-hidden="true" />
              <span className={estilos.textoPanel}>Mi panel</span>
            </NavLink>
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
