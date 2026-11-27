import type {
  CuerpoCrearOrganizacion,
  CuerpoUnirseOrganizacion,
  RespuestaOrganizacion,
  RespuestaOrganizaciones,
  RespuestaOrganizacionPublica,
} from "../tipos/contrato.ts";
import { pedir } from "./api.ts";

export function traerMisOrganizaciones() {
  return pedir<RespuestaOrganizaciones>("/organizaciones/mias");
}

export function crearOrganizacion(cuerpo: CuerpoCrearOrganizacion) {
  return pedir<RespuestaOrganizacion>("/organizaciones", {
    method: "POST",
    body: JSON.stringify(cuerpo),
  });
}

export function unirseAOrganizacion(cuerpo: CuerpoUnirseOrganizacion) {
  return pedir<RespuestaOrganizacion>("/organizaciones/unirse", {
    method: "POST",
    body: JSON.stringify(cuerpo),
  });
}

export function traerOrganizacionPorSlug(slug: string) {
  return pedir<RespuestaOrganizacionPublica>(`/organizaciones/${encodeURIComponent(slug)}`);
}
