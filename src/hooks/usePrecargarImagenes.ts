import { useEffect } from "react";
import type { Actividad } from "../tipos/contrato.ts";
import { esGif, imagenesDe, urlImagen } from "../utilidades/imagenes.ts";

// Al abrir la lección, todas sus imágenes, sin esperarlas (spec F13, "Aclaraciones"): así,
// si después se pierde la conexión, lo que ya llegó se sigue viendo. La caché del navegador
// las guarda (la API las sirve con `immutable`). Los GIF van con fetch porque así los pide
// ImagenCurso para pausarlos, y un <img> y un fetch con CORS no comparten la entrada de la
// caché (research de F13, punto 11).
export function usePrecargarImagenes(actividades: Actividad[]) {
  useEffect(() => {
    const vistas = new Set<string>();
    const precargas: HTMLImageElement[] = [];
    for (const imagen of actividades.flatMap(imagenesDe)) {
      if (vistas.has(imagen.id)) continue;
      vistas.add(imagen.id);
      if (esGif(imagen)) {
        void fetch(urlImagen(imagen.id), { credentials: "include" }).catch(() => undefined);
      } else {
        const precarga = new Image();
        precarga.src = urlImagen(imagen.id);
        precargas.push(precarga);
      }
    }
    return () => {
      // al salir de la lección, lo que no llegó ya no hace falta
      for (const precarga of precargas) precarga.src = "";
    };
  }, [actividades]);
}
