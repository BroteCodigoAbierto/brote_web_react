import { MENSAJES_EDITOR, type LenguajeCodigo } from "../../tipos/contrato.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioRetoCodigo from "./FormularioRetoCodigo.tsx";

export type BorradorRetoCodigo = {
  consigna: string;
  lenguaje: LenguajeCodigo | null; // null hasta que el autor elige uno
  codigoInicial: string;
  solucion: string;
};

// El código inicial y la solución se guardan tal como se escribieron, con su sangría.
export const editorRetoCodigo: EditorActividad<"retoCodigo", BorradorRetoCodigo> = {
  crearBorrador: () => ({ consigna: "", lenguaje: null, codigoInicial: "", solucion: "" }),

  aBorrador: ({ consigna, lenguaje, codigoInicial = "", solucion }) => ({
    consigna,
    lenguaje,
    codigoInicial,
    solucion,
  }),

  aActividad: ({ consigna, lenguaje, codigoInicial, solucion }) => ({
    tipo: "retoCodigo",
    consigna,
    // validar ya comprobó que hay uno
    lenguaje: lenguaje as LenguajeCodigo,
    ...(codigoInicial.trim() !== "" && { codigoInicial }),
    solucion,
  }),

  validar({ consigna, lenguaje, solucion }) {
    const errores: ErroresBorrador = {};
    if (consigna.trim() === "") errores.consigna = MENSAJES_EDITOR.campoObligatorio;
    if (lenguaje === null) errores.lenguaje = MENSAJES_EDITOR.lenguajeFalta;
    if (solucion.trim() === "") errores.solucion = MENSAJES_EDITOR.campoObligatorio;
    return errores;
  },

  resumen: ({ consigna }) => consigna,

  Formulario: FormularioRetoCodigo,
};
