import { CLAVES } from "../constantes/almacenamiento.ts";
import { interpretarTema, temaInicial, type PreferenciaTema } from "../constantes/temas.ts";

export function leerTema(): PreferenciaTema {
  try {
    return interpretarTema(localStorage.getItem(CLAVES.tema));
  } catch {
    return temaInicial;
  }
}

export function aplicarTema({ tema, modo }: PreferenciaTema) {
  document.documentElement.dataset.paleta = tema;
  document.documentElement.dataset.tema = modo;
}

export function guardarTema(preferencia: PreferenciaTema) {
  localStorage.setItem(CLAVES.tema, JSON.stringify(preferencia));
}
