import { MENSAJES_AUDIOS, type RespuestaAudio, type RespuestaError } from "../tipos/contrato.ts";
import { urlAudio } from "../utilidades/audios.ts";
import { ErrorHttp, pedir } from "./api.ts";

// Los audios de los cursos (spec F14; brote_specs, contracts/api.md de F14).

// Subir un audio a un curso. El cuerpo es el archivo crudo, ya revisado por prepararAudio,
// con su tipo.
export function subirAudio(idCurso: string, archivo: Blob) {
  return pedir<RespuestaAudio>(`/editor/cursos/${encodeURIComponent(idCurso)}/audios`, {
    method: "POST",
    body: archivo,
    headers: { "Content-Type": archivo.type },
  });
}

// El mensaje del campo (spec F14, "Casos de error"): con 400, 403, 404 y 413 el servidor dice
// qué pasó; sin respuesta o con un 5xx, "No se pudo subir el audio. Inténtalo de nuevo.".
export function leerErrorDeSubidaAudio(error: unknown): string {
  if (error instanceof ErrorHttp && [400, 403, 404, 413].includes(error.estado)) {
    const cuerpo = error.cuerpo as Partial<RespuestaError> | null;
    if (cuerpo?.error) return cuerpo.error;
  }
  return MENSAJES_AUDIOS.subidaFallida;
}

// Los bytes de un audio, enteros, con la cookie de la sesión (la API responde con CORS a la
// web). `sinCache` va a la red aunque el navegador lo tenga: lo que tenía llegó dañado.
export async function traerAudio(
  id: string,
  { sinCache = false }: { sinCache?: boolean } = {},
): Promise<Blob> {
  const respuesta = await fetch(urlAudio(id), {
    credentials: "include",
    ...(sinCache && { cache: "reload" }),
  });
  if (!respuesta.ok) throw new ErrorHttp(respuesta.status, null);
  return respuesta.blob();
}
