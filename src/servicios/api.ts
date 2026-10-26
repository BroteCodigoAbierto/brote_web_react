import { URL_API } from "../config.ts";

// Único punto de salida a la red. Las funciones de cada recurso
// (servicios/cursos.ts, ...) se construyen encima de pedir().

export class ErrorHttp extends Error {
  estado: number;
  cuerpo: unknown;

  constructor(estado: number, cuerpo: unknown) {
    super(`HTTP ${estado}`);
    this.estado = estado;
    this.cuerpo = cuerpo;
  }
}

// Quien quiera enterarse de que la sesión se perdió (el SesionContext) se
// registra aquí; así cualquier petición que responda 401 lleva a "Entrar".
let oyentePerderSesion: (() => void) | null = null;

export function alPerderSesion(oyente: (() => void) | null) {
  oyentePerderSesion = oyente;
}

// En POST /sesiones un 401 significa "correo o contraseña incorrectos", no que
// se haya perdido una sesión.
function esEntrar(ruta: string, opciones: RequestInit): boolean {
  return ruta === "/sesiones" && opciones.method === "POST";
}

export async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(URL_API + ruta, {
    ...opciones,
    credentials: "include", // la sesión viaja en una cookie (F01)
    headers: { "Content-Type": "application/json", ...opciones.headers },
  });
  if (!respuesta.ok) {
    // el cuerpo puede no ser JSON (p. ej. un proxy caído)
    const cuerpo = await respuesta.json().catch(() => null);
    if (respuesta.status === 401 && !esEntrar(ruta, opciones)) oyentePerderSesion?.();
    throw new ErrorHttp(respuesta.status, cuerpo);
  }
  if (respuesta.status === 204) return undefined as T; // sin cuerpo
  return respuesta.json() as Promise<T>;
}
