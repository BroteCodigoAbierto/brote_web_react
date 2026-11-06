import { useCallback, useState } from "react";

// El ancho de un elemento, al día cuando cambia (la ventana, el inspector del editor). Lo usa
// el grafo de commits para acomodarse al ancho disponible (brote_specs, research de F12,
// punto 3). Hasta medirlo es 0.
// https://developer.mozilla.org/docs/Web/API/ResizeObserver
export function useAncho<T extends HTMLElement>(): [(elemento: T | null) => void, number] {
  const [ancho, setAncho] = useState(0);

  // un ref de callback: React lo llama al montar y, al desmontar, corre lo que devuelve
  const ref = useCallback((elemento: T | null) => {
    if (!elemento) return;
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada) setAncho(entrada.contentRect.width);
    });
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return [ref, ancho];
}
