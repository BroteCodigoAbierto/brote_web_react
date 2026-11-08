import type { ImagenActividad } from "../../tipos/contrato.ts";
import ImagenCurso from "../ImagenCurso/ImagenCurso.tsx";
import estilos from "./MosaicoImagen.module.css";

type PropsMosaicoImagen = {
  imagen: ImagenActividad;
  quieta?: boolean;
  pausada?: boolean;
};

// El cuadro de una opción o un elemento de imagen (docs/diseno.md, sección 4; spec F13):
// la imagen completa, sin recortar, y lo que sobra con el fondo del mosaico, también
// detrás de un PNG transparente. Llena el cuadro que le da quien lo usa.
export default function MosaicoImagen({ imagen, quieta, pausada }: PropsMosaicoImagen) {
  return (
    <span className={estilos.mosaico}>
      <ImagenCurso
        imagen={imagen}
        llenar
        quieta={quieta}
        pausada={pausada}
        etiqueta={imagen.textoAlternativo}
      />
    </span>
  );
}
