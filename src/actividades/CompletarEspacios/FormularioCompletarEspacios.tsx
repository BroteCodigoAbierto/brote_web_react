import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoConEspacios from "../../componentes/CampoConEspacios/CampoConEspacios.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import { LIMITES_ACTIVIDADES, MENSAJES_EDITOR } from "../../tipos/contrato.ts";
import { idLocal } from "../../utilidades/editor.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import type { BorradorCompletarEspacios } from "./editorCompletarEspacios.ts";
import {
  ajustarGrupos,
  contarEspacios,
  crearGrupo,
  esGrupoVacio,
  type GrupoRespuestas,
} from "./grupos.ts";

// Formulario de completar espacios (spec F05, "Formulario de cada tipo").
export default function FormularioCompletarEspacios({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorCompletarEspacios>) {
  const { texto, grupos } = borrador;
  // se ve siempre, no solo al intentar guardar: el autor tiene que elegir cuál sobra
  const sobranGrupos = grupos.length > contarEspacios(texto);

  function cambiarTexto(nuevo: string) {
    alCambiar({
      texto: nuevo,
      grupos: ajustarGrupos(nuevo, grupos, { esVacio: esGrupoVacio, crear: crearGrupo }),
    });
  }

  function cambiarGrupo(id: string, cambios: Partial<GrupoRespuestas>) {
    alCambiar({
      ...borrador,
      grupos: grupos.map((grupo) => (grupo.id === id ? { ...grupo, ...cambios } : grupo)),
    });
  }

  return (
    <div className={estilos.formulario}>
      <CampoConEspacios
        id={`${idBase}-texto`}
        valor={texto}
        alCambiar={cambiarTexto}
        ayuda="Cada ___ es un espacio que el alumno llena."
        error={errores.texto}
        maxLongitud={LIMITES_ACTIVIDADES.textoEspaciosMax}
        deshabilitado={deshabilitado}
      />
      {sobranGrupos && <Aviso tono="calido" texto={MENSAJES_EDITOR.gruposDeMas} />}
      {grupos.map((grupo, indice) => (
        <div key={grupo.id} className={estilos.grupo}>
          <p className={estilos.etiqueta}>Espacio {indice + 1}</p>
          <ListaEditable
            filas={grupo.aceptadas}
            dibujarFila={(aceptada, lugar) => (
              <CampoTexto
                id={`${idBase}-aceptada-${aceptada.id}`}
                etiqueta={`Respuesta ${lugar + 1}`}
                valor={aceptada.texto}
                alCambiar={(valor) =>
                  cambiarGrupo(grupo.id, {
                    aceptadas: grupo.aceptadas.map((fila) =>
                      fila.id === aceptada.id ? { ...fila, texto: valor } : fila,
                    ),
                  })
                }
                error={lugar === 0 ? errores[`grupo.${grupo.id}`] : undefined}
                ayuda={lugar === 0 ? "Es la que ve el alumno como respuesta esperada" : undefined}
                maxLongitud={LIMITES_ACTIVIDADES.respuestaEspacioMax}
                deshabilitado={deshabilitado}
              />
            )}
            alAgregar={() =>
              cambiarGrupo(grupo.id, {
                aceptadas: [...grupo.aceptadas, { id: idLocal(), texto: "" }],
              })
            }
            alQuitar={(id) =>
              cambiarGrupo(grupo.id, {
                aceptadas: grupo.aceptadas.filter((fila) => fila.id !== id),
              })
            }
            textoAgregar="Agregar respuesta"
            minimo={1}
            maximo={LIMITES_ACTIVIDADES.aceptadasMax}
            deshabilitada={deshabilitado}
          />
          {sobranGrupos && (
            <div>
              <Boton
                variante="fantasma"
                tamano="chico"
                deshabilitado={deshabilitado}
                alPulsar={() =>
                  alCambiar({ ...borrador, grupos: grupos.filter(({ id }) => id !== grupo.id) })
                }
              >
                Quitar espacio
              </Boton>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
