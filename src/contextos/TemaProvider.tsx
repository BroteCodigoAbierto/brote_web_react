import { useReducer, type ReactNode } from "react";
import type { PreferenciaTema } from "../constantes/temas.ts";
import { aplicarTema, guardarTema, leerTema } from "../servicios/almacenTema.ts";
import { reducirTema, TemaContext } from "./TemaContext.ts";

type PropsTemaProvider = { children: ReactNode };
export default function TemaProvider({ children }: PropsTemaProvider) {
  const [estado, dispatch] = useReducer(reducirTema, undefined, () => ({
    preferencia: leerTema(),
    estado: "listo" as const,
  }));
  function cambiar(preferencia: PreferenciaTema) {
    aplicarTema(preferencia);
    try {
      guardarTema(preferencia);
      dispatch({ preferencia, estado: "guardado" });
    } catch {
      dispatch({ preferencia, estado: "error" });
    }
  }
  return <TemaContext value={{ ...estado, cambiar }}>{children}</TemaContext>;
}
