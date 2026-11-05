import { LIMITES_ACTIVIDADES, MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";
import { hayFormaDeLlenar } from "../../utilidades/relacionar.ts";
import { contarEspacios } from "../CompletarEspacios/grupos.ts";
import type { EditorActividad, ErroresBorrador, FilaTexto } from "../tipos.ts";
import FormularioBancoPalabras from "./FormularioBancoPalabras.tsx";
import { esGrupoSinMarcas, type GrupoFichas } from "./grupos.ts";

export type BorradorBancoPalabras = {
  consigna: string;
  texto: string;
  fichas: FilaTexto[];
  grupos: GrupoFichas[];
};

export function crearFicha(): FilaTexto {
  return { id: idLocal(), texto: "" };
}

function aActividad({ consigna, texto, fichas, grupos }: BorradorBancoPalabras) {
  return {
    tipo: "bancoPalabras" as const,
    ...(consigna.trim() !== "" && { consigna }),
    texto,
    // recortadas: se comparan por su texto exacto
    fichas: fichas.map((ficha) => ficha.texto.trim()),
    espacios: grupos.map(({ idFichas }) => {
      const marcadas = fichas.filter(({ id }) => idFichas.includes(id));
      return { aceptadas: [...new Set(marcadas.map((ficha) => ficha.texto.trim()))] };
    }),
  };
}

export const editorBancoPalabras: EditorActividad<"bancoPalabras", BorradorBancoPalabras> = {
  crearBorrador: () => ({
    consigna: "",
    texto: "",
    fichas: [crearFicha(), crearFicha()],
    grupos: [],
  }),

  aBorrador({ consigna = "", texto, fichas, espacios }) {
    const filas = fichas.map((ficha) => ({ id: idLocal(), texto: ficha }));
    return {
      consigna,
      texto,
      fichas: filas,
      grupos: espacios.map(({ aceptadas }) => ({
        id: idLocal(),
        idFichas: filas.filter((fila) => aceptadas.includes(fila.texto)).map(({ id }) => id),
      })),
    };
  },

  aActividad,

  validar(borrador) {
    const { texto, fichas, grupos } = borrador;
    const errores: ErroresBorrador = {};
    const marcas = contarEspacios(texto);
    if (texto.trim() === "") errores.texto = MENSAJES_EDITOR.campoObligatorio;
    else if (marcas === 0) errores.texto = MENSAJES_EDITOR.sinEspacios;
    else if (marcas > LIMITES_ACTIVIDADES.espaciosBancoMax) {
      errores.texto = MENSAJES_EDITOR.demasiadosEspaciosBanco;
    }
    if (grupos.length > marcas) errores.grupos = MENSAJES_EDITOR.gruposDeMas;
    for (const { id, texto: ficha } of fichas) {
      if (ficha.trim() === "") errores[`fichas.${id}`] = MENSAJES_EDITOR.campoObligatorio;
    }
    for (const grupo of grupos) {
      if (esGrupoSinMarcas(grupo)) errores[`grupo.${grupo.id}`] = MENSAJES_EDITOR.fichaFalta;
    }
    // solo con lo demás bien: si no, el aviso confunde más de lo que ayuda
    if (Object.keys(errores).length === 0 && !hayFormaDeLlenar(aActividad(borrador))) {
      errores.fichas = MENSAJES_EDITOR.fichasInsuficientes;
    }
    return errores;
  },

  resumen: ({ consigna, texto }) => (consigna.trim() !== "" ? consigna : texto),

  Formulario: FormularioBancoPalabras,
};
