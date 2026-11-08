import { useRef, useState } from "react";
import { useReducirMovimiento } from "../../hooks/useReducirMovimiento.ts";
import type { ImagenActividad } from "../../tipos/contrato.ts";
import { esGif } from "../../utilidades/imagenes.ts";
import BotonPausa from "../BotonPausa/BotonPausa.tsx";
import ImagenCurso from "../ImagenCurso/ImagenCurso.tsx";
import VisorImagen from "../VisorImagen/VisorImagen.tsx";
import estilos from "./ImagenAmpliable.module.css";

type PropsImagenAmpliable = {
  imagen: ImagenActividad;
};

// La imagen de la teoría y de la pregunta (docs/diseno.md, sección 4; spec F13): tan ancha
// como la actividad o como la imagen, lo que sea menor, sin pasar de la mitad del alto de la
// pantalla. Tocarla la abre en grande; abrirla no cuenta como haber hecho algo.
export default function ImagenAmpliable({ imagen }: PropsImagenAmpliable) {
  const reducirMovimiento = useReducirMovimiento();
  const [pausada, setPausada] = useState(reducirMovimiento);
  const [abierta, setAbierta] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const proporcion = imagen.ancho / imagen.alto;
  const ancho = `min(100%, ${imagen.ancho}px, calc(var(--alto-imagen-max) * ${proporcion}))`;

  function cerrar() {
    setAbierta(false);
    boton.current?.focus();
  }

  return (
    <div className={estilos.contenedor} style={{ width: ancho }}>
      <button
        ref={boton}
        type="button"
        className={estilos.boton}
        aria-label={`${imagen.textoAlternativo ?? "Imagen"}. Ampliar`}
        onClick={() => setAbierta(true)}
      >
        <ImagenCurso imagen={imagen} pausada={pausada} etiqueta={imagen.textoAlternativo} />
      </button>
      {esGif(imagen) && <BotonPausa pausada={pausada} alPulsar={() => setPausada(!pausada)} />}
      <VisorImagen imagen={imagen} abierto={abierta} pausadaInicial={pausada} alCerrar={cerrar} />
    </div>
  );
}
