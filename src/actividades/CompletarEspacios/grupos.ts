import { partirEnEspacios } from "../../utilidades/actividades.ts";
import { idLocal } from "../../utilidades/editor.ts";
import type { FilaTexto } from "../tipos.ts";

// Los grupos de respuestas de completar espacios, atados a los ___ del texto.

export type GrupoRespuestas = {
  id: string;
  aceptadas: FilaTexto[];
};

export function contarEspacios(texto: string): number {
  return partirEnEspacios(texto).length - 1;
}

export function esGrupoVacio({ aceptadas }: GrupoRespuestas): boolean {
  return aceptadas.every(({ texto }) => texto.trim() === "");
}

export function crearGrupo(): GrupoRespuestas {
  return { id: idLocal(), aceptadas: [{ id: idLocal(), texto: "" }] };
}

type ComoAjustarGrupos<G> = {
  esVacio: (grupo: G) => boolean;
  crear: () => G;
};

// Un grupo por cada ___. Si sobran, solo desaparecen los vacíos: los que tienen algo
// los quita el autor, que sabe cuál sobra (spec F05, "Formulario de cada tipo"). Lo usan
// completar espacios y banco de palabras.
export function ajustarGrupos<G>(
  texto: string,
  grupos: G[],
  { esVacio, crear }: ComoAjustarGrupos<G>,
): G[] {
  const marcas = contarEspacios(texto);
  if (grupos.length < marcas) {
    return [...grupos, ...Array.from({ length: marcas - grupos.length }, crear)];
  }
  let sobran = grupos.length - marcas;
  return grupos
    .toReversed()
    .filter((grupo) => {
      if (sobran === 0 || !esVacio(grupo)) return true;
      sobran -= 1;
      return false;
    })
    .toReversed();
}
