import { useEffect } from "react";
import type { AlmacenAudios } from "../contextos/ContextoAudios.ts";
import type { Actividad } from "../tipos/contrato.ts";
import { audiosDe } from "../utilidades/audios.ts";

// Al abrir la lección, todos sus audios, sin esperarlos (spec F14, "Cargar el audio al
// cursar"), como las imágenes. Cuando sube `intento` (al pasar de actividad), otra vez: el
// almacén solo vuelve a pedir los que fallaron. Recibe el almacén porque lo llama el
// reproductor, que es quien lo da (brote_specs, research de F14, punto 11).
export function usePrecargarAudios(
  almacen: AlmacenAudios,
  actividades: Actividad[],
  intento: number,
) {
  useEffect(() => {
    for (const audio of actividades.flatMap(audiosDe)) {
      void almacen.traer(audio).catch(() => undefined);
    }
  }, [almacen, actividades, intento]);
}
