import { CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import { useReducirMovimiento } from "../../hooks/useReducirMovimiento.ts";
import type { ImagenActividad } from "../../tipos/contrato.ts";
import { esGif } from "../../utilidades/imagenes.ts";
import BotonPausa from "../BotonPausa/BotonPausa.tsx";
import MosaicoImagen from "../MosaicoImagen/MosaicoImagen.tsx";
import estilos from "./OpcionRespuesta.module.css";

export type EstadoOpcion = "normal" | "seleccionada" | "correcta" | "incorrecta";

type PropsOpcionRespuesta = {
  estado: EstadoOpcion;
  // una opción es un texto, un símbolo que se muestra en grande o, desde F13, una imagen
  texto?: string;
  simbolo?: string;
  imagen?: ImagenActividad;
  // la tecla que la elige (1 a 9)
  numero?: number;
  deshabilitada?: boolean;
  alElegir: () => void;
};

// Opción de una pregunta (docs/diseno.md, sección 6, "Opciones"): un radio de
// vidrio con borde de 2 px. La incorrecta se sacude, salvo con "reducir movimiento".
// Con imagen (F13), un mosaico con el número y el icono como insignias; un GIF lleva su
// BotonPausa al lado del botón, no dentro.
export default function OpcionRespuesta({
  estado,
  texto,
  simbolo,
  imagen,
  numero,
  deshabilitada = false,
  alElegir,
}: PropsOpcionRespuesta) {
  const reducirMovimiento = useReducirMovimiento();
  const [pausada, setPausada] = useState(reducirMovimiento);
  const marcada = estado !== "normal";
  const forma = imagen ? estilos.mosaicoImagen : simbolo ? estilos.mosaico : "";
  const clases = [estilos.opcion, estilos[estado], forma].join(" ");
  // una opción de imagen se llama como su texto alternativo o "Imagen {n}" (spec F13)
  const etiqueta = imagen
    ? (imagen.textoAlternativo ?? `Imagen ${numero ?? ""}`.trim())
    : undefined;

  const boton = (
    <button
      type="button"
      role="radio"
      aria-checked={marcada}
      aria-label={etiqueta}
      className={clases}
      disabled={deshabilitada}
      onClick={alElegir}
    >
      {numero !== undefined && !simbolo && (
        <kbd className={`${estilos.tecla} ${imagen ? estilos.insignia : ""}`} aria-hidden="true">
          {numero}
        </kbd>
      )}
      {imagen ? (
        <MosaicoImagen imagen={imagen} pausada={pausada} />
      ) : (
        <span className={simbolo ? estilos.simbolo : estilos.texto}>{simbolo ?? texto}</span>
      )}
      {estado === "correcta" && (
        <CircleCheck className={estilos.icono} aria-label="Correcta" role="img" />
      )}
      {estado === "incorrecta" && (
        <CircleX className={estilos.icono} aria-label="Incorrecta" role="img" />
      )}
    </button>
  );

  if (!imagen || !esGif(imagen)) return boton;
  return (
    <div className={estilos.conPausa}>
      {boton}
      <BotonPausa pausada={pausada} alPulsar={() => setPausada(!pausada)} />
    </div>
  );
}
