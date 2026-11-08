import { URL_API } from "../config.ts";
import {
  RUTA_IMAGENES,
  type Actividad,
  type ContenidoElemento,
  type Imagen,
  type ImagenActividad,
} from "../tipos/contrato.ts";

// Las imágenes de los cursos (spec F13). Se piden con la cookie de la sesión: un <img> a la
// API la manda sola, porque la web y la API son del mismo sitio (brote_specs, research de
// F13, punto 5).

const KB = 1024;
const MB = 1024 * 1024;

export function urlImagen(id: string): string {
  return `${URL_API}${RUTA_IMAGENES}/${id}`;
}

export function esGif(imagen: Imagen): boolean {
  return imagen.formato === "gif";
}

// Un elemento de relacionar es un texto o una imagen.
export function esImagen(contenido: ContenidoElemento): contenido is ImagenActividad {
  return typeof contenido !== "string";
}

// Todas las imágenes de una actividad, en el orden en que aparecen.
export function imagenesDe(actividad: Actividad): ImagenActividad[] {
  switch (actividad.tipo) {
    case "teoria":
      return actividad.imagenes ?? [];
    case "opcionMultiple":
      return [
        ...(actividad.imagen ? [actividad.imagen] : []),
        ...actividad.opciones.flatMap((opcion) => ("imagen" in opcion ? [opcion.imagen] : [])),
      ];
    case "emparejar":
      return actividad.parejas.flatMap(({ izquierda, derecha }) =>
        [izquierda, derecha].filter(esImagen),
      );
    case "clasificar":
      return actividad.elementos.flatMap((elemento) =>
        "imagen" in elemento ? [elemento.imagen] : [],
      );
    case "ordenar":
      return actividad.elementos.filter(esImagen);
    default:
      return [];
  }
}

// La suma de sus pesos, contando una vez cada imagen aunque se use en varios lugares.
export function pesoSinRepetir(imagenes: Imagen[]): number {
  const porId = new Map(imagenes.map((imagen) => [imagen.id, imagen.peso]));
  return [...porId.values()].reduce((total, peso) => total + peso, 0);
}

// "412 KB" o "2.3 MB", con KB de 1024 bytes (spec F13, "Subir una imagen").
export function formatearPeso(bytes: number): string {
  if (bytes < MB) return `${Math.max(1, Math.round(bytes / KB))} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

// "12.4": megas con un decimal, redondeados hacia arriba para que nunca diga que cabe algo
// que no cabe (spec F13, "Cuánto pesan las imágenes").
export function formatearMegas(bytes: number): string {
  return (Math.ceil((bytes / MB) * 10) / 10).toFixed(1);
}
