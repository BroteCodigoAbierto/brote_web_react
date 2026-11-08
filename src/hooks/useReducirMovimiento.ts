import { useSyncExternalStore } from "react";

// "Reducir movimiento" del sistema (docs/diseno.md, sección 1). En CSS basta la media
// query; los GIF de F13 lo necesitan en JavaScript para empezar en pausa.
const CONSULTA = "(prefers-reduced-motion: reduce)";

function suscribir(avisar: () => void) {
  const medios = window.matchMedia(CONSULTA);
  medios.addEventListener("change", avisar);
  return () => medios.removeEventListener("change", avisar);
}

export function useReducirMovimiento(): boolean {
  return useSyncExternalStore(suscribir, () => window.matchMedia(CONSULTA).matches);
}
