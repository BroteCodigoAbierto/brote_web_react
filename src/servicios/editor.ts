import type {
  CuerpoDatosCurso,
  CuerpoGuardarLeccion,
  CuerpoNuevaLeccion,
  RespuestaCursoEnEditor,
  RespuestaCursosDelAutor,
  RespuestaError,
  RespuestaLeccionEnEditor,
  RespuestaLeccionEnMapa,
} from "../tipos/contrato.ts";
import { ErrorHttp, MENSAJE_SIN_SERVIDOR, pedir } from "./api.ts";
import { leerErrorDeEnvio, type ErrorDeEnvio } from "./sesion.ts";

// El editor de cursos (spec F05). Los errores al abrir (404) usan esNoDisponible y
// leerErrorDeCarga de servicios/cursos.ts, porque significan lo mismo.

function rutaCurso(idCurso: string): string {
  return `/editor/cursos/${encodeURIComponent(idCurso)}`;
}

function rutaLeccion(idCurso: string, idLeccion: string): string {
  return `${rutaCurso(idCurso)}/lecciones/${encodeURIComponent(idLeccion)}`;
}

export function traerCursosDelAutor() {
  return pedir<RespuestaCursosDelAutor>("/usuarios/yo/cursos");
}

export function crearCurso(cuerpo: CuerpoDatosCurso) {
  return pedir<RespuestaCursoEnEditor>("/editor/cursos", {
    method: "POST",
    body: JSON.stringify(cuerpo),
  });
}

export function traerCursoEnEditor(idCurso: string) {
  return pedir<RespuestaCursoEnEditor>(rutaCurso(idCurso));
}

export function actualizarCurso(idCurso: string, cuerpo: CuerpoDatosCurso) {
  return pedir<RespuestaCursoEnEditor>(rutaCurso(idCurso), {
    method: "PUT",
    body: JSON.stringify(cuerpo),
  });
}

export function borrarCurso(idCurso: string) {
  return pedir<void>(rutaCurso(idCurso), { method: "DELETE" });
}

export function crearLeccion(idCurso: string, cuerpo: CuerpoNuevaLeccion) {
  return pedir<RespuestaLeccionEnMapa>(`${rutaCurso(idCurso)}/lecciones`, {
    method: "POST",
    body: JSON.stringify(cuerpo),
  });
}

export function ordenarLecciones(idCurso: string, idsLecciones: string[]) {
  return pedir<RespuestaCursoEnEditor>(`${rutaCurso(idCurso)}/lecciones-orden`, {
    method: "PUT",
    body: JSON.stringify({ idsLecciones }),
  });
}

export function traerLeccionEnEditor(idCurso: string, idLeccion: string) {
  return pedir<RespuestaLeccionEnEditor>(rutaLeccion(idCurso, idLeccion));
}

export function guardarLeccion(idCurso: string, idLeccion: string, cuerpo: CuerpoGuardarLeccion) {
  return pedir<RespuestaLeccionEnEditor>(rutaLeccion(idCurso, idLeccion), {
    method: "PUT",
    body: JSON.stringify(cuerpo),
  });
}

export function borrarLeccion(idCurso: string, idLeccion: string) {
  return pedir<void>(rutaLeccion(idCurso, idLeccion), { method: "DELETE" });
}

function tieneEstado(error: unknown, estado: number): boolean {
  return error instanceof ErrorHttp && error.estado === estado;
}

// El curso es de quien llama, pero está publicado (spec F05).
export function esCursoPublicado(error: unknown): boolean {
  return tieneEstado(error, 403);
}

// Otra pestaña cambió la lección o la lista de lecciones.
export function esConflicto(error: unknown): boolean {
  return tieneEstado(error, 409);
}

// pedir() ya avisó a la sesión; aquí solo se decide guardar lo capturado.
export function esSesionPerdida(error: unknown): boolean {
  return tieneEstado(error, 401);
}

// Con 403 y 404 el servidor sabe qué pasó (curso publicado o eliminado); en
// cualquier otro caso se muestra el mensaje de esa acción.
export function leerErrorDeAccion(error: unknown, respaldo: string): string {
  if (error instanceof ErrorHttp && (error.estado === 403 || error.estado === 404)) {
    const cuerpo = error.cuerpo as Partial<RespuestaError> | null;
    if (cuerpo?.error) return cuerpo.error;
  }
  return respaldo;
}

// Para useFormulario: como siempre, pero sin red dice el mensaje de esa acción.
export function leerErrorDeFormulario(error: unknown, respaldo: string): ErrorDeEnvio {
  const leido = leerErrorDeEnvio(error);
  return leido.general === MENSAJE_SIN_SERVIDOR ? { general: respaldo } : leido;
}
