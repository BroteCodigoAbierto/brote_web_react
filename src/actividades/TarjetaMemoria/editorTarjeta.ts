import { MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioTarjeta from "./FormularioTarjeta.tsx";

export type BorradorTarjeta = {
  frente: string;
  reverso: string;
};

export const editorTarjeta: EditorActividad<"tarjeta", BorradorTarjeta> = {
  crearBorrador: () => ({ frente: "", reverso: "" }),

  aBorrador: ({ frente, reverso }) => ({ frente, reverso }),

  aActividad: ({ frente, reverso }) => ({ tipo: "tarjeta", frente, reverso }),

  validar({ frente, reverso }) {
    const errores: ErroresBorrador = {};
    if (frente.trim() === "") errores.frente = MENSAJES_EDITOR.campoObligatorio;
    if (reverso.trim() === "") errores.reverso = MENSAJES_EDITOR.campoObligatorio;
    return errores;
  },

  resumen: ({ frente }) => frente,

  Formulario: FormularioTarjeta,
};
