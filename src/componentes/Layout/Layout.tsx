import { Link, Outlet } from "react-router";
import MenuCuenta from "../MenuCuenta/MenuCuenta.tsx";
import estilos from "./Layout.module.css";

// Marco común de las páginas con sesión: encabezado (marca y cuenta) y contenido.
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
        <Outlet />
      </main>
    </div>
  );
}
