import { CircleCheck, CircleX } from "lucide-react";
import estilos from "./OpcionRespuesta.module.css";

export type EstadoOpcion = "normal" | "seleccionada" | "correcta" | "incorrecta";

type PropsOpcionRespuesta = {
  estado: EstadoOpcion;
  // una opción es un texto o un símbolo que se muestra en grande
  texto?: string;
  simbolo?: string;
  // la tecla que la elige (1 a 9)
  numero?: number;
  deshabilitada?: boolean;
  alElegir: () => void;
};

// Opción de una pregunta (docs/diseno.md, sección 6, "Opciones"): un radio de
// vidrio con borde de 2 px. La incorrecta se sacude, salvo con "reducir movimiento".
export default function OpcionRespuesta({
  estado,
  texto,
  simbolo,
  numero,
  deshabilitada = false,
  alElegir,
}: PropsOpcionRespuesta) {
  const marcada = estado !== "normal";
  const clases = [estilos.opcion, estilos[estado], simbolo ? estilos.mosaico : ""].join(" ");

  return (
    <button
      type="button"
      role="radio"
      aria-checked={marcada}
      className={clases}
      disabled={deshabilitada}
      onClick={alElegir}
    >
      {numero !== undefined && !simbolo && (
        <kbd className={estilos.tecla} aria-hidden="true">
          {numero}
        </kbd>
      )}
      <span className={simbolo ? estilos.simbolo : estilos.texto}>{simbolo ?? texto}</span>
      {estado === "correcta" && (
        <CircleCheck className={estilos.icono} aria-label="Correcta" role="img" />
      )}
      {estado === "incorrecta" && (
        <CircleX className={estilos.icono} aria-label="Incorrecta" role="img" />
      )}
    </button>
  );
}
