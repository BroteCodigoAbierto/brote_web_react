import type { RespuestaConfiguracion } from "../tipos/contrato.ts";
import { pedir } from "./api.ts";

export function traerConfiguracionInstancia() {
  return pedir<RespuestaConfiguracion>("/configuracion");
}
