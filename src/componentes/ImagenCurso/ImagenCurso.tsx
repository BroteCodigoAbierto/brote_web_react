import { ImageOff } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { useImagenes } from "../../contextos/ContextoImagenes.ts";
import { MENSAJES_IMAGENES, type Imagen } from "../../tipos/contrato.ts";
import { esGif, urlImagen } from "../../utilidades/imagenes.ts";
import AnimacionGif from "./AnimacionGif.tsx";
import GifSinDecodificador from "./GifSinDecodificador.tsx";
import estilos from "./ImagenCurso.module.css";

type Fase = "cargando" | "cargada" | "fallo";

// Chrome tiene ImageDecoder; sin él, el respaldo
const Gif = typeof ImageDecoder === "undefined" ? GifSinDecodificador : AnimacionGif;

type PropsImagenCurso = {
  imagen: Imagen;
  ajuste?: "contener" | "cubrir";
  // un GIF se ve quieto en su primer cuadro (la miniatura)
  quieta?: boolean;
  // un GIF se detiene en el cuadro donde va
  pausada?: boolean;
  // lo que se ve si no carga: el texto alternativo
  etiqueta?: string;
  // llena la caja que le da quien la usa (mosaicos, portada); si no, guarda su proporción
  llenar?: boolean;
  className?: string;
};

// Toda imagen de un curso (docs/diseno.md, sección 4; spec F13). Reserva su lugar con la
// proporción de la imagen, así nada salta al llegar. Es decorativa: el nombre accesible lo
// pone quien la usa. Si falla, se vuelve a pedir cuando sube el intento del reproductor.
export default function ImagenCurso({
  imagen,
  ajuste = "contener",
  quieta = false,
  pausada = false,
  etiqueta,
  llenar = false,
  className = "",
}: PropsImagenCurso) {
  const { intento } = useImagenes();
  const [estado, setEstado] = useState<{ fase: Fase; intento: number }>({
    fase: "cargando",
    intento,
  });
  // si falló y el reproductor pasó de actividad, otra vez (research de F13, punto 11)
  if (estado.fase === "fallo" && intento > estado.intento) setEstado({ fase: "cargando", intento });

  const reintento = estado.intento > 0 ? `?r=${estado.intento}` : "";
  const tamano: CSSProperties = llenar ? {} : { aspectRatio: `${imagen.ancho} / ${imagen.alto}` };
  const clases = [
    estilos.imagen,
    estilos[ajuste],
    llenar ? estilos.llenar : "",
    estado.fase === "cargando" ? estilos.cargando : "",
    className,
  ].join(" ");

  function alCargar() {
    setEstado((actual) => ({ ...actual, fase: "cargada" }));
  }

  function alFallar() {
    setEstado((actual) => ({ ...actual, fase: "fallo" }));
  }

  return (
    <div className={clases} style={tamano} aria-hidden="true">
      {estado.fase === "fallo" ? (
        <div className={estilos.fallo}>
          <ImageOff className={estilos.icono} />
          <span className={estilos.texto}>{etiqueta || MENSAJES_IMAGENES.sinCargar}</span>
        </div>
      ) : esGif(imagen) ? (
        <Gif
          key={estado.intento}
          imagen={imagen}
          url={urlImagen(imagen.id) + reintento}
          quieta={quieta}
          pausada={pausada}
          alCargar={alCargar}
          alFallar={alFallar}
        />
      ) : (
        <img
          key={estado.intento}
          src={urlImagen(imagen.id) + reintento}
          alt=""
          decoding="async"
          onLoad={alCargar}
          onError={alFallar}
        />
      )}
    </div>
  );
}
