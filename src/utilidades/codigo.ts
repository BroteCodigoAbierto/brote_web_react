// Lo que se escribe en el campo de código y en la terminal (spec F12; brote_specs, research de
// F12, puntos 4 a 6). Son funciones puras. El móvil tiene las mismas, salvo las de la sangría,
// porque en el teléfono no hay Tab.

// El teclado puede cambiar lo que se escribe: la puntuación inteligente de iOS, o las
// sustituciones de macOS, pasan " a “ ”, -- a — y ... a …. Aquí se deshace, para que el campo
// muestre lo que se tecleó (las comillas cuentan al comparar un comando).
export function textoTecleado(texto: string): string {
  return texto
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/—/g, "--")
    .replace(/…/g, "...");
}

// Como compara la terminal: sin los espacios del inicio y del final, y con una racha de
// espacios como uno. Las mayúsculas y las comillas cuentan. Los reemplazos de textoTecleado
// son para el autor: si pegó un comando con “ ” o —, el alumno, que nunca los escribe, lo
// puede acertar igual. El backend tiene una copia para buscar comandos repetidos.
export function normalizarComando(texto: string): string {
  return textoTecleado(texto).trim().replace(/\s+/g, " ");
}

export function comandoAceptado(escrito: string, comandos: string[]): boolean {
  const normalizado = normalizarComando(escrito);
  return comandos.some((comando) => normalizarComando(comando) === normalizado);
}

// Lo que Tab o Mayús+Tab escriben en el campo: `texto` reemplaza lo que hay entre `inicio` y
// `fin`, y después la selección queda entre `seleccionInicio` y `seleccionFin`. Se escribe
// como un solo cambio, para que se pueda deshacer (research de F12, punto 4).
export type CambioSangria = {
  inicio: number;
  fin: number;
  texto: string;
  seleccionInicio: number;
  seleccionFin: number;
};

const SANGRIA = "  ";

// Las líneas completas que toca la selección. Si termina justo al empezar una línea (como al
// seleccionar con Mayús+↓), esa línea no cuenta.
function lineasDeSeleccion(valor: string, inicio: number, fin: number) {
  const finEfectivo = fin > inicio && valor[fin - 1] === "\n" ? fin - 1 : fin;
  const desde = valor.lastIndexOf("\n", inicio - 1) + 1;
  const saltoFinal = valor.indexOf("\n", finEfectivo);
  const hasta = saltoFinal === -1 ? valor.length : saltoFinal;
  return { desde, hasta, varias: valor.slice(desde, hasta).includes("\n") };
}

// Tab: sin selección (o dentro de una línea), dos espacios donde está el cursor; con varias
// líneas seleccionadas, dos espacios al inicio de cada una, y quedan seleccionadas.
export function sangrarLineas(valor: string, inicio: number, fin: number): CambioSangria {
  const { desde, hasta, varias } = lineasDeSeleccion(valor, inicio, fin);
  if (!varias) {
    const cursor = inicio + SANGRIA.length;
    return { inicio, fin, texto: SANGRIA, seleccionInicio: cursor, seleccionFin: cursor };
  }
  const texto = valor
    .slice(desde, hasta)
    .split("\n")
    .map((linea) => SANGRIA + linea)
    .join("\n");
  return {
    inicio: desde,
    fin: hasta,
    texto,
    seleccionInicio: desde,
    seleccionFin: desde + texto.length,
  };
}

// Mayús+Tab: hasta dos espacios menos al inicio de la línea del cursor o de cada línea
// seleccionada. Sin espacios que quitar, null: no hay nada que escribir ni que deshacer.
export function quitarSangria(valor: string, inicio: number, fin: number): CambioSangria | null {
  const { desde, hasta, varias } = lineasDeSeleccion(valor, inicio, fin);
  const lineas = valor.slice(desde, hasta).split("\n");
  const sinSangria = lineas.map((linea) => linea.replace(/^ {1,2}/, ""));
  const texto = sinSangria.join("\n");
  if (texto.length === hasta - desde) return null;
  if (varias) {
    return {
      inicio: desde,
      fin: hasta,
      texto,
      seleccionInicio: desde,
      seleccionFin: desde + texto.length,
    };
  }
  // en una línea, el cursor (o la selección) se corre con el texto, sin salirse de la línea
  const quitados = lineas[0].length - sinSangria[0].length;
  const correr = (posicion: number) => Math.max(desde, posicion - quitados);
  return {
    inicio: desde,
    fin: hasta,
    texto,
    seleccionInicio: correr(inicio),
    seleccionFin: correr(fin),
  };
}
