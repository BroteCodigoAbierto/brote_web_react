import { useEffect, useRef } from "react";
import { useAmbito } from "../actividades/ambito.ts";

// Al empezar una actividad, el foco va a su consigna: el lector de pantalla la
// lee y el teclado sigue desde ahí (docs/diseno.md, sección 6, "Teclado"). En la
// vista previa no: se le quitaría al campo donde escribe el autor (F05).
export function useEnfocarAlMontar<T extends HTMLElement>() {
  const elemento = useRef<T>(null);
  const enRecuadro = useAmbito() !== null;
  useEffect(() => {
    if (!enRecuadro) elemento.current?.focus({ preventScroll: true });
  }, [enRecuadro]);
  return elemento;
}
