import { createContext, use, type RefObject } from "react";

// Dónde vive una actividad. En el reproductor ocupa la pantalla y el ámbito es
// null: todo funciona como en F03. En la vista previa del editor vive en un
// recuadro junto a un formulario, y entonces no toma el foco, sus teclas solo
// actúan dentro y su barra de respuesta va en línea (brote_specs, research de F05,
// punto 11). Los componentes de cada actividad no se enteran.
export type Ambito = {
  contenedor: RefObject<HTMLElement | null>;
};

export const AmbitoActividad = createContext<Ambito | null>(null);

export function useAmbito(): Ambito | null {
  return use(AmbitoActividad);
}
