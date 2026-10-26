import type {
  CuerpoCrearCuenta,
  CuerpoEntrar,
  RespuestaError,
  RespuestaUsuario,
} from "../tipos/contrato.ts";
import { ErrorHttp, pedir } from "./api.ts";

export const MENSAJE_SIN_SERVIDOR = "No se pudo conectar con Brote. Inténtalo de nuevo en un momento.";

export function crearCuenta(cuerpo: CuerpoCrearCuenta) {
  return pedir<RespuestaUsuario>("/cuentas", { method: "POST", body: JSON.stringify(cuerpo) });
}

export function entrar(cuerpo: CuerpoEntrar) {
  return pedir<RespuestaUsuario>("/sesiones", { method: "POST", body: JSON.stringify(cuerpo) });
}

export function cerrarSesion() {
  return pedir<void>("/sesiones/actual", { method: "DELETE" });
}

export function traerYo() {
  return pedir<RespuestaUsuario>("/usuarios/yo");
}

export type ErrorDeEnvio = { general?: string; campos?: Record<string, string> };

// Convierte lo que lanzó un envío en lo que muestra el formulario: errores
// junto a cada campo o un mensaje general arriba.
export function leerErrorDeEnvio(error: unknown): ErrorDeEnvio {
  if (error instanceof ErrorHttp && error.estado < 500) {
    const cuerpo = error.cuerpo as Partial<RespuestaError> | null;
    if (cuerpo?.campos && Object.keys(cuerpo.campos).length > 0) return { campos: cuerpo.campos };
    if (cuerpo?.error) return { general: cuerpo.error };
  }
  // fetch lanza TypeError sin red o con el servidor apagado; un 5xx es lo mismo
  // para quien usa la web
  return { general: MENSAJE_SIN_SERVIDOR };
}
