import { aImagenActividad, aValorImagen, errorImagen } from "../../editor/imagenes.ts";
import { LIMITES_IMAGENES, MENSAJES_EDITOR, MENSAJES_IMAGENES } from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador, FilaTexto } from "../tipos.ts";
import FormularioTeoria from "./FormularioTeoria.tsx";
import { contarMarcasImagen, type GrupoImagen } from "./grupos.ts";

export type BorradorTeoria = {
  titulo: string;
  texto: string;
  codigo: string;
  puntosClave: FilaTexto[];
  // F13: una por cada [imagen] del texto, en orden
  imagenes: GrupoImagen[];
};

export const editorTeoria: EditorActividad<"teoria", BorradorTeoria> = {
  crearBorrador: () => ({ titulo: "", texto: "", codigo: "", puntosClave: [], imagenes: [] }),

  aBorrador: ({ titulo = "", texto, codigo = "", puntosClave = [], imagenes = [] }) => ({
    titulo,
    texto,
    codigo,
    puntosClave: puntosClave.map((punto) => ({ id: idLocal(), texto: punto })),
    imagenes: imagenes.map((imagen) => ({ id: idLocal(), valor: aValorImagen(imagen) })),
  }),

  aActividad({ titulo, texto, codigo, puntosClave, imagenes }) {
    const puntos = puntosClave.map((punto) => punto.texto).filter((punto) => punto.trim() !== "");
    const marcas = contarMarcasImagen(texto);
    return {
      tipo: "teoria",
      texto,
      ...(titulo.trim() !== "" && { titulo: titulo.trim() }),
      // el código conserva su sangría
      ...(codigo.trim() !== "" && { codigo }),
      ...(puntos.length > 0 && { puntosClave: puntos }),
      ...(marcas > 0 && {
        imagenes: imagenes.slice(0, marcas).map(({ valor }) => aImagenActividad(valor)),
      }),
    };
  },

  validar({ texto, imagenes }) {
    const errores: ErroresBorrador = {};
    const marcas = contarMarcasImagen(texto);
    if (texto.trim() === "") errores.texto = MENSAJES_EDITOR.campoObligatorio;
    else if (marcas > LIMITES_IMAGENES.imagenesTeoriaMax) {
      errores.texto = MENSAJES_IMAGENES.demasiadasImagenes;
    }
    if (imagenes.length > marcas) errores.imagenes = MENSAJES_IMAGENES.imagenesDeMas;
    imagenes.slice(0, marcas).forEach(({ id, valor }) => {
      const error = errorImagen(valor);
      if (error) errores[`imagen-${id}`] = error;
    });
    return errores;
  },

  resumen: ({ titulo, texto }) => titulo.trim() || texto,

  Formulario: FormularioTeoria,
};
