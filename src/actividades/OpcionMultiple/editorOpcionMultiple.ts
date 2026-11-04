import { LIMITES_ACTIVIDADES, MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { textoOpcion } from "../../utilidades/actividades.ts";
import { idLocal } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioOpcionMultiple from "./FormularioOpcionMultiple.tsx";

export type TipoOpciones = "texto" | "simbolo";

export type OpcionBorrador = {
  id: string;
  valor: string;
};

// La correcta apunta a la opción por su id y no por su lugar: así quitar otra
// opción no cambia cuál es (brote_specs, research de F05, punto 8).
export type BorradorOpcionMultiple = {
  pregunta: string;
  codigo: string;
  tipoOpciones: TipoOpciones;
  opciones: OpcionBorrador[];
  idCorrecta: string | null;
};

export const editorOpcionMultiple: EditorActividad<"opcionMultiple", BorradorOpcionMultiple> = {
  crearBorrador: () => ({
    pregunta: "",
    codigo: "",
    tipoOpciones: "texto",
    opciones: [
      { id: idLocal(), valor: "" },
      { id: idLocal(), valor: "" },
    ],
    idCorrecta: null,
  }),

  aBorrador({ pregunta, codigo = "", opciones, correcta }) {
    const filas = opciones.map((opcion) => ({ id: idLocal(), valor: textoOpcion(opcion) }));
    return {
      pregunta,
      codigo,
      tipoOpciones: opciones.some((opcion) => "simbolo" in opcion) ? "simbolo" : "texto",
      opciones: filas,
      idCorrecta: filas[correcta]?.id ?? null,
    };
  },

  aActividad({ pregunta, codigo, tipoOpciones, opciones, idCorrecta }) {
    return {
      tipo: "opcionMultiple",
      pregunta,
      ...(codigo.trim() !== "" && { codigo }),
      opciones: opciones.map(({ valor }) =>
        tipoOpciones === "simbolo" ? { simbolo: valor } : { texto: valor },
      ),
      correcta: opciones.findIndex(({ id }) => id === idCorrecta),
    };
  },

  validar({ pregunta, tipoOpciones, opciones, idCorrecta }) {
    const errores: ErroresBorrador = {};
    if (pregunta.trim() === "") errores.pregunta = MENSAJES_EDITOR.campoObligatorio;
    const vistas = new Set<string>();
    for (const { id, valor } of opciones) {
      // se comparan recortadas, respetando las mayúsculas
      const recortado = valor.trim();
      if (recortado === "") {
        errores[`opciones.${id}`] = MENSAJES_EDITOR.campoObligatorio;
      } else if (vistas.has(recortado)) {
        errores[`opciones.${id}`] = MENSAJES_EDITOR.opcionRepetida;
      } else if (
        tipoOpciones === "simbolo" &&
        Array.from(valor).length > LIMITES_ACTIVIDADES.opcionSimboloMax
      ) {
        errores[`opciones.${id}`] = MENSAJES_EDITOR.simboloLargo;
      }
      vistas.add(recortado);
    }
    if (idCorrecta === null) errores.correcta = MENSAJES_EDITOR.opcionCorrectaFalta;
    return errores;
  },

  resumen: ({ pregunta }) => pregunta,

  Formulario: FormularioOpcionMultiple,
};
