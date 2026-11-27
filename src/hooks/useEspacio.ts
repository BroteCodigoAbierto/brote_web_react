import { use } from "react";
import { EspacioContext, type ValorEspacio } from "../contextos/EspacioContext.ts";

export function useEspacio(): ValorEspacio {
  const valor = use(EspacioContext);
  if (!valor) throw new Error("useEspacio debe usarse dentro de <EspacioProvider>");
  return valor;
}
