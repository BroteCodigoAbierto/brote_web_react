import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ImagenActividad } from "../../tipos/contrato.ts";
import { esGif } from "../../utilidades/imagenes.ts";
import BotonPausa from "../BotonPausa/BotonPausa.tsx";
import ImagenCurso from "../ImagenCurso/ImagenCurso.tsx";
import estilos from "./VisorImagen.module.css";

type PropsVisorImagen = {
  imagen: ImagenActividad;
  abierto: boolean;
  // un GIF empieza como estaba en la actividad
  pausadaInicial?: boolean;
  alCerrar: () => void;
};

// El <img> o el <canvas> ocupa todo el marco y dibuja la imagen con object-fit: contain, así
// que lo que sobra a los lados o arriba y abajo también es el elemento. Solo cuenta como
// imagen la parte donde se dibuja; lo demás es fondo.
function sobreLaImagen(medio: Element, x: number, y: number, imagen: ImagenActividad) {
  const caja = medio.getBoundingClientRect();
  const escala = Math.min(caja.width / imagen.ancho, caja.height / imagen.alto);
  const ancho = imagen.ancho * escala;
  const alto = imagen.alto * escala;
  const izquierda = caja.left + (caja.width - ancho) / 2;
  const arriba = caja.top + (caja.height - alto) / 2;
  return x >= izquierda && x <= izquierda + ancho && y >= arriba && y <= arriba + alto;
}

// La imagen a pantalla completa (docs/diseno.md, sección 4; spec F13, "Ampliar una imagen").
// Un <dialog> modal, como Dialogo: el foco se queda dentro y Esc lo cierra. Pulsar el fondo
// oscuro, y no la imagen, también. Quien lo abre devuelve el foco a la imagen.
export default function VisorImagen({
  imagen,
  abierto,
  pausadaInicial = false,
  alCerrar,
}: PropsVisorImagen) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const idDescripcion = useId();
  const [pausada, setPausada] = useState(pausadaInicial);

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) {
      setPausada(pausadaInicial);
      elemento.showModal();
    }
    if (!abierto && elemento.open) elemento.close();
    // pausadaInicial solo cuenta al abrir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  return (
    <dialog
      ref={dialogo}
      className={estilos.visor}
      aria-label="Imagen ampliada"
      aria-describedby={imagen.textoAlternativo ? idDescripcion : undefined}
      onCancel={(evento) => {
        evento.preventDefault();
        alCerrar();
      }}
      onClick={(evento) => {
        // el fondo oscuro, no la imagen ni los botones
        const objetivo = evento.target as Element;
        if (objetivo.closest("button")) return;
        const medio = objetivo.closest("img, canvas");
        if (medio && sobreLaImagen(medio, evento.clientX, evento.clientY, imagen)) return;
        alCerrar();
      }}
    >
      {abierto && (
        <>
          {imagen.textoAlternativo && (
            <p id={idDescripcion} className="oculto">
              {imagen.textoAlternativo}
            </p>
          )}
          <div className={estilos.marco}>
            <ImagenCurso
              imagen={imagen}
              llenar
              pausada={pausada}
              etiqueta={imagen.textoAlternativo}
              className={estilos.imagen}
            />
            {esGif(imagen) && (
              <BotonPausa pausada={pausada} alPulsar={() => setPausada(!pausada)} />
            )}
          </div>
          <button type="button" className={estilos.cerrar} aria-label="Cerrar" onClick={alCerrar}>
            <X className={estilos.icono} aria-hidden="true" />
          </button>
        </>
      )}
    </dialog>
  );
}
