import Aviso from "../../componentes/Aviso/Aviso.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoSelector from "../../componentes/CampoSelector/CampoSelector.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import { LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import {
  crearCommit,
  crearRama,
  type BorradorGrafoCommits,
  type FilaCommit,
  type FilaRama,
  type HeadBorrador,
} from "./editorGrafoCommits.ts";

// Un commit o una rama sin nombre aparece en los selectores con su número.
function nombreCommit({ nombre }: FilaCommit, indice: number): string {
  return nombre.trim() !== "" ? nombre : `Commit ${indice + 1}`;
}

function textoHeadRama({ nombre }: FilaRama, indice: number): string {
  return `Rama ${nombre.trim() !== "" ? nombre : indice + 1}`;
}

function textoHeadCommit({ nombre }: FilaCommit, indice: number): string {
  return `Commit ${nombre.trim() !== "" ? nombre : indice + 1}`;
}

// El selector de HEAD guarda "rama:<id>" o "commit:<id>" (research de F12, punto 9).
function valorHead(head: HeadBorrador): string | null {
  if (head === null) return null;
  return "idRama" in head ? `rama:${head.idRama}` : `commit:${head.idCommit}`;
}

function leerHead(valor: string | null): HeadBorrador {
  if (valor === null) return null;
  const [tipo, id] = [valor.slice(0, valor.indexOf(":")), valor.slice(valor.indexOf(":") + 1)];
  return tipo === "rama" ? { idRama: id } : { idCommit: id };
}

// Formulario del grafo de commits (spec F12, "Formulario de cada tipo"). Los commits no se
// reordenan: la historia se cambia con sus padres.
export default function FormularioGrafoCommits({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorGrafoCommits>) {
  const { commits, ramas, head } = borrador;
  const opcionesCommits = commits.map((commit, indice) => ({
    valor: commit.id,
    texto: nombreCommit(commit, indice),
  }));
  const opcionesHead = [
    ...ramas.map((rama, indice) => ({
      valor: `rama:${rama.id}`,
      texto: textoHeadRama(rama, indice),
    })),
    ...commits.map((commit, indice) => ({
      valor: `commit:${commit.id}`,
      texto: textoHeadCommit(commit, indice),
    })),
  ];

  function cambiarCommit(id: string, cambios: Partial<FilaCommit>) {
    alCambiar({
      ...borrador,
      commits: commits.map((fila) => (fila.id === id ? { ...fila, ...cambios } : fila)),
    });
  }

  // lo que lo usaba se queda vacío: el padre, el commit de una rama y la respuesta muestran su
  // error al guardar; el segundo padre y HEAD, que son opcionales, vuelven a "Ninguno" y a
  // "Sin HEAD"
  function quitarCommit(id: string) {
    alCambiar({
      ...borrador,
      commits: commits
        .filter((fila) => fila.id !== id)
        .map((fila) => ({
          ...fila,
          idPadre: fila.idPadre === id ? null : fila.idPadre,
          idSegundoPadre: fila.idSegundoPadre === id ? null : fila.idSegundoPadre,
        })),
      ramas: ramas.map((rama) => (rama.idCommit === id ? { ...rama, idCommit: null } : rama)),
      head: head && "idCommit" in head && head.idCommit === id ? null : head,
      idRespuesta: borrador.idRespuesta === id ? null : borrador.idRespuesta,
    });
  }

  function cambiarRama(id: string, cambios: Partial<FilaRama>) {
    alCambiar({
      ...borrador,
      ramas: ramas.map((fila) => (fila.id === id ? { ...fila, ...cambios } : fila)),
    });
  }

  function quitarRama(id: string) {
    alCambiar({
      ...borrador,
      ramas: ramas.filter((fila) => fila.id !== id),
      head: head && "idRama" in head && head.idRama === id ? null : head,
    });
  }

  return (
    <div className={estilos.formulario}>
      <CampoArea
        id={`${idBase}-consigna`}
        etiqueta="Consigna"
        valor={borrador.consigna}
        alCambiar={(consigna) => alCambiar({ ...borrador, consigna })}
        error={errores.consigna}
        maxLongitud={LIMITES_ACTIVIDADES.consignaMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Commits</legend>
        <p className={estilos.ayuda}>
          Escríbelos del más antiguo al más nuevo: un commit solo puede tener como padres a los de
          arriba. Con un segundo padre, es un merge.
        </p>
        <ListaEditable
          filas={commits}
          dibujarFila={(commit, indice) => {
            // solo los de arriba
            const anteriores = opcionesCommits.slice(0, indice);
            return (
              <div className={estilos.filaCommit}>
                <CampoTexto
                  id={`${idBase}-commit-${commit.id}`}
                  etiqueta={`Commit ${indice + 1}`}
                  valor={commit.nombre}
                  alCambiar={(nombre) => cambiarCommit(commit.id, { nombre })}
                  error={errores[`commits.${commit.id}`]}
                  maxLongitud={LIMITES_ACTIVIDADES.nombreCommitMax}
                  codigo
                  deshabilitado={deshabilitado}
                />
                {indice === 0 ? (
                  <p className={`${estilos.ayuda} ${estilos.primerCommit}`}>
                    Primer commit: no tiene padre
                  </p>
                ) : (
                  <>
                    <CampoSelector
                      id={`${idBase}-padre-${commit.id}`}
                      etiqueta="Padre"
                      valor={commit.idPadre}
                      opciones={anteriores}
                      textoVacio="Elige un padre"
                      alCambiar={(idPadre) => cambiarCommit(commit.id, { idPadre })}
                      error={errores[`padre.${commit.id}`]}
                      invalido={indice === commits.length - 1 && errores.columnas !== undefined}
                      deshabilitado={deshabilitado}
                    />
                    <CampoSelector
                      id={`${idBase}-segundo-padre-${commit.id}`}
                      etiqueta="Segundo padre"
                      valor={commit.idSegundoPadre}
                      opciones={anteriores}
                      textoVacio="Ninguno"
                      alCambiar={(idSegundoPadre) => cambiarCommit(commit.id, { idSegundoPadre })}
                      error={errores[`segundoPadre.${commit.id}`]}
                      deshabilitado={deshabilitado}
                    />
                  </>
                )}
              </div>
            );
          }}
          alAgregar={() =>
            alCambiar({
              ...borrador,
              commits: [...commits, crearCommit(commits[commits.length - 1]?.id ?? null)],
            })
          }
          alQuitar={quitarCommit}
          textoAgregar="Agregar commit"
          minimo={LIMITES_ACTIVIDADES.commitsMin}
          maximo={LIMITES_ACTIVIDADES.commitsMax}
          deshabilitada={deshabilitado}
        />
        {errores.columnas && <Aviso texto={errores.columnas} />}
      </fieldset>
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Ramas</legend>
        <ListaEditable
          filas={ramas}
          dibujarFila={(rama, indice) => (
            <div className={estilos.filaDoble}>
              <CampoTexto
                id={`${idBase}-rama-${rama.id}`}
                etiqueta={`Rama ${indice + 1}`}
                valor={rama.nombre}
                alCambiar={(nombre) => cambiarRama(rama.id, { nombre })}
                error={errores[`ramas.${rama.id}`]}
                maxLongitud={LIMITES_ACTIVIDADES.nombreRamaMax}
                codigo
                deshabilitado={deshabilitado}
              />
              <CampoSelector
                id={`${idBase}-commit-de-${rama.id}`}
                etiqueta="Commit"
                valor={rama.idCommit}
                opciones={opcionesCommits}
                textoVacio="Elige un commit"
                alCambiar={(idCommit) => cambiarRama(rama.id, { idCommit })}
                error={errores[`commitRama.${rama.id}`]}
                deshabilitado={deshabilitado}
              />
            </div>
          )}
          alAgregar={() => alCambiar({ ...borrador, ramas: [...ramas, crearRama()] })}
          alQuitar={quitarRama}
          textoAgregar="Agregar rama"
          minimo={0}
          maximo={LIMITES_ACTIVIDADES.ramasMax}
          deshabilitada={deshabilitado}
        />
      </fieldset>
      <CampoSelector
        id={`${idBase}-head`}
        etiqueta="HEAD"
        valor={valorHead(head)}
        opciones={opcionesHead}
        textoVacio="Sin HEAD"
        alCambiar={(valor) => alCambiar({ ...borrador, head: leerHead(valor) })}
        deshabilitado={deshabilitado}
      />
      <CampoSelector
        id={`${idBase}-respuesta`}
        etiqueta="Respuesta"
        valor={borrador.idRespuesta}
        opciones={opcionesCommits}
        textoVacio="Elige la respuesta"
        alCambiar={(idRespuesta) => alCambiar({ ...borrador, idRespuesta })}
        error={errores.respuesta}
        deshabilitado={deshabilitado}
      />
      <CampoArea
        id={`${idBase}-explicacion`}
        etiqueta="Explicación"
        valor={borrador.explicacion}
        alCambiar={(explicacion) => alCambiar({ ...borrador, explicacion })}
        ayuda="El alumno la ve al comprobar, acierte o no."
        maxLongitud={LIMITES_ACTIVIDADES.explicacionMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
    </div>
  );
}
