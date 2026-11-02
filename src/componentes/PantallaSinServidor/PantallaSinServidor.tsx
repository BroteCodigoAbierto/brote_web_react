import { useSesion } from "../../hooks/useSesion.ts";
import { MENSAJE_SIN_SERVIDOR } from "../../servicios/api.ts";
import Boton from "../Boton/Boton.tsx";
import estilos from "./PantallaSinServidor.module.css";

// Al abrir la web con la API caída no se sabe si hay sesión: se ofrece reintentar.
export default function PantallaSinServidor() {
  const { reintentar } = useSesion();

  return (
    <div className={estilos.pantalla}>
      <p role="alert">{MENSAJE_SIN_SERVIDOR}</p>
      <Boton alPulsar={reintentar}>Reintentar</Boton>
    </div>
  );
}
