import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef, type RefObject } from "react";
import estilos from "./BotonesOrden.module.css";

type PropsBotonesOrden = {
  alSubir: () => void;
  alBajar: () => void;
  esPrimero: boolean;
  esUltimo: boolean;
  // qué se mueve, p. ej. "lección 2"
  etiqueta: string;
  deshabilitado?: boolean;
};

// "Subir" y "Bajar", para ordenar sin arrastrar (docs/diseno.md, sección 4,
// "Editor (solo web)"). En los extremos usan aria-disabled y no disabled: un botón
// disabled pierde el foco, y la spec pide que siga ahí. Mover el elemento en el DOM
// también puede quitárselo, por eso se devuelve a mano.
export default function BotonesOrden({
  alSubir,
  alBajar,
  esPrimero,
  esUltimo,
  etiqueta,
  deshabilitado = false,
}: PropsBotonesOrden) {
  const subir = useRef<HTMLButtonElement>(null);
  const bajar = useRef<HTMLButtonElement>(null);

  function mover(
    sinAccion: boolean,
    accion: () => void,
    boton: RefObject<HTMLButtonElement | null>,
  ) {
    if (sinAccion) return;
    accion();
    requestAnimationFrame(() => boton.current?.focus());
  }

  return (
    <div className={estilos.botones}>
      <button
        ref={subir}
        type="button"
        className={estilos.boton}
        aria-label={`Subir ${etiqueta}`}
        title="Subir"
        aria-disabled={esPrimero || deshabilitado || undefined}
        onClick={() => mover(esPrimero || deshabilitado, alSubir, subir)}
      >
        <ChevronUp aria-hidden="true" />
      </button>
      <button
        ref={bajar}
        type="button"
        className={estilos.boton}
        aria-label={`Bajar ${etiqueta}`}
        title="Bajar"
        aria-disabled={esUltimo || deshabilitado || undefined}
        onClick={() => mover(esUltimo || deshabilitado, alBajar, bajar)}
      >
        <ChevronDown aria-hidden="true" />
      </button>
    </div>
  );
}
