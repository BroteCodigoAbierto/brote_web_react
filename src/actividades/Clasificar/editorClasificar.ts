import {
  aImagenActividad,
  aValorImagen,
  errorImagen,
  marcarImagenesRepetidas,
  type ValorImagen,
} from "../../editor/imagenes.ts";
import type { TipoContenido } from "../../editor/SelectorTipoContenido/SelectorTipoContenido.tsx";
import { MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { idLocal, marcarRepetidos } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador, FilaTexto } from "../tipos.ts";
import FormularioClasificar from "./FormularioClasificar.tsx";

// La categoría se apunta por su id y no por su lugar: así renombrarla no pierde nada, y
// quitar otra no cambia a cuál pertenece el elemento (research de F11, punto 9).
export type ElementoBorrador = {
  id: string;
  texto: string;
  // F13: el texto y la imagen, para que cambiar de tipo no borre nada
  imagen: ValorImagen;
  idCategoria: string | null;
};

export type BorradorClasificar = {
  consigna: string;
  categorias: FilaTexto[];
  // F13: los elementos son todos textos o todos imágenes
  tipoElementos: TipoContenido;
  elementos: ElementoBorrador[];
};

export function crearCategoria(): FilaTexto {
  return { id: idLocal(), texto: "" };
}

export function crearElemento(): ElementoBorrador {
  return { id: idLocal(), texto: "", imagen: aValorImagen(), idCategoria: null };
}

export const editorClasificar: EditorActividad<"clasificar", BorradorClasificar> = {
  crearBorrador: () => ({
    consigna: "",
    categorias: [crearCategoria(), crearCategoria()],
    tipoElementos: "texto",
    elementos: [crearElemento(), crearElemento()],
  }),

  aBorrador({ consigna = "", categorias, elementos }) {
    const filas = categorias.map((texto) => ({ id: idLocal(), texto }));
    return {
      consigna,
      categorias: filas,
      tipoElementos: elementos.some((elemento) => "imagen" in elemento) ? "imagen" : "texto",
      elementos: elementos.map((elemento) => ({
        id: idLocal(),
        texto: "texto" in elemento ? elemento.texto : "",
        imagen: aValorImagen("imagen" in elemento ? elemento.imagen : undefined),
        idCategoria: filas[elemento.categoria]?.id ?? null,
      })),
    };
  },

  aActividad: ({ consigna, categorias, tipoElementos, elementos }) => ({
    tipo: "clasificar",
    ...(consigna.trim() !== "" && { consigna }),
    categorias: categorias.map(({ texto }) => texto),
    elementos: elementos.map(({ texto, imagen, idCategoria }) => {
      const categoria = categorias.findIndex(({ id }) => id === idCategoria);
      return tipoElementos === "imagen"
        ? { imagen: aImagenActividad(imagen), categoria }
        : { texto, categoria };
    }),
  }),

  validar({ categorias, tipoElementos, elementos }) {
    const errores: ErroresBorrador = {};
    for (const { id, texto } of categorias) {
      if (texto.trim() === "") errores[`categorias.${id}`] = MENSAJES_EDITOR.campoObligatorio;
      else if (!elementos.some(({ idCategoria }) => idCategoria === id)) {
        errores[`categorias.${id}`] = MENSAJES_EDITOR.categoriaSinElementos;
      }
    }
    const { categoriaRepetida, elementoRepetido } = MENSAJES_EDITOR;
    marcarRepetidos(categorias, ({ texto }) => texto, "categorias", categoriaRepetida, errores);
    for (const { id, texto, imagen, idCategoria } of elementos) {
      const error =
        tipoElementos === "imagen"
          ? errorImagen(imagen)
          : texto.trim() === "" && MENSAJES_EDITOR.campoObligatorio;
      if (error) errores[`elementos.${id}`] = error;
      if (idCategoria === null) errores[`categoria.${id}`] = MENSAJES_EDITOR.categoriaFalta;
    }
    if (tipoElementos === "imagen") {
      marcarImagenesRepetidas(elementos, ({ imagen }) => imagen, "elementos", errores);
    } else {
      marcarRepetidos(elementos, ({ texto }) => texto, "elementos", elementoRepetido, errores);
    }
    return errores;
  },

  resumen: ({ consigna, categorias }) =>
    consigna.trim() !== "" ? consigna : (categorias[0]?.texto ?? ""),

  Formulario: FormularioClasificar,
};
