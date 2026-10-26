import { Navigate, Outlet, useLocation, type Path } from "react-router";
import { useSesion } from "../../hooks/useSesion.ts";
import PantallaCarga from "../PantallaCarga/PantallaCarga.tsx";

// La página a la que se quería ir antes de pasar por "Entrar" (la deja
// RutaProtegida en el state). Solo se acepta si tiene la forma esperada.
function leerDesde(state: unknown): Partial<Path> | undefined {
  const desde = (state as { desde?: Partial<Path> } | null)?.desde;
  return typeof desde?.pathname === "string" ? desde : undefined;
}

// Envuelve "Entrar" y "Crear cuenta". Con sesión no tienen sentido: se va a la
// página que se quería abrir o al inicio. Es lo que pasa también justo después
// de entrar o de crear la cuenta, así que esas páginas no navegan por su cuenta.
export default function SoloSinSesion() {
  const { estado } = useSesion();
  const ubicacion = useLocation();

  if (estado === "cargando") return <PantallaCarga />;
  if (estado === "conSesion") return <Navigate to={leerDesde(ubicacion.state) ?? "/"} replace />;
  return <Outlet />;
}
