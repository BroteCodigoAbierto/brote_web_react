import {
  MARCA_ESPACIO,
  type ActividadCompletarEspacios,
  type EspacioRespuesta,
  type OpcionRespuesta,
} from "../tipos/contrato.ts";

// Reglas de las actividades que no vienen del backend: cómo se compara lo
// escrito, cómo se mezclan las opciones y cómo se parte el texto (brote_specs,
// research de F03, puntos 3, 4, 12 y 13). El móvil tiene las mismas funciones,
// para que una respuesta valga lo mismo en los dos.

// Sin mayúsculas, acentos ni espacios de más; la ñ cuenta como n (igual que la
// búsqueda de F02). Los signos no se tocan: ">" y "<" siguen siendo distintos.
export function normalizarRespuesta(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("es")
    .trim()
    .replace(/\s+/g, " ");
}

// Se compara la respuesta completa: "canciones" no es "canción".
export function esAceptada(escrito: string, espacio: EspacioRespuesta): boolean {
  const normalizado = normalizarRespuesta(escrito);
  return espacio.aceptadas.some((aceptada) => normalizarRespuesta(aceptada) === normalizado);
}

// Copia mezclada al azar (Fisher-Yates).
export function mezclar<T>(lista: readonly T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// n marcas → n + 1 trozos; entre cada dos trozos va un espacio.
export function partirEnEspacios(texto: string): string[] {
  return texto.split(MARCA_ESPACIO);
}

// El texto con cada espacio lleno con su respuesta esperada (la primera aceptada).
export function textoConRespuestas({ texto, espacios }: ActividadCompletarEspacios): string {
  return partirEnEspacios(texto).reduce((resultado, trozo, i) =>
    i === 0 ? trozo : resultado + (espacios[i - 1]?.aceptadas[0] ?? "") + trozo,
  );
}

// Un renglón en blanco separa un párrafo del siguiente.
export function partirParrafos(texto: string): string[] {
  return texto.split(/\n\s*\n/).filter((parrafo) => parrafo.trim() !== "");
}

export type TipoLineaCodigo = "agregada" | "eliminada" | "encabezado" | "normal";

// Las mismas reglas que el prototipo: "+" (pero no "+++"), "-" (pero no "---") y "@@".
export function tipoLineaCodigo(linea: string): TipoLineaCodigo {
  if (/^\+(?!\+\+)/.test(linea)) return "agregada";
  if (/^-(?!--)/.test(linea)) return "eliminada";
  if (/^@@/.test(linea)) return "encabezado";
  return "normal";
}

export function textoOpcion(opcion: OpcionRespuesta): string {
  return "simbolo" in opcion ? opcion.simbolo : opcion.texto;
}
