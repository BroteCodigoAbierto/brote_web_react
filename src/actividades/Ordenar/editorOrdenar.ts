import { MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { idLocal, marcarRepetidos } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador, FilaTexto } from "../tipos.ts";
import FormularioOrdenar from "./FormularioOrdenar.tsx";

export type BorradorOrdenar = {
  consigna: string;
  elementos: FilaTexto[]; // en el orden correcto
};

export function crearElementoOrdenar(): FilaTexto {
  return { id: idLocal(), texto: "" };
}

export const editorOrdenar: EditorActividad<"ordenar", BorradorOrdenar> = {
  crearBorrador: () => ({
    consigna: "",
    elementos: [crearElementoOrdenar(), crearElementoOrdenar(), crearElementoOrdenar()],
  }),

  aBorrador: ({ consigna, elementos }) => ({
    consigna,
    elementos: elementos.map((texto) => ({ id: idLocal(), texto })),
  }),

  // sin recortar: los espacios al inicio son la sangría de una línea de código
  aActividad: ({ consigna, elementos }) => ({
    tipo: "ordenar",
    consigna,
    elementos: elementos.map(({ texto }) => texto),
  }),

  validar({ consigna, elementos }) {
    const errores: ErroresBorrador = {};
    if (consigna.trim() === "") errores.consigna = MENSAJES_EDITOR.campoObligatorio;
    for (const { id, texto } of elementos) {
      if (texto.trim() === "") errores[`elementos.${id}`] = MENSAJES_EDITOR.campoObligatorio;
    }
    const { elementoRepetido } = MENSAJES_EDITOR;
    marcarRepetidos(elementos, ({ texto }) => texto, "elementos", elementoRepetido, errores);
    return errores;
  },

  resumen: ({ consigna }) => consigna,

  Formulario: FormularioOrdenar,
};
