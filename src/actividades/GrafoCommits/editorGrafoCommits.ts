import { LIMITES_ACTIVIDADES, MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { idLocal, marcarRepetidos } from "../../utilidades/editor.ts";
import { acomodarGrafo } from "../../utilidades/grafo.ts";
import type { EditorActividad, ErroresBorrador } from "../tipos.ts";
import FormularioGrafoCommits from "./FormularioGrafoCommits.tsx";

// Los padres, el commit de cada rama, HEAD y la respuesta apuntan por id y no por lugar: así
// cambiarle el nombre a un commit no cambia nada más, y quitar uno deja vacío solo lo que lo
// usaba (brote_specs, research de F12, punto 9). Los commits no se reordenan, así que un padre
// elegido siempre sigue arriba.
export type FilaCommit = {
  id: string;
  nombre: string;
  idPadre: string | null; // el primer commit lo ignora
  idSegundoPadre: string | null; // con él, es un merge
};

export type FilaRama = {
  id: string;
  nombre: string;
  idCommit: string | null;
};

export type HeadBorrador = { idRama: string } | { idCommit: string } | null;

export type BorradorGrafoCommits = {
  consigna: string;
  commits: FilaCommit[]; // del más antiguo al más nuevo
  ramas: FilaRama[];
  head: HeadBorrador;
  idRespuesta: string | null;
  explicacion: string;
};

export function crearCommit(idPadre: string | null): FilaCommit {
  return { id: idLocal(), nombre: "", idPadre, idSegundoPadre: null };
}

export function crearRama(): FilaRama {
  return { id: idLocal(), nombre: "", idCommit: null };
}

// Los padres de un commit como índices. El primero no tiene: el que quedó primero al quitar
// otro ignora el suyo.
function padresDe(commits: FilaCommit[], indice: number): number[] {
  if (indice === 0) return [];
  const { idPadre, idSegundoPadre } = commits[indice];
  return [idPadre, idSegundoPadre]
    .filter((id) => id !== null)
    .map((id) => commits.findIndex((commit) => commit.id === id));
}

function padresValidos(commits: FilaCommit[]): boolean {
  return commits.every(
    ({ idPadre, idSegundoPadre }, indice) =>
      indice === 0 || (idPadre !== null && idSegundoPadre !== idPadre),
  );
}

export const editorGrafoCommits: EditorActividad<"grafoCommits", BorradorGrafoCommits> = {
  crearBorrador() {
    const primero = crearCommit(null);
    return {
      consigna: "",
      commits: [primero, crearCommit(primero.id)],
      ramas: [],
      head: null,
      idRespuesta: null,
      explicacion: "",
    };
  },

  aBorrador({ consigna, commits, ramas, head, respuesta, explicacion = "" }) {
    const ids = commits.map(() => idLocal());
    const filasRamas = ramas.map(({ nombre, commit }) => ({
      id: idLocal(),
      nombre,
      idCommit: ids[commit] ?? null,
    }));
    let headBorrador: HeadBorrador = null;
    if (head && "rama" in head && filasRamas[head.rama]) {
      headBorrador = { idRama: filasRamas[head.rama].id };
    } else if (head && "commit" in head && ids[head.commit]) {
      headBorrador = { idCommit: ids[head.commit] };
    }
    return {
      consigna,
      commits: commits.map(({ nombre, padres }, indice) => ({
        id: ids[indice],
        nombre,
        idPadre: padres[0] !== undefined ? (ids[padres[0]] ?? null) : null,
        idSegundoPadre: padres[1] !== undefined ? (ids[padres[1]] ?? null) : null,
      })),
      ramas: filasRamas,
      head: headBorrador,
      idRespuesta: ids[respuesta] ?? null,
      explicacion,
    };
  },

  // los nombres, recortados, como los guarda el servidor
  aActividad({ consigna, commits, ramas, head, idRespuesta, explicacion }) {
    const indiceDe = (id: string | null) => commits.findIndex((commit) => commit.id === id);
    return {
      tipo: "grafoCommits",
      consigna,
      commits: commits.map(({ nombre }, indice) => ({
        nombre: nombre.trim(),
        padres: padresDe(commits, indice),
      })),
      ramas: ramas.map(({ nombre, idCommit }) => ({
        nombre: nombre.trim(),
        commit: indiceDe(idCommit),
      })),
      ...(head && {
        head:
          "idRama" in head
            ? { rama: ramas.findIndex((rama) => rama.id === head.idRama) }
            : { commit: indiceDe(head.idCommit) },
      }),
      respuesta: indiceDe(idRespuesta),
      ...(explicacion.trim() !== "" && { explicacion }),
    };
  },

  validar({ consigna, commits, ramas, idRespuesta }) {
    const errores: ErroresBorrador = {};
    if (consigna.trim() === "") errores.consigna = MENSAJES_EDITOR.campoObligatorio;
    commits.forEach(({ id, nombre, idPadre, idSegundoPadre }, indice) => {
      if (nombre.trim() === "") errores[`commits.${id}`] = MENSAJES_EDITOR.campoObligatorio;
      if (indice === 0) return;
      if (idPadre === null) errores[`padre.${id}`] = MENSAJES_EDITOR.padreFalta;
      else if (idSegundoPadre === idPadre) {
        errores[`segundoPadre.${id}`] = MENSAJES_EDITOR.segundoPadreIgual;
      }
    });
    marcarRepetidos(
      commits,
      ({ nombre }) => nombre,
      "commits",
      MENSAJES_EDITOR.nombreCommitRepetido,
      errores,
    );
    // respetando las mayúsculas, como Git: "head" sí vale
    for (const { id, nombre, idCommit } of ramas) {
      if (nombre.trim() === "") errores[`ramas.${id}`] = MENSAJES_EDITOR.campoObligatorio;
      else if (nombre.trim() === "HEAD") errores[`ramas.${id}`] = MENSAJES_EDITOR.ramaHead;
      if (idCommit === null) errores[`commitRama.${id}`] = MENSAJES_EDITOR.commitFalta;
    }
    marcarRepetidos(ramas, ({ nombre }) => nombre, "ramas", MENSAJES_EDITOR.ramaRepetida, errores);
    if (idRespuesta === null) errores.respuesta = MENSAJES_EDITOR.respuestaFalta;
    // solo con los padres bien: si no, las columnas no se pueden contar
    if (padresValidos(commits)) {
      const { columnas } = acomodarGrafo({
        commits: commits.map((_, indice) => ({ nombre: "", padres: padresDe(commits, indice) })),
        ramas: [],
      });
      if (columnas > LIMITES_ACTIVIDADES.columnasGrafoMax) {
        errores.columnas = MENSAJES_EDITOR.demasiadasColumnas;
      }
    }
    return errores;
  },

  resumen: ({ consigna }) => consigna,

  Formulario: FormularioGrafoCommits,
};
