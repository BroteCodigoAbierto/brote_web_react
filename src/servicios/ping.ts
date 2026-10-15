import { pedir } from "./api.ts";

export type Ping = { respuesta: "pong" };

export function traerPing() {
  return pedir<Ping>("/ping");
}
