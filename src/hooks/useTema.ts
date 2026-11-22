import { useContext } from "react";
import { TemaContext } from "../contextos/TemaContext.ts";

export function useTema() {
  const contexto = useContext(TemaContext);
  if (!contexto) throw new Error("useTema necesita TemaProvider");
  return contexto;
}
