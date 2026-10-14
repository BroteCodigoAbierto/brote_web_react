import { Link, Outlet } from "react-router";
import estilos from "./Layout.module.css";

// Marco común de todas las páginas: encabezado y contenido.
export default function Layout() {
  return (
    <div className={estilos.pagina}>
      <header className={estilos.encabezado}>
        <Link to="/" className={estilos.marca}>
          Brote
        </Link>
      </header>
      <main className={estilos.contenido}>
        <Outlet />
      </main>
    </div>
  );
}
