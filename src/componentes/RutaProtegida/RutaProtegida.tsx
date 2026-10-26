import { Navigate, Outlet, useLocation } from "react-router";
import { useSesion } from "../../hooks/useSesion.ts";
import PantallaCarga from "../PantallaCarga/PantallaCarga.tsx";
import PantallaSinServidor from "../PantallaSinServidor/PantallaSinServidor.tsx";

// Envuelve todas las rutas que exigen sesión (spec F01: sin sesión solo existen
// "Entrar" y "Crear cuenta"). Sin sesión manda a /entrar recordando a dónde se
// quería ir, salvo si el usuario cerró sesión él mismo.
export default function RutaProtegida() {
  const { estado, motivo } = useSesion();
  const ubicacion = useLocation();

  if (estado === "cargando") return <PantallaCarga />;
  if (estado === "sinServidor") return <PantallaSinServidor />;
  if (estado === "sinSesion") {
    const desde = motivo === "cerrada" ? undefined : { desde: ubicacion };
    return <Navigate to="/entrar" replace state={desde} />;
  }
  return <Outlet />;
}
