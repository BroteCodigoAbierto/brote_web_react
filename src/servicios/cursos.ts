import type {
  CategoriaCurso,
  CuerpoReporteActividad,
  IdiomaCurso,
  NivelCurso,
  OrdenCatalogo,
  ReporteActividad,
  RespuestaCatalogo,
  RespuestaCurso,
  RespuestaError,
} from "../tipos/contrato.ts";
import { ErrorHttp, MENSAJE_SIN_SERVIDOR, pedir } from "./api.ts";

export type FiltrosCatalogo = {
  q: string;
  categoria?: CategoriaCurso | null;
  nivel?: NivelCurso | null;
  idioma?: IdiomaCurso | null;
  orden?: OrdenCatalogo;
  ocultarCompletados?: boolean;
  organizacion?: string | null;
};

type ConsultaCatalogo = FiltrosCatalogo & { despues?: string | null };

// GET /cursos: cursos publicados con filtros de exploración y silo opcional (F02 + F16).
export function traerCatalogo({
  q,
  categoria,
  nivel,
  idioma,
  orden,
  ocultarCompletados,
  organizacion,
  despues,
}: ConsultaCatalogo) {
  const parametros = new URLSearchParams();
  if (q) parametros.set("q", q);
  if (categoria) parametros.set("categoria", categoria);
  if (nivel) parametros.set("nivel", nivel);
  if (idioma) parametros.set("idioma", idioma);
  if (orden && orden !== "destacados") parametros.set("orden", orden);
  if (ocultarCompletados) parametros.set("ocultarCompletados", "1");
  if (organizacion) parametros.set("organizacion", organizacion);
  if (despues) parametros.set("despues", despues);
  const consulta = parametros.toString();
  return pedir<RespuestaCatalogo>(consulta ? `/cursos?${consulta}` : "/cursos");
}

export function traerCurso(id: string, clave?: string | null) {
  const ruta = `/cursos/${encodeURIComponent(id)}`;
  return pedir<RespuestaCurso>(clave ? `${ruta}?clave=${encodeURIComponent(clave)}` : ruta);
}

export function traerCursoPorEnlace(clave: string) {
  return pedir<RespuestaCurso>(`/cursos/enlace/${encodeURIComponent(clave)}`);
}

export function reportarActividad(
  idCurso: string,
  idLeccion: string,
  cuerpo: CuerpoReporteActividad,
) {
  return pedir<{ reporte: ReporteActividad }>(
    `/cursos/${encodeURIComponent(idCurso)}/lecciones/${encodeURIComponent(idLeccion)}/reportes`,
    {
      method: "POST",
      body: JSON.stringify(cuerpo),
    },
  );
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
