import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import Superficie from "../Superficie/Superficie.tsx";
import estilos from "./ZonaElementos.module.css";

type PropsZonaElementos = {
  // con título, es una categoría
  titulo?: string;
  // el elemento arrastrado está encima
  resaltada?: boolean;
  // nombre accesible de la zona, p. ej. "Categoría Palabra clave"
  etiqueta: string;
  alPulsar?: () => void;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children" | "title" | "onClick">;

// Agrupa elementos: los sin colocar, el banco o una categoría (docs/diseno.md, sección 4). Sigue
// visible aunque esté vacía, para poder soltar ahí. Un botón no puede contener a otro, así que
// el botón es el título, para el teclado y el lector de pantalla, y el clic en la parte vacía
// se atiende aparte. Los elementos colocados resuelven su propio clic (research de F11, punto 8).
export default function ZonaElementos({
  titulo,
  resaltada = false,
  etiqueta,
  alPulsar,
  children,
  ...atributos
}: PropsZonaElementos) {
  function pulsarParteVacia(evento: MouseEvent<HTMLDivElement>) {
    if (!(evento.target as Element).closest("button")) alPulsar?.();
  }

  return (
    <Superficie
      tono="suave"
      role="group"
      aria-label={etiqueta}
      className={`${estilos.zona} ${alPulsar ? estilos.pulsable : ""} ${resaltada ? estilos.resaltada : ""}`}
      onClick={alPulsar ? pulsarParteVacia : undefined}
      {...atributos}
    >
      {titulo !== undefined && (
        <button type="button" className={estilos.titulo} disabled={!alPulsar} onClick={alPulsar}>
          {titulo}
        </button>
      )}
      <div className={estilos.elementos}>{children}</div>
    </Superficie>
  );
}
