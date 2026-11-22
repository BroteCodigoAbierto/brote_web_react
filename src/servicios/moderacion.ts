import type {
  CuerpoRechazo,
  RespuestaCursoEnModeracion,
  RespuestaCursosEnRevision,
  RespuestaError,
} from "../tipos/contrato.ts";
import { ErrorHttp, pedir } from "./api.ts";

// Moderación (decisión 0018 de brote_specs): solo la usa quien es administrador.

function rutaCurso(idCurso: string): string {
  return `/moderacion/cursos/${encodeURIComponent(idCurso)}`;
}

export function traerCursosEnRevision() {
  return pedir<RespuestaCursosEnRevision>("/moderacion/cursos");
}

export function traerCursoEnModeracion(idCurso: string) {
  return pedir<RespuestaCursoEnModeracion>(rutaCurso(idCurso));
}

export function aprobarCurso(idCurso: string) {
  return pedir<void>(`${rutaCurso(idCurso)}/aprobacion`, { method: "POST" });
}

export function rechazarCurso(idCurso: string, cuerpo: CuerpoRechazo) {
  return pedir<void>(`${rutaCurso(idCurso)}/rechazo`, {
    method: "POST",
    body: JSON.stringify(cuerpo),
  });
}

// 404 o 409: el curso ya no existe o alguien más ya decidió; no tiene caso reintentar.
export function yaNoEnRevision(error: unknown): boolean {
  return error instanceof ErrorHttp && (error.estado === 404 || error.estado === 409);
}

// Con 400, 403, 404 y 409 el servidor dice qué pasó; sin red o con un 5xx, el respaldo.
export function leerErrorDeModeracion(error: unknown, respaldo: string): string {
  if (error instanceof ErrorHttp && [400, 403, 404, 409].includes(error.estado)) {
    const cuerpo = error.cuerpo as Partial<RespuestaError> | null;
    if (cuerpo?.error) return cuerpo.error;
  }
  return respaldo;
}
