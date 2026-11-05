import { MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { idLocal, marcarRepetidos } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador, FilaTexto } from "../tipos.ts";
import FormularioClasificar from "./FormularioClasificar.tsx";

// La categoría se apunta por su id y no por su lugar: así renombrarla no pierde nada, y
// quitar otra no cambia a cuál pertenece el elemento (research de F11, punto 9).
export type ElementoBorrador = {
  id: string;
  texto: string;
  idCategoria: string | null;
};

export type BorradorClasificar = {
  consigna: string;
  categorias: FilaTexto[];
  elementos: ElementoBorrador[];
};

export function crearCategoria(): FilaTexto {
  return { id: idLocal(), texto: "" };
}

export function crearElemento(): ElementoBorrador {
  return { id: idLocal(), texto: "", idCategoria: null };
}

export const editorClasificar: EditorActividad<"clasificar", BorradorClasificar> = {
  crearBorrador: () => ({
    consigna: "",
    categorias: [crearCategoria(), crearCategoria()],
    elementos: [crearElemento(), crearElemento()],
  }),

  aBorrador({ consigna = "", categorias, elementos }) {
    const filas = categorias.map((texto) => ({ id: idLocal(), texto }));
    return {
      consigna,
      categorias: filas,
      elementos: elementos.map(({ texto, categoria }) => ({
        id: idLocal(),
        texto,
        idCategoria: filas[categoria]?.id ?? null,
      })),
    };
  },

  aActividad: ({ consigna, categorias, elementos }) => ({
    tipo: "clasificar",
    ...(consigna.trim() !== "" && { consigna }),
    categorias: categorias.map(({ texto }) => texto),
    elementos: elementos.map(({ texto, idCategoria }) => ({
      texto,
      categoria: categorias.findIndex(({ id }) => id === idCategoria),
    })),
  }),

  validar({ categorias, elementos }) {
    const errores: ErroresBorrador = {};
    for (const { id, texto } of categorias) {
      if (texto.trim() === "") errores[`categorias.${id}`] = MENSAJES_EDITOR.campoObligatorio;
      else if (!elementos.some(({ idCategoria }) => idCategoria === id)) {
        errores[`categorias.${id}`] = MENSAJES_EDITOR.categoriaSinElementos;
      }
    }
    const { categoriaRepetida, elementoRepetido } = MENSAJES_EDITOR;
    marcarRepetidos(categorias, ({ texto }) => texto, "categorias", categoriaRepetida, errores);
    for (const { id, texto, idCategoria } of elementos) {
      if (texto.trim() === "") errores[`elementos.${id}`] = MENSAJES_EDITOR.campoObligatorio;
      if (idCategoria === null) errores[`categoria.${id}`] = MENSAJES_EDITOR.categoriaFalta;
    }
    marcarRepetidos(elementos, ({ texto }) => texto, "elementos", elementoRepetido, errores);
    return errores;
  },

  resumen: ({ consigna, categorias }) =>
    consigna.trim() !== "" ? consigna : (categorias[0]?.texto ?? ""),

  Formulario: FormularioClasificar,
};
