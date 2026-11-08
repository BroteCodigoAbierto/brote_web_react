import { Pause, Play } from "lucide-react";
import estilos from "./BotonPausa.module.css";

type PropsBotonPausa = {
  pausada: boolean;
  alPulsar: () => void;
  className?: string;
};

// El botón de un GIF (docs/diseno.md, sección 4; spec F13, "GIF"). Va en la esquina inferior
// izquierda de quien lo contiene, que tiene que ser `position: relative`. Nunca va dentro de
// otro botón: pulsarlo no elige la opción ni el elemento que tiene detrás, ni cuenta como
// haber hecho algo en la lección.
export default function BotonPausa({ pausada, alPulsar, className = "" }: PropsBotonPausa) {
  const Icono = pausada ? Play : Pause;
  return (
    <button
      type="button"
      className={`${estilos.boton} ${className}`}
      aria-label={pausada ? "Reanudar animación" : "Pausar animación"}
      onClick={(evento) => {
        evento.stopPropagation();
        alPulsar();
      }}
      onPointerDown={(evento) => evento.stopPropagation()}
    >
      <Icono className={estilos.icono} aria-hidden="true" />
    </button>
  );
}
