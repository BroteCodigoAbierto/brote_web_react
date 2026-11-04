import { MENSAJES_EDITOR } from "../tipos/contrato.ts";

// Mismas reglas que valida el backend (spec F05, "Validaciones"). Aquí solo dan
// buena experiencia: el servidor vuelve a revisar todo. Los límites no se revisan
// porque los campos no dejan escribir de más.

export type CampoCurso = "titulo" | "descripcion";
export type ErroresCurso = Partial<Record<CampoCurso, string>>;

export function validarDatosCurso(valores: Record<CampoCurso, string>): ErroresCurso {
  const errores: ErroresCurso = {};
  if (valores.titulo.trim() === "") errores.titulo = MENSAJES_EDITOR.campoObligatorio;
  if (valores.descripcion.trim() === "") errores.descripcion = MENSAJES_EDITOR.campoObligatorio;
  return errores;
}

export function validarTituloLeccion(titulo: string): string | undefined {
  return titulo.trim() === "" ? MENSAJES_EDITOR.campoObligatorio : undefined;
}
