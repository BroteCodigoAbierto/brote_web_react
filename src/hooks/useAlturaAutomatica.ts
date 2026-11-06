import { useLayoutEffect, useRef } from "react";

// Un textarea que crece con su texto, como la línea de la terminal: un comando largo pasa a la
// línea siguiente y se lee completo mientras se escribe (spec F12, "Terminal"). Se mide antes
// de pintar, para que no salte.
export function useAlturaAutomatica(valor: string) {
  const elemento = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const area = elemento.current;
    if (!area) return;
    area.style.height = "auto";
    area.style.height = `${area.scrollHeight}px`;
  }, [valor]);

  return elemento;
}
