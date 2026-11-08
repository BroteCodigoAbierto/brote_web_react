import type { Imagen } from "../../tipos/contrato.ts";
import ImagenCurso from "../ImagenCurso/ImagenCurso.tsx";
import estilos from "./MiniaturaImagen.module.css";

type PropsMiniaturaImagen = {
  imagen: Imagen;
};

// Una imagen en la barra inferior al fallar (docs/diseno.md, sección 4; spec F13): 48 px, la
// imagen completa y un GIF quieto. Decorativa: el texto alternativo va a su lado.
export default function MiniaturaImagen({ imagen }: PropsMiniaturaImagen) {
  return (
    <span className={estilos.miniatura} aria-hidden="true">
      <ImagenCurso imagen={imagen} llenar quieta />
    </span>
  );
}
