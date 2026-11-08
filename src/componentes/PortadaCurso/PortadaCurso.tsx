import { useState } from "react";
import type { Imagen } from "../../tipos/contrato.ts";
import { indiceColorPortada, inicialPortada } from "../../utilidades/cursos.ts";
import ImagenCurso from "../ImagenCurso/ImagenCurso.tsx";
import estilos from "./PortadaCurso.module.css";

type PropsPortadaCurso = {
  id: string;
  titulo: string;
  tamano: "tarjeta" | "detalle";
  // F13: la imagen de la portada; sin ella, la generada
  idPortada?: string | null;
};

// La portada generada es la inicial del título sobre un degradado del color que sale del id
// (docs/diseno.md, sección 2.1). Con imagen (F13), la imagen la llena, recortada al centro;
// mientras carga se ve el color sin la inicial, y si no carga, la generada. Es decorativa:
// el título siempre va al lado.
export default function PortadaCurso({ id, titulo, tamano, idPortada }: PropsPortadaCurso) {
  const [fallo, setFallo] = useState<string | null>(null);
  const color = estilos[`color${indiceColorPortada(id) + 1}`];
  const conImagen = Boolean(idPortada) && fallo !== idPortada;

  return (
    <div className={`${estilos.portada} ${estilos[tamano]} ${color}`} aria-hidden="true">
      {conImagen && idPortada ? (
        <ImagenCurso
          key={idPortada}
          imagen={imagenDePortada(idPortada)}
          ajuste="cubrir"
          llenar
          className={estilos.imagen}
          alFallar={() => setFallo(idPortada)}
        />
      ) : (
        <span className={estilos.inicial}>{inicialPortada(titulo)}</span>
      )}
    </div>
  );
}

// Para la portada basta el id: se recorta para llenar, así que su tamaño no importa.
function imagenDePortada(id: string): Imagen {
  return { id, formato: "png", ancho: 1, alto: 1, peso: 0 };
}
