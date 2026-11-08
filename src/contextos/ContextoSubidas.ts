import { createContext, use } from "react";

// Subir una imagen desde cualquier formulario del lienzo (spec F13). Lo da EditorLeccion con
// useEditorLeccion: empieza la subida y devuelve su id; al terminar, el reductor pone la
// imagen (o el error) en el campo que tenga ese id (brote_specs, research de F13, punto 13).
export type ValorSubidas = {
  subir: (archivo: File) => string;
};

export const ContextoSubidas = createContext<ValorSubidas | null>(null);

export function useSubidas(): ValorSubidas {
  const valor = use(ContextoSubidas);
  if (!valor) throw new Error("useSubidas va dentro de ContextoSubidas");
  return valor;
}
