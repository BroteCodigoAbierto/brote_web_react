import { MENSAJES_IMAGENES, type Imagen, type ImagenActividad } from "../tipos/contrato.ts";

// Las imágenes en los borradores del editor (spec F13; brote_specs, research de F13, punto
// 13). Desde F14, lo que comparten con los audios (las subidas, el peso de la lección y los
// recorridos de cualquier borrador) está en editor/archivos.ts.

export type ValorImagen = {
  clase: "imagen";
  imagen: Imagen | null;
  textoAlternativo: string;
  // el id de la subida en curso, si hay una
  subida: string | null;
  // el error de la última subida; la imagen anterior se queda
  error: string | null;
  // el servidor dijo que ya no está (se borró en otra pestaña o por vieja)
  perdida: boolean;
};

export function valorVacio(): ValorImagen {
  return {
    clase: "imagen",
    imagen: null,
    textoAlternativo: "",
    subida: null,
    error: null,
    perdida: false,
  };
}

export function aValorImagen(imagen?: ImagenActividad): ValorImagen {
  if (!imagen) return valorVacio();
  const { textoAlternativo = "", ...datos } = imagen;
  return { ...valorVacio(), imagen: datos, textoAlternativo };
}

// Solo con una imagen: quien llama ya comprobó que no hay errores.
export function aImagenActividad({ imagen, textoAlternativo }: ValorImagen): ImagenActividad {
  const alternativo = textoAlternativo.trim();
  return { ...imagen!, ...(alternativo !== "" && { textoAlternativo: alternativo }) };
}

// El error que hace la actividad incompleta. El de una subida fallida no: se ve en el
// campo, pero la imagen anterior sigue ahí.
export function errorImagen(valor: ValorImagen): string | undefined {
  if (valor.perdida) return MENSAJES_IMAGENES.imagenNoEsta;
  if (!valor.imagen) return MENSAJES_IMAGENES.imagenFalta;
  return undefined;
}

// Los ids que se repiten en un grupo (opciones, una columna, los elementos).
export function idsRepetidos(valores: ValorImagen[]): Set<string> {
  const vistos = new Set<string>();
  const repetidos = new Set<string>();
  for (const { imagen } of valores) {
    if (!imagen) continue;
    if (vistos.has(imagen.id)) repetidos.add(imagen.id);
    vistos.add(imagen.id);
  }
  return repetidos;
}

// Como marcarRepetidos con los textos: la segunda imagen igual de un grupo lleva el error.
export function marcarImagenesRepetidas<T extends { id: string }>(
  filas: T[],
  leer: (fila: T) => ValorImagen,
  clave: string,
  errores: Record<string, string>,
) {
  const vistas = new Set<string>();
  for (const fila of filas) {
    const { imagen } = leer(fila);
    if (!imagen) continue;
    if (vistas.has(imagen.id)) errores[`${clave}.${fila.id}`] ??= MENSAJES_IMAGENES.imagenRepetida;
    vistas.add(imagen.id);
  }
}
