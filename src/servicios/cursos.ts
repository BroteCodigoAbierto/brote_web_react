import type { RespuestaCatalogo, RespuestaCurso, RespuestaError } from "../tipos/contrato.ts";
import { ErrorHttp, MENSAJE_SIN_SERVIDOR, pedir } from "./api.ts";

type ConsultaCatalogo = { q: string; despues?: string | null };

// GET /cursos: los siguientes 10 cursos publicados que coinciden con `q`, a
// partir del cursor `despues` (el `siguiente` de la respuesta anterior).
export function traerCatalogo({ q, despues }: ConsultaCatalogo) {
  const parametros = new URLSearchParams();
  if (q) parametros.set("q", q);
  if (despues) parametros.set("despues", despues);
  const consulta = parametros.toString();
  return pedir<RespuestaCatalogo>(consulta ? `/cursos?${consulta}` : "/cursos");
}

export function traerCurso(id: string) {
  return pedir<RespuestaCurso>(`/cursos/${encodeURIComponent(id)}`);
}

// El curso no existe o no está publicado: el backend responde igual a los dos.
export function esNoDisponible(error: unknown): boolean {
  return error instanceof ErrorHttp && error.estado === 404;
}

// Lo que se muestra cuando falla una carga: el mensaje del backend si lo hay
// (p. ej. un cursor inválido) o, sin red o con un 5xx, que no hay conexión.
export function leerErrorDeCarga(error: unknown): string {
  if (error instanceof ErrorHttp && error.estado < 500) {
    const cuerpo = error.cuerpo as Partial<RespuestaError> | null;
    if (cuerpo?.error) return cuerpo.error;
  }
  return MENSAJE_SIN_SERVIDOR;
}
