import {
  aImagenActividad,
  aValorImagen,
  errorImagen,
  marcarImagenesRepetidas,
  type ValorImagen,
} from "../../editor/imagenes.ts";
import type { TipoContenido } from "../../editor/SelectorTipoContenido/SelectorTipoContenido.tsx";
import { MENSAJES_EDITOR, type ContenidoElemento } from "../../tipos/contrato.ts";
import { esImagen } from "../../utilidades/imagenes.ts";
import { idLocal, marcarRepetidos } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioEmparejar from "./FormularioEmparejar.tsx";

// Cada lado guarda su texto y su imagen, para que cambiar el tipo de una columna no borre
// nada (spec F13, "Emparejar, clasificar y ordenar").
export type ParejaBorrador = {
  id: string;
  izquierda: string;
  derecha: string;
  imagenIzquierda: ValorImagen;
  imagenDerecha: ValorImagen;
};

export type BorradorEmparejar = {
  consigna: string;
  // F13: cada columna es de textos o de imágenes
  tipoIzquierda: TipoContenido;
  tipoDerecha: TipoContenido;
  parejas: ParejaBorrador[];
};

export function crearPareja(): ParejaBorrador {
  return {
    id: idLocal(),
    izquierda: "",
    derecha: "",
    imagenIzquierda: aValorImagen(),
    imagenDerecha: aValorImagen(),
  };
}

function aLado(contenido: ContenidoElemento): { texto: string; imagen: ValorImagen } {
  return esImagen(contenido)
    ? { texto: "", imagen: aValorImagen(contenido) }
    : { texto: contenido, imagen: aValorImagen() };
}

function tipoDe(contenido: ContenidoElemento | undefined): TipoContenido {
  return contenido !== undefined && esImagen(contenido) ? "imagen" : "texto";
}

export const editorEmparejar: EditorActividad<"emparejar", BorradorEmparejar> = {
  crearBorrador: () => ({
    consigna: "",
    tipoIzquierda: "texto",
    tipoDerecha: "texto",
    parejas: [crearPareja(), crearPareja(), crearPareja()],
  }),

  aBorrador: ({ consigna = "", parejas }) => ({
    consigna,
    tipoIzquierda: tipoDe(parejas[0]?.izquierda),
    tipoDerecha: tipoDe(parejas[0]?.derecha),
    parejas: parejas.map(({ izquierda, derecha }) => {
      const izq = aLado(izquierda);
      const der = aLado(derecha);
      return {
        id: idLocal(),
        izquierda: izq.texto,
        derecha: der.texto,
        imagenIzquierda: izq.imagen,
        imagenDerecha: der.imagen,
      };
    }),
  }),

  aActividad: ({ consigna, tipoIzquierda, tipoDerecha, parejas }) => ({
    tipo: "emparejar",
    ...(consigna.trim() !== "" && { consigna }),
    parejas: parejas.map(({ izquierda, derecha, imagenIzquierda, imagenDerecha }) => ({
      izquierda: tipoIzquierda === "imagen" ? aImagenActividad(imagenIzquierda) : izquierda,
      derecha: tipoDerecha === "imagen" ? aImagenActividad(imagenDerecha) : derecha,
    })),
  }),

  validar({ tipoIzquierda, tipoDerecha, parejas }) {
    const errores: ErroresBorrador = {};
    for (const pareja of parejas) {
      const { id } = pareja;
      const izquierda =
        tipoIzquierda === "imagen"
          ? errorImagen(pareja.imagenIzquierda)
          : pareja.izquierda.trim() === "" && MENSAJES_EDITOR.campoObligatorio;
      const derecha =
        tipoDerecha === "imagen"
          ? errorImagen(pareja.imagenDerecha)
          : pareja.derecha.trim() === "" && MENSAJES_EDITOR.campoObligatorio;
      if (izquierda) errores[`izquierda.${id}`] = izquierda;
      if (derecha) errores[`derecha.${id}`] = derecha;
    }
    const repetido = MENSAJES_EDITOR.textoRepetido;
    if (tipoIzquierda === "imagen") {
      marcarImagenesRepetidas(parejas, (pareja) => pareja.imagenIzquierda, "izquierda", errores);
    } else {
      marcarRepetidos(parejas, ({ izquierda }) => izquierda, "izquierda", repetido, errores);
    }
    if (tipoDerecha === "imagen") {
      marcarImagenesRepetidas(parejas, (pareja) => pareja.imagenDerecha, "derecha", errores);
    } else {
      marcarRepetidos(parejas, ({ derecha }) => derecha, "derecha", repetido, errores);
    }
    return errores;
  },

  // F13: sin consigna, el primer texto de la primera pareja; con dos columnas de imágenes,
  // "Parejas de imágenes"
  resumen({ consigna, tipoIzquierda, tipoDerecha, parejas }) {
    if (consigna.trim() !== "") return consigna;
    if (tipoIzquierda === "texto") return parejas[0]?.izquierda ?? "";
    if (tipoDerecha === "texto") return parejas[0]?.derecha ?? "";
    return "Parejas de imágenes";
  },

  Formulario: FormularioEmparejar,
};
