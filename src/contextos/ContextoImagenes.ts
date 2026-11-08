import { createContext, use } from "react";

// Lo que comparten las imágenes de una lección (spec F13, "Cargar las imágenes al cursar").
// `intento` sube cada vez que el alumno pasa de actividad: las imágenes que no cargaron se
// vuelven a pedir solas (brote_specs, research de F13, punto 11). Sin proveedor (la vista
// previa del editor), siempre es 0.
export type ValorImagenes = { intento: number };

export const ContextoImagenes = createContext<ValorImagenes>({ intento: 0 });

export function useImagenes(): ValorImagenes {
  return use(ContextoImagenes);
}
