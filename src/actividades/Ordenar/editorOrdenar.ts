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
import { esImagen } from "../../utilidades/imagenes.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioOrdenar from "./FormularioOrdenar.tsx";

// F13: cada elemento guarda su texto y su imagen, para que cambiar de tipo no borre nada.
export type ElementoOrdenarBorrador = {
  id: string;
  texto: string;
  imagen: ValorImagen;
};

export type BorradorOrdenar = {
  consigna: string;
  // F13: los elementos son todos textos o todos imágenes
  tipoElementos: TipoContenido;
  elementos: ElementoOrdenarBorrador[]; // en el orden correcto
};

export function crearElementoOrdenar(): ElementoOrdenarBorrador {
  return { id: idLocal(), texto: "", imagen: aValorImagen() };
}

export const editorOrdenar: EditorActividad<"ordenar", BorradorOrdenar> = {
  crearBorrador: () => ({
    consigna: "",
    tipoElementos: "texto",
    elementos: [crearElementoOrdenar(), crearElementoOrdenar(), crearElementoOrdenar()],
  }),

  aBorrador: ({ consigna, elementos }) => ({
    consigna,
    tipoElementos: elementos.some(esImagen) ? "imagen" : "texto",
    elementos: elementos.map((elemento) =>
      esImagen(elemento)
        ? { id: idLocal(), texto: "", imagen: aValorImagen(elemento) }
        : { id: idLocal(), texto: elemento, imagen: aValorImagen() },
    ),
  }),

  // sin recortar: los espacios al inicio son la sangría de una línea de código
  aActividad: ({ consigna, tipoElementos, elementos }) => ({
    tipo: "ordenar",
    consigna,
    elementos: elementos.map(({ texto, imagen }) =>
      tipoElementos === "imagen" ? aImagenActividad(imagen) : texto,
    ),
  }),

  validar({ consigna, tipoElementos, elementos }) {
    const errores: ErroresBorrador = {};
    if (consigna.trim() === "") errores.consigna = MENSAJES_EDITOR.campoObligatorio;
    for (const { id, texto, imagen } of elementos) {
      const error =
        tipoElementos === "imagen"
          ? errorImagen(imagen)
          : texto.trim() === "" && MENSAJES_EDITOR.campoObligatorio;
      if (error) errores[`elementos.${id}`] = error;
    }
    if (tipoElementos === "imagen") {
      marcarImagenesRepetidas(elementos, ({ imagen }) => imagen, "elementos", errores);
    } else {
      const { elementoRepetido } = MENSAJES_EDITOR;
      marcarRepetidos(elementos, ({ texto }) => texto, "elementos", elementoRepetido, errores);
    }
    return errores;
  },

  resumen: ({ consigna }) => consigna,

  Formulario: FormularioOrdenar,
};
