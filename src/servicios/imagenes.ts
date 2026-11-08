import { MENSAJES_IMAGENES, type RespuestaError, type RespuestaImagen } from "../tipos/contrato.ts";
import { ErrorHttp, pedir } from "./api.ts";

// Subir una imagen a un curso (spec F13; brote_specs, contracts/api.md de F13). El cuerpo es
// el archivo crudo, ya preparado por prepararImagen, con su tipo.
export function subirImagen(idCurso: string, archivo: Blob) {
  return pedir<RespuestaImagen>(`/editor/cursos/${encodeURIComponent(idCurso)}/imagenes`, {
    method: "POST",
    body: archivo,
    headers: { "Content-Type": archivo.type },
  });
}

// El mensaje del campo (spec F13, "Casos de error"): con 400, 403, 404 y 413 el servidor
// dice qué pasó (formato, espacio, curso en revisión o eliminado); sin respuesta o con un
// 5xx, "No se pudo subir la imagen. Inténtalo de nuevo.".
export function leerErrorDeSubida(error: unknown): string {
  if (error instanceof ErrorHttp && [400, 403, 404, 413].includes(error.estado)) {
    const cuerpo = error.cuerpo as Partial<RespuestaError> | null;
    if (cuerpo?.error) return cuerpo.error;
  }
  return MENSAJES_IMAGENES.subidaFallida;
}
