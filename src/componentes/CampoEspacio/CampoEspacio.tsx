import { LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import estilos from "./CampoEspacio.module.css";

export type EstadoEspacio = "normal" | "correcto" | "incorrecto";

type PropsCampoEspacio = {
  valor: string;
  alCambiar: (valor: string) => void;
  estado: EstadoEspacio;
  // la respuesta esperada, que se muestra al lado si es incorrecto
  esperada?: string;
  // nombre accesible, p. ej. "Espacio 1 de 2"
  etiqueta: string;
  deshabilitado?: boolean;
  autoFocus?: boolean;
};

// Un espacio de "completar espacios" (docs/diseno.md, sección 6): un campo en
// línea con el texto, que crece con lo escrito.
export default function CampoEspacio({
  valor,
  alCambiar,
  estado,
  esperada,
  etiqueta,
  deshabilitado = false,
  autoFocus = false,
}: PropsCampoEspacio) {
  return (
    <span className={estilos.espacio}>
      <input
        className={`${estilos.campo} ${estilos[estado]}`}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        aria-label={etiqueta}
        aria-invalid={estado === "incorrecto" || undefined}
        maxLength={LIMITES_ACTIVIDADES.respuestaEspacioMax}
        size={Math.max(Array.from(valor).length, 4)}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={deshabilitado}
        autoFocus={autoFocus}
      />
      {esperada !== undefined && (
        <span className={estilos.esperada}>
          <span className="oculto">Respuesta esperada: </span>
          {esperada}
        </span>
      )}
    </span>
  );
}
