import { createContext, use } from "react";
import type { IdiomaCurso } from "../tipos/contrato.ts";

// El idioma del curso (spec F14): el de la voz que lee las frases de escuchar y repetir y con
// el que se marcan para los lectores de pantalla. Lo dan el reproductor, la vista previa y el
// lienzo, para no pasarlo por las props de las trece actividades (brote_specs, plan de F14,
// "Excepciones"). Sin proveedor, español.
export const ContextoIdioma = createContext<IdiomaCurso>("es");

export function useIdioma(): IdiomaCurso {
  return use(ContextoIdioma);
}
