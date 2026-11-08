import type { ValorAudio } from "./audios.ts";
import type { ValorImagen } from "./imagenes.ts";

// Los archivos en los borradores del editor: imágenes (F13) y audios (F14). Una subida tarda:
// el campo marca `subida` con un id y, al terminar, el reductor busca ese id en todos los
// borradores. Así no importa si el autor siguió escribiendo, cambió de bloque o lo movió.
// Estas funciones recorren cualquier borrador sin saber de ningún tipo (brote_specs, research
// de F13, punto 13, y de F14, punto 15).

export type ValorArchivo = ValorImagen | ValorAudio;

function esValorArchivo(valor: unknown): valor is ValorArchivo {
  const clase = (valor as { clase?: unknown } | null)?.clase;
  return typeof valor === "object" && valor !== null && (clase === "imagen" || clase === "audio");
}

// Los bytes y el id de lo que tiene el valor, sea imagen o audio.
function archivoDe(valor: ValorArchivo): { id: string; peso: number } | null {
  return valor.clase === "imagen" ? valor.imagen : valor.audio;
}

export function recorrerArchivos(valor: unknown, visitar: (archivo: ValorArchivo) => void) {
  if (esValorArchivo(valor)) {
    visitar(valor);
  } else if (Array.isArray(valor)) {
    for (const elemento of valor) recorrerArchivos(elemento, visitar);
  } else if (typeof valor === "object" && valor !== null) {
    for (const elemento of Object.values(valor)) recorrerArchivos(elemento, visitar);
  }
}

// El mismo valor con cada archivo cambiado por `cambiar`. Lo que no cambia conserva su
// identidad, para no redibujar de más.
export function reemplazarArchivos<T>(
  valor: T,
  cambiar: (archivo: ValorArchivo) => ValorArchivo,
): T {
  if (esValorArchivo(valor)) return cambiar(valor) as T;
  if (Array.isArray(valor)) {
    const nuevos = valor.map((elemento) => reemplazarArchivos(elemento, cambiar));
    return (nuevos.some((nuevo, i) => nuevo !== valor[i]) ? nuevos : valor) as T;
  }
  if (typeof valor === "object" && valor !== null) {
    const entradas = Object.entries(valor);
    const nuevas = entradas.map(([clave, elemento]) => [
      clave,
      reemplazarArchivos(elemento, cambiar),
    ]);
    const cambio = nuevas.some(([, nuevo], i) => nuevo !== entradas[i]![1]);
    return (cambio ? Object.fromEntries(nuevas) : valor) as T;
  }
  return valor;
}

// Lo recuperado al volver a entrar: lo que se estaba subiendo no llegó.
export function limpiarSubidas<T>(valor: T): T {
  return reemplazarArchivos(valor, (archivo) =>
    archivo.subida === null ? archivo : { ...archivo, subida: null },
  );
}

export function haySubidas(valor: unknown): boolean {
  let hay = false;
  recorrerArchivos(valor, ({ subida }) => {
    if (subida !== null) hay = true;
  });
  return hay;
}

// El peso de las imágenes y los audios de la lección en pantalla, sin repetir (spec F14,
// "Cuánto pesan los archivos").
export function pesoArchivos(valor: unknown): number {
  const porId = new Map<string, number>();
  recorrerArchivos(valor, (archivo) => {
    const datos = archivoDe(archivo);
    if (datos) porId.set(datos.id, datos.peso);
  });
  return [...porId.values()].reduce((total, peso) => total + peso, 0);
}

export function hayArchivos(valor: unknown): boolean {
  let hay = false;
  recorrerArchivos(valor, (archivo) => {
    if (archivoDe(archivo)) hay = true;
  });
  return hay;
}

// El id de lo que tiene el valor: los de las imágenes y los de los audios no se repiten, así
// que basta para marcar los que el servidor dijo que ya no están.
export function idDeArchivo(valor: ValorArchivo): string | null {
  return archivoDe(valor)?.id ?? null;
}
