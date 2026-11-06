import { MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { normalizarComando } from "../../utilidades/codigo.ts";
import { idLocal, marcarRepetidos } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador, FilaTexto } from "../tipos.ts";
import FormularioTerminalSimulada from "./FormularioTerminalSimulada.tsx";

export type BorradorTerminalSimulada = {
  consigna: string;
  carpeta: string;
  salidaPrevia: string;
  comandos: FilaTexto[]; // el primero es el que ve el alumno como respuesta correcta
  salidaAcierto: string;
  pista: string;
};

export function crearComando(): FilaTexto {
  return { id: idLocal(), texto: "" };
}

export const editorTerminalSimulada: EditorActividad<"terminalSimulada", BorradorTerminalSimulada> =
  {
    crearBorrador: () => ({
      consigna: "",
      carpeta: "",
      salidaPrevia: "",
      comandos: [crearComando()],
      salidaAcierto: "",
      pista: "",
    }),

    aBorrador: ({
      consigna,
      carpeta = "",
      salidaPrevia = "",
      comandos,
      salidaAcierto = "",
      pista = "",
    }) => ({
      consigna,
      carpeta,
      salidaPrevia,
      comandos: comandos.map((texto) => ({ id: idLocal(), texto })),
      salidaAcierto,
      pista,
    }),

    // la carpeta y los comandos, recortados, como los guarda el servidor; las salidas, tal
    // como se escribieron, con su sangría. Lo opcional que quedó vacío no se guarda
    aActividad: ({ consigna, carpeta, salidaPrevia, comandos, salidaAcierto, pista }) => ({
      tipo: "terminalSimulada",
      consigna,
      ...(carpeta.trim() !== "" && { carpeta: carpeta.trim() }),
      ...(salidaPrevia.trim() !== "" && { salidaPrevia }),
      comandos: comandos.map(({ texto }) => texto.trim()),
      ...(salidaAcierto.trim() !== "" && { salidaAcierto }),
      ...(pista.trim() !== "" && { pista }),
    }),

    // los comandos repetidos se comparan como los compara la terminal: `git init` y
    // `git  init` son el mismo; `git init` y `Git init`, no
    validar({ consigna, comandos }) {
      const errores: ErroresBorrador = {};
      if (consigna.trim() === "") errores.consigna = MENSAJES_EDITOR.campoObligatorio;
      for (const { id, texto } of comandos) {
        if (texto.trim() === "") errores[`comandos.${id}`] = MENSAJES_EDITOR.campoObligatorio;
      }
      marcarRepetidos(
        comandos,
        ({ texto }) => normalizarComando(texto),
        "comandos",
        MENSAJES_EDITOR.comandoRepetido,
        errores,
      );
      return errores;
    },

    resumen: ({ consigna }) => consigna,

    Formulario: FormularioTerminalSimulada,
  };
