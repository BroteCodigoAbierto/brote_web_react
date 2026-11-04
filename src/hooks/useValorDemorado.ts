import { useEffect, useState } from "react";

// Devuelve `valor` cuando deja de cambiar. Hay que pasarle algo que no cambie en
// cada render, como un texto (brote_specs, research de F05, punto 11).
export function useValorDemorado<T>(valor: T, espera = 300): T {
  const [demorado, setDemorado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setDemorado(valor), espera);
    return () => clearTimeout(temporizador);
  }, [valor, espera]);

  return demorado;
}
