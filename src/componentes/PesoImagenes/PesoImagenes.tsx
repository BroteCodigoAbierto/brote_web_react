import { CircleAlert } from "lucide-react";
import { formatearMegas } from "../../utilidades/imagenes.ts";
import estilos from "./PesoImagenes.module.css";

type PropsPesoImagenes = {
  peso: number; // bytes
  maximo: number; // bytes
  texto: string; // "Imágenes de esta lección" o "Imágenes del curso"
};

const MB = 1024 * 1024;

// Cuánto pesan las imágenes de la lección o del curso (docs/diseno.md, "Editor (solo web)";
// spec F13, "Cuánto pesan las imágenes"). Si pasa del máximo, en el color de error.
export default function PesoImagenes({ peso, maximo, texto }: PropsPesoImagenes) {
  const pasado = peso > maximo;
  return (
    <p className={`${estilos.peso} ${pasado ? estilos.pasado : ""}`}>
      {pasado && <CircleAlert className={estilos.icono} aria-hidden="true" />}
      {texto}: {formatearMegas(peso)} de {maximo / MB} MB
    </p>
  );
}
