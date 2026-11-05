import { MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { idLocal, marcarRepetidos } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioEmparejar from "./FormularioEmparejar.tsx";

export type ParejaBorrador = {
  id: string;
  izquierda: string;
  derecha: string;
};

export type BorradorEmparejar = {
  consigna: string;
  parejas: ParejaBorrador[];
};

export function crearPareja(): ParejaBorrador {
  return { id: idLocal(), izquierda: "", derecha: "" };
}

export const editorEmparejar: EditorActividad<"emparejar", BorradorEmparejar> = {
  crearBorrador: () => ({ consigna: "", parejas: [crearPareja(), crearPareja(), crearPareja()] }),

  aBorrador: ({ consigna = "", parejas }) => ({
    consigna,
    parejas: parejas.map((pareja) => ({ id: idLocal(), ...pareja })),
  }),

  aActividad: ({ consigna, parejas }) => ({
    tipo: "emparejar",
    ...(consigna.trim() !== "" && { consigna }),
    parejas: parejas.map(({ izquierda, derecha }) => ({ izquierda, derecha })),
  }),

  validar({ parejas }) {
    const errores: ErroresBorrador = {};
    for (const { id, izquierda, derecha } of parejas) {
      if (izquierda.trim() === "") errores[`izquierda.${id}`] = MENSAJES_EDITOR.campoObligatorio;
      if (derecha.trim() === "") errores[`derecha.${id}`] = MENSAJES_EDITOR.campoObligatorio;
    }
    const repetido = MENSAJES_EDITOR.textoRepetido;
    marcarRepetidos(parejas, ({ izquierda }) => izquierda, "izquierda", repetido, errores);
    marcarRepetidos(parejas, ({ derecha }) => derecha, "derecha", repetido, errores);
    return errores;
  },

  resumen: ({ consigna, parejas }) =>
    consigna.trim() !== "" ? consigna : (parejas[0]?.izquierda ?? ""),

  Formulario: FormularioEmparejar,
};
