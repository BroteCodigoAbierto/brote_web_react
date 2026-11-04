import { MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioPreguntaAbierta from "./FormularioPreguntaAbierta.tsx";

export type BorradorPreguntaAbierta = {
  pregunta: string;
  solucion: string;
};

export const editorPreguntaAbierta: EditorActividad<"preguntaAbierta", BorradorPreguntaAbierta> = {
  crearBorrador: () => ({ pregunta: "", solucion: "" }),

  aBorrador: ({ pregunta, solucion }) => ({ pregunta, solucion }),

  aActividad: ({ pregunta, solucion }) => ({ tipo: "preguntaAbierta", pregunta, solucion }),

  validar({ pregunta, solucion }) {
    const errores: ErroresBorrador = {};
    if (pregunta.trim() === "") errores.pregunta = MENSAJES_EDITOR.campoObligatorio;
    if (solucion.trim() === "") errores.solucion = MENSAJES_EDITOR.campoObligatorio;
    return errores;
  },

  resumen: ({ pregunta }) => pregunta,

  Formulario: FormularioPreguntaAbierta,
};
