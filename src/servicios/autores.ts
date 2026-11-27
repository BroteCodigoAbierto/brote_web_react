import type { RespuestaPerfilAutor } from "../tipos/contrato.ts";
import { pedir } from "./api.ts";

export function traerPerfilAutor(idAutor: string) {
  return pedir<RespuestaPerfilAutor>(`/autores/${encodeURIComponent(idAutor)}`);
}
