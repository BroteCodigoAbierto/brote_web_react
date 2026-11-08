import { CircleCheck, CircleX } from "lucide-react";
import { useState, type ComponentPropsWithoutRef } from "react";
import { useReducirMovimiento } from "../../hooks/useReducirMovimiento.ts";
import type { ImagenActividad } from "../../tipos/contrato.ts";
import { esGif } from "../../utilidades/imagenes.ts";
import BotonPausa from "../BotonPausa/BotonPausa.tsx";
import MosaicoImagen from "../MosaicoImagen/MosaicoImagen.tsx";
import type { EstadoOpcion } from "../OpcionRespuesta/OpcionRespuesta.tsx";
import estilos from "./ElementoRespuesta.module.css";

// "mosaico" (F13): un elemento de imagen
export type FormaElemento = "tarjeta" | "compacta" | "mosaico";

type PropsElementoRespuesta = {
  texto?: string;
  // F13: un elemento de imagen, en forma "mosaico"
  imagen?: ImagenActividad;
  // F13: el mosaico toma el ancho de su contenedor (las columnas de emparejar)
  llenar?: boolean;
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
// lo de arrastrar (propsOrigen, propsDestino) y los data-* del foco como atributos. Con
// imagen (F13), un mosaico con la marca y el icono como insignias; un GIF lleva su
// BotonPausa al lado del botón, que no recibe lo de arrastrar.
export default function ElementoRespuesta({
  texto,
  imagen,
  llenar = false,
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
  const reducirMovimiento = useReducirMovimiento();
  const [pausada, setPausada] = useState(reducirMovimiento);
  const clases = [
    estilos.elemento,
    estilos[forma],
    llenar ? estilos.llenar : "",
    estilos[estado],
    atenuada ? estilos.atenuada : "",
    resaltada ? estilos.resaltada : "",
  ].join(" ");

  const boton = (
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
        <span className={`${estilos.marca} ${imagen ? estilos.insignia : ""}`} aria-hidden="true">
          {marca}
        </span>
      )}
      {imagen ? (
        <span className={estilos.contenido}>
          <MosaicoImagen imagen={imagen} pausada={pausada} />
        </span>
      ) : (
        <span className={estilos.texto}>{texto}</span>
      )}
      {estado === "correcta" && <CircleCheck className={estilos.icono} aria-hidden="true" />}
      {estado === "incorrecta" && <CircleX className={estilos.icono} aria-hidden="true" />}
    </button>
  );

  if (!imagen || !esGif(imagen)) return boton;
  return (
    <div className={`${estilos.conPausa} ${llenar ? estilos.llenarPausa : ""}`}>
      {boton}
      <BotonPausa pausada={pausada} alPulsar={() => setPausada(!pausada)} />
    </div>
  );
}
