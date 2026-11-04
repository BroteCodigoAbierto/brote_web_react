import { LIMITES_ACTIVIDADES, MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioCompletarEspacios from "./FormularioCompletarEspacios.tsx";
import { contarEspacios, esGrupoVacio, type GrupoRespuestas } from "./grupos.ts";

export type BorradorCompletarEspacios = {
  texto: string;
  grupos: GrupoRespuestas[];
};

export const editorCompletarEspacios: EditorActividad<
  "completarEspacios",
  BorradorCompletarEspacios
> = {
  crearBorrador: () => ({ texto: "", grupos: [] }),

  aBorrador: ({ texto, espacios }) => ({
    texto,
    grupos: espacios.map(({ aceptadas }) => ({
      id: idLocal(),
      aceptadas: aceptadas.map((aceptada) => ({ id: idLocal(), texto: aceptada })),
    })),
  }),

  aActividad: ({ texto, grupos }) => ({
    tipo: "completarEspacios",
    texto,
    espacios: grupos.map(({ aceptadas }) => ({
      aceptadas: aceptadas.map(({ texto: aceptada }) => aceptada).filter((a) => a.trim() !== ""),
    })),
  }),

  validar({ texto, grupos }) {
    const errores: ErroresBorrador = {};
    const marcas = contarEspacios(texto);
    if (texto.trim() === "") errores.texto = MENSAJES_EDITOR.campoObligatorio;
    else if (marcas === 0) errores.texto = MENSAJES_EDITOR.sinEspacios;
    else if (marcas > LIMITES_ACTIVIDADES.espaciosMax) {
      errores.texto = MENSAJES_EDITOR.demasiadosEspacios;
    }
    if (grupos.length > marcas) errores.grupos = MENSAJES_EDITOR.gruposDeMas;
    for (const grupo of grupos) {
      if (esGrupoVacio(grupo)) errores[`grupo.${grupo.id}`] = MENSAJES_EDITOR.campoObligatorio;
    }
    return errores;
  },

  resumen: ({ texto }) => texto,

  Formulario: FormularioCompletarEspacios,
};
