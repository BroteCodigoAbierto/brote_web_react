import { useEffect, useEffectEvent } from "react";
import { useAmbito } from "../actividades/ambito.ts";

// Las teclas de una actividad (1 a 9, Enter). En el reproductor valen en toda la
// página; en un ámbito, solo con el foco dentro (spec F05, "Vista previa").
export function useTeclasActividad(manejador: (evento: KeyboardEvent) => void) {
  const ambito = useAmbito();

  const alTeclear = useEffectEvent((evento: KeyboardEvent) => {
    if (ambito && !ambito.contenedor.current?.contains(evento.target as Node | null)) return;
    manejador(evento);
  });

  useEffect(() => {
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, []);
}
