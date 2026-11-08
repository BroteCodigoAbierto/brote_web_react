import { MENSAJES_IMAGENES, type Imagen, type ImagenActividad } from "../tipos/contrato.ts";

// Las imágenes en los borradores del editor (spec F13; brote_specs, research de F13, punto
// 13). Una subida tarda: el campo marca `subida` con un id y, al terminar, el reductor busca
// ese id en todos los borradores. Así no importa si el autor siguió escribiendo, cambió de
// bloque o lo movió. Estas funciones recorren cualquier borrador sin saber de ningún tipo.

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

function esValorImagen(valor: unknown): valor is ValorImagen {
  return (
    typeof valor === "object" && valor !== null && (valor as { clase?: unknown }).clase === "imagen"
  );
}

export function recorrerImagenes(valor: unknown, visitar: (imagen: ValorImagen) => void) {
  if (esValorImagen(valor)) {
    visitar(valor);
  } else if (Array.isArray(valor)) {
    for (const elemento of valor) recorrerImagenes(elemento, visitar);
  } else if (typeof valor === "object" && valor !== null) {
    for (const elemento of Object.values(valor)) recorrerImagenes(elemento, visitar);
  }
}

// El mismo valor con cada imagen cambiada por `cambiar`. Lo que no cambia conserva su
// identidad, para no redibujar de más.
export function reemplazarImagenes<T>(valor: T, cambiar: (imagen: ValorImagen) => ValorImagen): T {
  if (esValorImagen(valor)) return cambiar(valor) as T;
  if (Array.isArray(valor)) {
    const nuevos = valor.map((elemento) => reemplazarImagenes(elemento, cambiar));
    return (nuevos.some((nuevo, i) => nuevo !== valor[i]) ? nuevos : valor) as T;
  }
  if (typeof valor === "object" && valor !== null) {
    const entradas = Object.entries(valor);
    const nuevas = entradas.map(([clave, elemento]) => [
      clave,
      reemplazarImagenes(elemento, cambiar),
    ]);
    const cambio = nuevas.some(([, nuevo], i) => nuevo !== entradas[i]![1]);
    return (cambio ? Object.fromEntries(nuevas) : valor) as T;
  }
  return valor;
}

// Lo recuperado al volver a entrar: la imagen que se estaba subiendo no llegó.
export function limpiarSubidas<T>(valor: T): T {
  return reemplazarImagenes(valor, (imagen) =>
    imagen.subida === null ? imagen : { ...imagen, subida: null },
  );
}

export function haySubidas(valor: unknown): boolean {
  let hay = false;
  recorrerImagenes(valor, ({ subida }) => {
    if (subida !== null) hay = true;
  });
  return hay;
}

// El peso de las imágenes de la lección en pantalla, sin repetir (spec F13, "Cuánto pesan
// las imágenes").
export function pesoImagenes(valor: unknown): number {
  const porId = new Map<string, number>();
  recorrerImagenes(valor, ({ imagen }) => {
    if (imagen) porId.set(imagen.id, imagen.peso);
  });
  return [...porId.values()].reduce((total, peso) => total + peso, 0);
}

export function hayImagenes(valor: unknown): boolean {
  let hay = false;
  recorrerImagenes(valor, ({ imagen }) => {
    if (imagen) hay = true;
  });
  return hay;
}
