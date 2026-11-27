import { Building2, Compass, LayoutDashboard, PenTool } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate, useParams } from "react-router";
import { useEspacio } from "../../hooks/useEspacio.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import Marca from "../Marca/Marca.tsx";
import MenuCuenta from "../MenuCuenta/MenuCuenta.tsx";
import estilos from "./Layout.module.css";

// Marco común de las páginas (con o sin sesión): encabezado de vidrio pegajoso,
// selector opcional de espacio (solo si el usuario pertenece a al menos una
// organización), navegación principal y cuenta / acceso (docs/diseno.md y decisión 0020).
export default function Layout() {
  const { usuario } = useSesion();
  const { configuracion, organizaciones, espacioActivo, seleccionarEspacio } = useEspacio();
  const navegar = useNavigate();
  const { slug } = useParams();

  const rutaInicio =
    configuracion.modoInstancia === "organizacion" && configuracion.slugOrganizacionFija
      ? `/o/${configuracion.slugOrganizacionFija}`
      : "/";

  const mostrarSelectorEspacio =
    organizaciones.length > 0 && configuracion.modoInstancia !== "organizacion";

  const valorSelector = slug ?? espacioActivo ?? "";

  function alCambiarEspacio(nuevoSlug: string) {
    if (!nuevoSlug) {
      seleccionarEspacio(null);
      void navegar("/");
      return;
    }
    seleccionarEspacio(nuevoSlug);
    void navegar(`/o/${nuevoSlug}`);
  }

  return (
    <div className={estilos.pagina}>
      <header className={estilos.encabezado}>
        <div className={estilos.barra}>
          <div className={estilos.izquierda}>
            <Link
              to={rutaInicio}
              className={estilos.enlaceMarca}
              aria-label={`${configuracion.nombreInstancia}, ir al catálogo`}
              onClick={() => {
                if (configuracion.modoInstancia !== "organizacion") seleccionarEspacio(null);
              }}
            >
              <Marca nombre={configuracion.nombreInstancia} />
            </Link>

            {mostrarSelectorEspacio && (
              <label className={estilos.selectorEspacio}>
                <Building2 className={estilos.iconoEspacio} aria-hidden="true" />
                <span className="solo-lector">Espacio activo</span>
                <select
                  className={estilos.selectEspacio}
                  value={valorSelector}
                  onChange={(evento) => alCambiarEspacio(evento.target.value)}
                  aria-label="Cambiar de espacio"
                >
                  <option value="">Comunidad abierta</option>
                  {organizaciones.map((org) => (
                    <option key={org.id} value={org.slug}>
                      {org.nombre}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <nav className={estilos.navegacion} aria-label="Navegación principal">
            <NavLink
              to={rutaInicio}
              end
              aria-label="Explorar"
              className={({ isActive }) =>
                `${estilos.enlaceNav} ${isActive || Boolean(slug) ? estilos.enlaceNavActivo : ""}`
              }
            >
              <Compass className={estilos.iconoNav} aria-hidden="true" />
              <span className={estilos.textoNav}>Explorar</span>
            </NavLink>

            {usuario && (
              <>
                <NavLink
                  to="/panel"
                  aria-label="Mi aprendizaje"
                  className={({ isActive }) =>
                    `${estilos.enlaceNav} ${isActive ? estilos.enlaceNavActivo : ""}`
                  }
                >
                  <LayoutDashboard className={estilos.iconoNav} aria-hidden="true" />
                  <span className={estilos.textoNav}>Mi aprendizaje</span>
                </NavLink>
                <NavLink
                  to="/estudio"
                  aria-label="Estudio"
                  className={({ isActive }) =>
                    `${estilos.enlaceNav} ${isActive ? estilos.enlaceNavActivo : ""}`
                  }
                >
                  <PenTool className={estilos.iconoNav} aria-hidden="true" />
                  <span className={estilos.textoNav}>Estudio</span>
                </NavLink>
              </>
            )}
          </nav>

          <div className={estilos.cuenta}>
            {usuario ? (
              <MenuCuenta />
            ) : (
              <div className={estilos.visitante}>
                <Link to="/entrar" className={estilos.enlaceEntrar}>
                  Entrar
                </Link>
                <Link to="/registro" className={estilos.botonRegistro}>
                  Crear cuenta
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className={estilos.contenido}>
        <Outlet />
      </main>
    </div>
  );
}
