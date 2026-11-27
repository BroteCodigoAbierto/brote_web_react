import type {
  CuerpoCrearGrupo,
  CuerpoUnirseGrupo,
  RespuestaAvanceGrupo,
  RespuestaGrupo,
  RespuestaGrupos,
} from "../tipos/contrato.ts";
import { pedir } from "./api.ts";

export function traerMisGrupos() {
  return pedir<RespuestaGrupos>("/grupos");
}

export function crearGrupo(cuerpo: CuerpoCrearGrupo) {
  return pedir<RespuestaGrupo>("/grupos", {
    method: "POST",
    body: JSON.stringify(cuerpo),
  });
}

export function unirseAGrupo(cuerpo: CuerpoUnirseGrupo) {
  return pedir<RespuestaGrupo>("/grupos/unirse", {
    method: "POST",
    body: JSON.stringify(cuerpo),
  });
}

export function traerAvanceGrupo(idGrupo: string) {
  return pedir<RespuestaAvanceGrupo>(`/grupos/${encodeURIComponent(idGrupo)}/avance`);
}
