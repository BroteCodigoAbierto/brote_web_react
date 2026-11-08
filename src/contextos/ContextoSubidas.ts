import { createContext, use } from "react";

// Subir una imagen (F13) o un audio (F14) desde cualquier formulario del lienzo. Lo da
// EditorLeccion con useEditorLeccion: empieza la subida y devuelve su id; al terminar, el
// reductor pone el archivo (o el error) en el campo que tenga ese id (brote_specs, research de
// F13, punto 13, y de F14, punto 15).
export type ValorSubidas = {
  subir: (archivo: File) => string;
  subirAudio: (archivo: File) => string;
};

export const ContextoSubidas = createContext<ValorSubidas | null>(null);

export function useSubidas(): ValorSubidas {
  const valor = use(ContextoSubidas);
  if (!valor) throw new Error("useSubidas va dentro de ContextoSubidas");
  return valor;
}
