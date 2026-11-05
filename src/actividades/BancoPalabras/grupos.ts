import { idLocal } from "../../utilidades/editor.ts";
import type { FilaTexto } from "../tipos.ts";

// Las fichas que valen en cada espacio, atadas a los ___ del texto. Se apuntan por id: así
// corregir el texto de una ficha conserva sus marcas (research de F11, punto 9).

export type GrupoFichas = {
  id: string;
  idFichas: string[];
};

export function crearGrupoFichas(): GrupoFichas {
  return { id: idLocal(), idFichas: [] };
}

export function esGrupoSinMarcas({ idFichas }: GrupoFichas): boolean {
  return idFichas.length === 0;
}

// Las palabras del banco, sin repetir y sin las fichas vacías: una casilla por palabra.
export function palabrasDelBanco(fichas: FilaTexto[]): string[] {
  return [...new Set(fichas.map(({ texto }) => texto.trim()).filter((texto) => texto !== ""))];
}

function idsDe(fichas: FilaTexto[], palabra: string): string[] {
  return fichas.filter(({ texto }) => texto.trim() === palabra).map(({ id }) => id);
}

export function palabraMarcada(grupo: GrupoFichas, fichas: FilaTexto[], palabra: string): boolean {
  return idsDe(fichas, palabra).some((id) => grupo.idFichas.includes(id));
}

// Marcar una palabra marca todas las fichas con ese texto: da igual cuál coloque el alumno.
export function alternarPalabra(
  grupo: GrupoFichas,
  fichas: FilaTexto[],
  palabra: string,
): GrupoFichas {
  const ids = idsDe(fichas, palabra);
  const restantes = grupo.idFichas.filter((id) => !ids.includes(id));
  const marcada = palabraMarcada(grupo, fichas, palabra);
  return { ...grupo, idFichas: marcada ? restantes : [...restantes, ...ids] };
}
