import { MENSAJES_AUDIOS, type Audio } from "../tipos/contrato.ts";

// El audio de un escuchar y repetir en el borrador del editor (spec F14; brote_specs, research
// de F14, punto 15), como una imagen de F13: el campo marca `subida` con un id y, al terminar,
// el reductor lo busca en todos los borradores (editor/archivos.ts).

export type ValorAudio = {
  clase: "audio";
  audio: Audio | null;
  // el id de la subida en curso, si hay una
  subida: string | null;
  // el error de la última subida; el audio anterior se queda
  error: string | null;
  // el servidor dijo que ya no está (se quitó en otra pestaña o pasó más de un día)
  perdida: boolean;
};

export function valorAudioVacio(): ValorAudio {
  return { clase: "audio", audio: null, subida: null, error: null, perdida: false };
}

export function aValorAudio(audio?: Audio): ValorAudio {
  return { ...valorAudioVacio(), audio: audio ?? null };
}

// El error que hace la actividad incompleta: solo el de un audio que ya no está, porque el
// audio es opcional. El de una subida fallida se ve en el campo, pero el anterior sigue ahí.
export function errorAudio(valor: ValorAudio): string | undefined {
  return valor.perdida ? MENSAJES_AUDIOS.audioNoEsta : undefined;
}
