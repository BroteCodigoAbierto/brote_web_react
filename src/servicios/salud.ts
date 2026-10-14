import { pedir } from "./api.ts";

export type Salud = { estado: "ok" };

export function traerSalud() {
  return pedir<Salud>("/salud");
}
