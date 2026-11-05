import { CircleCheck, CircleX } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import type { EstadoOpcion } from "../OpcionRespuesta/OpcionRespuesta.tsx";
import estilos from "./ElementoRespuesta.module.css";

export type FormaElemento = "tarjeta" | "compacta";

type PropsElementoRespuesta = {
  texto: string;
  estado?: EstadoOpcion;
  forma?: FormaElemento;
  // el número que se ve en los dos elementos de una pareja
  marca?: number;
  // su lugar de origen, mientras se arrastra
  atenuada?: boolean;
  // el destino que el elemento arrastrado tiene debajo
  resaltada?: boolean;
  deshabilitada?: boolean;
  // nombre accesible, con su estado (p. ej. "git push, pareja 2")
  etiqueta: string;
  alPulsar: () => void;
} & Omit<ComponentPropsWithoutRef<"button">, "type" | "disabled" | "onClick" | "className">;

// Elemento que se mueve o se une en las actividades de relacionar (docs/diseno.md, sección
// 4): el aspecto de OpcionRespuesta, pero es un botón y no un radio, y lleva número. Recibe
// lo de arrastrar (propsOrigen, propsDestino) y los data-* del foco como atributos.
export default function ElementoRespuesta({
  texto,
  estado = "normal",
  forma = "tarjeta",
  marca,
  atenuada = false,
  resaltada = false,
  deshabilitada = false,
  etiqueta,
  alPulsar,
  ...atributos
}: PropsElementoRespuesta) {
  const clases = [
    estilos.elemento,
    estilos[forma],
    estilos[estado],
    atenuada ? estilos.atenuada : "",
    resaltada ? estilos.resaltada : "",
  ].join(" ");

  return (
    <button
      type="button"
      className={clases}
      aria-label={etiqueta}
      aria-pressed={estado === "seleccionada"}
      disabled={deshabilitada}
      onClick={alPulsar}
      {...atributos}
    >
      {marca !== undefined && (
        <span className={estilos.marca} aria-hidden="true">
          {marca}
        </span>
      )}
      <span className={estilos.texto}>{texto}</span>
      {estado === "correcta" && <CircleCheck className={estilos.icono} aria-hidden="true" />}
      {estado === "incorrecta" && <CircleX className={estilos.icono} aria-hidden="true" />}
    </button>
  );
}
