import type { HTMLAttributes, ReactNode } from "react";
import type { EstadoEspacio } from "../CampoEspacio/CampoEspacio.tsx";
import estilos from "./LugarElemento.module.css";

type PropsLugarElemento = {
  // el lugar de ordenar, a la izquierda
  numero?: number;
  // espacio del banco, dentro del texto
  enLinea?: boolean;
  estado?: EstadoEspacio;
  // la ficha esperada, que se muestra al lado si es incorrecto
  esperada?: string;
  // el elemento arrastrado está encima
  resaltado?: boolean;
  // nombre accesible del lugar vacío, p. ej. "Lugar 2, vacío"
  etiqueta: string;
  // el elemento colocado; sin él, el lugar está libre
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

// Donde se coloca un ElementoRespuesta (docs/diseno.md, sección 4). Recibe propsDestino como
// atributos: el destino es el hueco, esté lleno o no.
export default function LugarElemento({
  numero,
  enLinea = false,
  estado = "normal",
  esperada,
  resaltado = false,
  etiqueta,
  children,
  ...atributos
}: PropsLugarElemento) {
  const vacio = children === undefined || children === null;
  const Contenedor = enLinea ? "span" : "div";
  const clases = [
    enLinea ? estilos.huecoEnLinea : estilos.hueco,
    vacio ? estilos.vacio : estilos.lleno,
    resaltado ? estilos.resaltado : "",
  ].join(" ");

  return (
    <Contenedor className={enLinea ? estilos.enLinea : estilos.fila}>
      {numero !== undefined && (
        <span className={`${estilos.numero} ${estilos[estado]}`} aria-hidden="true">
          {numero}
        </span>
      )}
      <Contenedor
        className={clases}
        role={vacio ? "group" : undefined}
        aria-label={vacio ? etiqueta : undefined}
        {...atributos}
      >
        {children}
      </Contenedor>
      {esperada !== undefined && (
        <span className={estilos.esperada}>
          <span className="oculto">Respuesta esperada: </span>
          {esperada}
        </span>
      )}
    </Contenedor>
  );
}
