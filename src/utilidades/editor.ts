import { MENSAJES_EDITOR } from "../tipos/contrato.ts";

// Presentación y datos locales del editor (spec F05). Solo existe en la web.

// Lo que se ve arriba del mapa después de que el curso cambia de estado (spec F06).
export type AvisoEstado = {
  texto: string;
  tono: "exito" | "error";
};

let siguienteId = 0;

// Para las filas de un borrador: nunca viaja, solo distingue filas entre sí.
export function idLocal(): string {
  siguienteId += 1;
  return `${Date.now().toString(36)}-${siguienteId}`;
}

// Marca desde la segunda aparición de cada texto, con `clave.<id>`. Se compara recortado,
// respetando las mayúsculas, como las opciones (spec F05). Los vacíos tienen su propio error.
export function marcarRepetidos<T extends { id: string }>(
  filas: T[],
  leerTexto: (fila: T) => string,
  clave: string,
  mensaje: string,
  errores: Record<string, string>,
) {
  const vistos = new Set<string>();
  for (const fila of filas) {
    const texto = leerTexto(fila).trim();
    if (texto === "") continue;
    if (vistos.has(texto)) errores[`${clave}.${fila.id}`] = mensaje;
    vistos.add(texto);
  }
}

export function textoCantidadActividades(cantidad: number): string {
  if (cantidad === 0) return "Sin actividades";
  if (cantidad === 1) return "1 actividad";
  return `${cantidad} actividades`;
}

// El backend responde el mismo texto: la web lo necesita antes de preguntar nada.
export function textoLeccionesVacias(cantidad: number): string {
  if (cantidad === 1) return MENSAJES_EDITOR.unaLeccionVacia;
  return MENSAJES_EDITOR.leccionesVacias.replace("{n}", String(cantidad));
}

export function textoIncompletas(cantidad: number): string {
  if (cantidad === 1) return "hay 1 actividad incompleta.";
  return `hay ${cantidad} actividades incompletas.`;
}
