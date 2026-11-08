import {
  aImagenActividad,
  aValorImagen,
  errorImagen,
  idsRepetidos,
  type ValorImagen,
} from "../../editor/imagenes.ts";
import { LIMITES_ACTIVIDADES, MENSAJES_EDITOR, MENSAJES_IMAGENES } from "../../tipos/contrato.ts";
import { textoOpcion } from "../../utilidades/actividades.ts";
import { idLocal } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioOpcionMultiple from "./FormularioOpcionMultiple.tsx";

// "imagen" (F13): las opciones son imágenes
export type TipoOpciones = "texto" | "simbolo" | "imagen";

// El texto y la imagen se guardan los dos, para que cambiar de tipo no borre nada
export type OpcionBorrador = {
  id: string;
  valor: string;
  imagen: ValorImagen;
};

// La correcta apunta a la opción por su id y no por su lugar: así quitar otra
// opción no cambia cuál es (brote_specs, research de F05, punto 8).
export type BorradorOpcionMultiple = {
  pregunta: string;
  // F13: la imagen de la pregunta, opcional
  imagenPregunta: ValorImagen;
  codigo: string;
  tipoOpciones: TipoOpciones;
  opciones: OpcionBorrador[];
  idCorrecta: string | null;
};

export const editorOpcionMultiple: EditorActividad<"opcionMultiple", BorradorOpcionMultiple> = {
  crearBorrador: () => ({
    pregunta: "",
    imagenPregunta: aValorImagen(),
    codigo: "",
    tipoOpciones: "texto",
    opciones: [
      { id: idLocal(), valor: "", imagen: aValorImagen() },
      { id: idLocal(), valor: "", imagen: aValorImagen() },
    ],
    idCorrecta: null,
  }),

  aBorrador({ pregunta, imagen, codigo = "", opciones, correcta }) {
    const filas = opciones.map((opcion) =>
      "imagen" in opcion
        ? { id: idLocal(), valor: "", imagen: aValorImagen(opcion.imagen) }
        : { id: idLocal(), valor: textoOpcion(opcion), imagen: aValorImagen() },
    );
    const tipoOpciones: TipoOpciones = opciones.some((opcion) => "imagen" in opcion)
      ? "imagen"
      : opciones.some((opcion) => "simbolo" in opcion)
        ? "simbolo"
        : "texto";
    return {
      pregunta,
      imagenPregunta: aValorImagen(imagen),
      codigo,
      tipoOpciones,
      opciones: filas,
      idCorrecta: filas[correcta]?.id ?? null,
    };
  },

  aActividad({ pregunta, imagenPregunta, codigo, tipoOpciones, opciones, idCorrecta }) {
    return {
      tipo: "opcionMultiple",
      pregunta,
      ...(imagenPregunta.imagen && { imagen: aImagenActividad(imagenPregunta) }),
      ...(codigo.trim() !== "" && { codigo }),
      opciones: opciones.map(({ valor, imagen }) => {
        if (tipoOpciones === "imagen") return { imagen: aImagenActividad(imagen) };
        return tipoOpciones === "simbolo" ? { simbolo: valor } : { texto: valor };
      }),
      correcta: opciones.findIndex(({ id }) => id === idCorrecta),
    };
  },

  validar({ pregunta, imagenPregunta, tipoOpciones, opciones, idCorrecta }) {
    const errores: ErroresBorrador = {};
    if (pregunta.trim() === "") errores.pregunta = MENSAJES_EDITOR.campoObligatorio;
    // la imagen de la pregunta es opcional: solo cuenta si se perdió
    if (imagenPregunta.perdida) errores.imagenPregunta = MENSAJES_IMAGENES.imagenNoEsta;
    if (tipoOpciones === "imagen") {
      const repetidas = idsRepetidos(opciones.map(({ imagen }) => imagen));
      for (const { id, imagen } of opciones) {
        const error =
          errorImagen(imagen) ??
          (imagen.imagen && repetidas.has(imagen.imagen.id)
            ? MENSAJES_IMAGENES.imagenRepetida
            : undefined);
        if (error) errores[`opciones.${id}`] = error;
      }
      if (idCorrecta === null) errores.correcta = MENSAJES_EDITOR.opcionCorrectaFalta;
      return errores;
    }
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
