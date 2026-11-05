import { useEffect, useRef, useState } from "react";

// A dónde va el foco en las actividades de relacionar (spec F11, "Teclado"; brote_specs,
// research de F11, punto 10). Lo que se mueve pasa de un contenedor a otro, así que React lo
// desmonta y el foco se perdería: cada acción pide a dónde va, y se aplica ya pintado.
export function useFocoElementos() {
  const raiz = useRef<HTMLDivElement>(null);
  const pendiente = useRef<string | null>(null);
  const [pedidos, setPedidos] = useState(0);
  const [enfocarComprobar, setEnfocarComprobar] = useState(false);

  useEffect(() => {
    const selector = pendiente.current;
    pendiente.current = null;
    if (selector !== null) raiz.current?.querySelector<HTMLElement>(selector)?.focus();
  }, [pedidos]);

  // Con null, a "Comprobar": lo pide la actividad cuando la respuesta queda completa.
  function pedirFoco(selector: string | null) {
    setEnfocarComprobar(selector === null);
    pendiente.current = selector;
    setPedidos((antes) => antes + 1);
  }

  return { raiz, pedirFoco, enfocarComprobar };
}
