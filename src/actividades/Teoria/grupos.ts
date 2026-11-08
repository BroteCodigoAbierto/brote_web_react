import { aValorImagen, type ValorImagen } from "../../editor/imagenes.ts";
import { MARCA_IMAGEN } from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";

// Las imágenes de la teoría en el editor, una por cada [imagen] del texto (spec F13,
// "Teoría"), como los grupos de completar espacios con sus ___.

export type GrupoImagen = {
  id: string;
  valor: ValorImagen;
};

export function contarMarcasImagen(texto: string): number {
  return texto.split(MARCA_IMAGEN).length - 1;
}

export function crearGrupoImagen(): GrupoImagen {
  return { id: idLocal(), valor: aValorImagen() };
}

function esGrupoVacio({ valor }: GrupoImagen): boolean {
  return valor.imagen === null && valor.subida === null;
}

// Un grupo por cada marca. Si sobran, solo desaparecen los vacíos: los que tienen imagen los
// quita el autor, que sabe cuál sobra.
export function ajustarImagenes(texto: string, grupos: GrupoImagen[]): GrupoImagen[] {
  const marcas = contarMarcasImagen(texto);
  if (grupos.length < marcas) {
    return [...grupos, ...Array.from({ length: marcas - grupos.length }, crearGrupoImagen)];
  }
  let sobran = grupos.length - marcas;
  return grupos
    .toReversed()
    .filter((grupo) => {
      if (sobran === 0 || !esGrupoVacio(grupo)) return true;
      sobran -= 1;
      return false;
    })
    .toReversed();
}
