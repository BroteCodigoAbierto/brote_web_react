import { useSesion } from "../../hooks/useSesion.ts";
import { MENSAJE_SIN_SERVIDOR } from "../../servicios/api.ts";
import ErrorCarga from "../ErrorCarga/ErrorCarga.tsx";
import Marca from "../Marca/Marca.tsx";
import estilos from "./PantallaSinServidor.module.css";

// Al abrir la web con la API caída no se sabe si hay sesión: se ofrece reintentar.
export default function PantallaSinServidor() {
  const { reintentar } = useSesion();

  return (
    <div className={estilos.pantalla}>
      <Marca />
      <ErrorCarga mensaje={MENSAJE_SIN_SERVIDOR} alReintentar={reintentar} />
    </div>
  );
}
