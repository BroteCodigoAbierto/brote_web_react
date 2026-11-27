// Claves de localStorage de la web, todas aquí para no repetir textos sueltos.
//
// La sesión vive en una cookie httpOnly que JavaScript no ve. Estas marcas
// solo sirven para dos cosas (brote_specs, research de F01, punto 10):
// - sesionActiva: saber, al abrir, si una sesión terminó o nunca hubo una.
// - cierrePendiente: reintentar un "Cerrar sesión" que no llegó al servidor.
//
// copiaEditor no es una marca: la usa utilidades/copiaEditor.ts (F05).
export const CLAVES = {
  sesionActiva: "sesion.activa",
  cierrePendiente: "sesion.cierrePendiente",
  copiaEditor: "editor.copia",
  aspecto: "pref.aspecto",
  espacio: "pref.espacio",
} as const;

type Clave = (typeof CLAVES)[keyof typeof CLAVES];

// localStorage puede no existir o lanzar (modo privado, almacenamiento
// bloqueado); entonces las marcas simplemente no se guardan.
export function leerMarca(clave: Clave): boolean {
  try {
    return localStorage.getItem(clave) === "1";
  } catch {
    return false;
  }
}

export function ponerMarca(clave: Clave) {
  try {
    localStorage.setItem(clave, "1");
  } catch {
    // sin almacenamiento no hay marca
  }
}

export function quitarMarca(clave: Clave) {
  try {
    localStorage.removeItem(clave);
  } catch {
    // sin almacenamiento no hay marca
  }
}

export function leerTexto(clave: Clave): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

export function ponerTexto(clave: Clave, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // sin almacenamiento
  }
}
