import { CircleAlert } from "lucide-react";
import { formatearMegas } from "../../utilidades/imagenes.ts";
import estilos from "./PesoArchivos.module.css";

type PropsPesoArchivos = {
  peso: number; // bytes
  maximo: number; // bytes
  texto: string; // "Archivos de esta lección" o "Archivos del curso"
};

const MB = 1024 * 1024;

// Cuánto pesan los archivos de la lección o del curso, imágenes y audios juntos
// (docs/diseno.md, "Editor (solo web)"; spec F13, "Cuánto pesan las imágenes", y F14, "Cuánto
// pesan los archivos"). Si pasa del máximo, en el color de error.
export default function PesoArchivos({ peso, maximo, texto }: PropsPesoArchivos) {
  const pasado = peso > maximo;
  return (
    <p className={`${estilos.peso} ${pasado ? estilos.pasado : ""}`}>
      {pasado && <CircleAlert className={estilos.icono} aria-hidden="true" />}
      {texto}: {formatearMegas(peso)} de {maximo / MB} MB
    </p>
  );
}
