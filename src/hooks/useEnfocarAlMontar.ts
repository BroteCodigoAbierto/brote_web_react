import { useEffect, useRef } from "react";

// Al empezar una actividad, el foco va a su consigna: el lector de pantalla la
// lee y el teclado sigue desde ahí (docs/diseno.md, sección 6, "Teclado").
export function useEnfocarAlMontar<T extends HTMLElement>() {
  const elemento = useRef<T>(null);
  useEffect(() => {
    elemento.current?.focus({ preventScroll: true });
  }, []);
  return elemento;
}
