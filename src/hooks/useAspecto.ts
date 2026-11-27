import { use } from "react";
import { AspectoContext, type ValorAspecto } from "../contextos/AspectoContext.ts";

export function useAspecto(): ValorAspecto {
  const valor = use(AspectoContext);
  if (!valor) throw new Error("useAspecto debe usarse dentro de <AspectoProvider>");
  return valor;
}
