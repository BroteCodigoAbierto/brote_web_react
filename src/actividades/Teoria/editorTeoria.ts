import { MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador, FilaTexto } from "../tipos.ts";
import FormularioTeoria from "./FormularioTeoria.tsx";

export type BorradorTeoria = {
  titulo: string;
  texto: string;
  codigo: string;
  puntosClave: FilaTexto[];
};

export const editorTeoria: EditorActividad<"teoria", BorradorTeoria> = {
  crearBorrador: () => ({ titulo: "", texto: "", codigo: "", puntosClave: [] }),

  aBorrador: ({ titulo = "", texto, codigo = "", puntosClave = [] }) => ({
    titulo,
    texto,
    codigo,
    puntosClave: puntosClave.map((punto) => ({ id: idLocal(), texto: punto })),
  }),

  aActividad({ titulo, texto, codigo, puntosClave }) {
    const puntos = puntosClave.map((punto) => punto.texto).filter((punto) => punto.trim() !== "");
    return {
      tipo: "teoria",
      texto,
      ...(titulo.trim() !== "" && { titulo: titulo.trim() }),
      // el código conserva su sangría
      ...(codigo.trim() !== "" && { codigo }),
      ...(puntos.length > 0 && { puntosClave: puntos }),
    };
  },

  validar({ texto }) {
    const errores: ErroresBorrador = {};
    if (texto.trim() === "") errores.texto = MENSAJES_EDITOR.campoObligatorio;
    return errores;
  },

  resumen: ({ titulo, texto }) => titulo.trim() || texto,

  Formulario: FormularioTeoria,
};
