import { CLAVES } from "../constantes/almacenamiento.ts";

// Lo que estaba sin guardar cuando expiró la sesión (spec F05, "Casos de error";
// brote_specs, research de F05, punto 15). Hay una sola copia, atada a una cuenta
// y a una pantalla. Sin localStorage no se guarda nada y se pierde, como antes.

type CopiaEditor = {
  idUsuario: string;
  ruta: string;
  datos: unknown;
};

function leer(): CopiaEditor | null {
  try {
    const texto = localStorage.getItem(CLAVES.copiaEditor);
    return texto ? (JSON.parse(texto) as CopiaEditor) : null;
  } catch {
    return null;
  }
}

function borrar() {
  try {
    localStorage.removeItem(CLAVES.copiaEditor);
  } catch {
    // sin almacenamiento no hay copia
  }
}

export function guardarCopia(copia: CopiaEditor) {
  try {
    localStorage.setItem(CLAVES.copiaEditor, JSON.stringify(copia));
  } catch {
    // sin almacenamiento no hay copia
  }
}

// Lee y borra, solo si es de esa cuenta y de esa pantalla.
export function tomarCopia<T>(idUsuario: string, ruta: string): T | null {
  const copia = leer();
  if (copia?.idUsuario !== idUsuario || copia.ruta !== ruta) return null;
  borrar();
  return copia.datos as T;
}

// Si entra otra cuenta, lo no guardado de la anterior se descarta.
export function descartarCopiaAjena(idUsuario: string) {
  const copia = leer();
  if (copia && copia.idUsuario !== idUsuario) borrar();
}
