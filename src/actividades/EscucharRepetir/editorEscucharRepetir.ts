import { aValorAudio, errorAudio, valorAudioVacio, type ValorAudio } from "../../editor/audios.ts";
import { MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioEscucharRepetir from "./FormularioEscucharRepetir.tsx";

export type BorradorEscucharRepetir = {
  frase: string;
  mostrarTexto: boolean;
  audio: ValorAudio;
};

// Escuchar y repetir en el editor (spec F14, "Crear la actividad"). La frase se guarda
// recortada; el audio es opcional: sin él, la voz del dispositivo.
export const editorEscucharRepetir: EditorActividad<"escucharRepetir", BorradorEscucharRepetir> = {
  crearBorrador: () => ({ frase: "", mostrarTexto: true, audio: valorAudioVacio() }),

  aBorrador: ({ frase, mostrarTexto, audio }) => ({
    frase,
    mostrarTexto,
    audio: aValorAudio(audio),
  }),

  aActividad: ({ frase, mostrarTexto, audio }) => ({
    tipo: "escucharRepetir",
    frase: frase.trim(),
    mostrarTexto,
    ...(audio.audio && { audio: audio.audio }),
  }),

  validar({ frase, audio }) {
    const errores: ErroresBorrador = {};
    if (frase.trim() === "") errores.frase = MENSAJES_EDITOR.campoObligatorio;
    const deAudio = errorAudio(audio);
    if (deAudio) errores.audio = deAudio;
    return errores;
  },

  resumen: ({ frase }) => frase,

  Formulario: FormularioEscucharRepetir,
};
