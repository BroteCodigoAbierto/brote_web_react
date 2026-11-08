import { URL_API } from "../config.ts";
import {
  LIMITES_AUDIOS,
  MENSAJES_AUDIOS,
  RUTA_AUDIOS,
  TIPO_MIME_AUDIO,
  type Actividad,
  type Audio,
  type FormatoAudio,
} from "../tipos/contrato.ts";

// Los audios de los cursos (spec F14). Se traen enteros con la sesión, antes de sonar
// (brote_specs, research de F14, puntos 6 y 9).

export function urlAudio(id: string): string {
  return `${URL_API}${RUTA_AUDIOS}/${id}`;
}

// El audio de una actividad: solo escuchar y repetir puede traer uno.
export function audiosDe(actividad: Actividad): Audio[] {
  return actividad.tipo === "escucharRepetir" && actividad.audio ? [actividad.audio] : [];
}

// "0:04": minutos y segundos, redondeados al segundo.
export function formatearDuracion(milisegundos: number): string {
  const segundos = Math.round(milisegundos / 1000);
  return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
}

// --- Preparar un audio antes de subirlo (spec F14; research de F14, punto 5) -------------

// Los navegadores no se ponen de acuerdo en cómo llamar a un M4A o a un WAV.
const POR_TIPO: Record<string, FormatoAudio> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/m4a": "m4a",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/wave": "wav",
  "audio/vnd.wave": "wav",
};

const POR_EXTENSION: Record<string, FormatoAudio> = { mp3: "mp3", m4a: "m4a", wav: "wav" };

// Por su tipo o, si el navegador no lo sabe, por su extensión. Un OGG, un FLAC o un video no
// son ninguno de los tres.
function formatoDe(archivo: File): FormatoAudio | null {
  if (archivo.type !== "") return POR_TIPO[archivo.type] ?? null;
  return POR_EXTENSION[archivo.name.split(".").pop()?.toLowerCase() ?? ""] ?? null;
}

// Si el navegador no lo abre en 10 s, tampoco lo va a poder tocar.
const ESPERA_METADATOS_MS = 10_000;

// La duración en segundos, abriéndolo en un <audio> sin reproducirlo.
function medirDuracion(archivo: Blob): Promise<number> {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const elemento = document.createElement("audio");
    const espera = setTimeout(() => terminar(() => rechazar(new Error())), ESPERA_METADATOS_MS);
    function terminar(accion: () => void) {
      clearTimeout(espera);
      elemento.removeAttribute("src");
      URL.revokeObjectURL(url);
      accion();
    }
    elemento.preload = "metadata";
    elemento.onloadedmetadata = () => terminar(() => resolver(elemento.duration));
    elemento.onerror = () => terminar(() => rechazar(new Error()));
    elemento.src = url;
  });
}

// Lo que se sube: el archivo tal cual, con el tipo con el que lo sirve la API. El servidor
// le quita los datos ocultos (la web no puede sin volver a comprimirlo) y vuelve a comprobar
// todo. Lanza Error con el mensaje del campo; si pasa del peso y de la duración, el del peso.
export async function prepararAudio(archivo: File): Promise<Blob> {
  const formato = formatoDe(archivo);
  if (!formato) throw new Error(MENSAJES_AUDIOS.formatoInvalido);
  if (archivo.size > LIMITES_AUDIOS.pesoMax) throw new Error(MENSAJES_AUDIOS.audioPesado);
  let duracion: number;
  try {
    duracion = await medirDuracion(archivo);
  } catch {
    // un texto con extensión .mp3, o un M4A sin pérdida en Chrome
    throw new Error(MENSAJES_AUDIOS.audioIlegible);
  }
  // redondeada a décimas, como el servidor: 30.04 s cuentan como 30
  if (
    Number.isFinite(duracion) &&
    Math.round(duracion * 10) / 10 > LIMITES_AUDIOS.duracionMax / 1000
  ) {
    throw new Error(MENSAJES_AUDIOS.audioLargo);
  }
  return new Blob([archivo], { type: TIPO_MIME_AUDIO[formato] });
}
