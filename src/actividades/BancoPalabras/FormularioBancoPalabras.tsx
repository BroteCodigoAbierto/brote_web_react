import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoConEspacios from "../../componentes/CampoConEspacios/CampoConEspacios.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import {
  CONSIGNA_POR_DEFECTO,
  LIMITES_ACTIVIDADES,
  MENSAJES_EDITOR,
} from "../../tipos/contrato.ts";
import { ajustarGrupos, contarEspacios } from "../CompletarEspacios/grupos.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import { crearFicha, type BorradorBancoPalabras } from "./editorBancoPalabras.ts";
import {
  alternarPalabra,
  crearGrupoFichas,
  esGrupoSinMarcas,
  palabraMarcada,
  palabrasDelBanco,
  type GrupoFichas,
} from "./grupos.ts";

// Formulario del banco de palabras (spec F11, "Formulario de cada tipo").
export default function FormularioBancoPalabras({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorBancoPalabras>) {
  const { consigna, texto, fichas, grupos } = borrador;
  const palabras = palabrasDelBanco(fichas);
  // se ve siempre, no solo al intentar guardar: el autor tiene que elegir cuál sobra
  const sobranGrupos = grupos.length > contarEspacios(texto);

  function cambiarTexto(nuevo: string) {
    alCambiar({
      ...borrador,
      texto: nuevo,
      grupos: ajustarGrupos(nuevo, grupos, {
        esVacio: esGrupoSinMarcas,
        crear: crearGrupoFichas,
      }),
    });
  }

  function cambiarFicha(id: string, nuevo: string) {
    alCambiar({
      ...borrador,
      fichas: fichas.map((ficha) => (ficha.id === id ? { ...ficha, texto: nuevo } : ficha)),
    });
  }

  function quitarFicha(id: string) {
    alCambiar({
      ...borrador,
      fichas: fichas.filter((ficha) => ficha.id !== id),
      grupos: grupos.map((grupo) => ({
        ...grupo,
        idFichas: grupo.idFichas.filter((idFicha) => idFicha !== id),
      })),
    });
  }

  function marcar(grupo: GrupoFichas, palabra: string) {
    alCambiar({
      ...borrador,
      grupos: grupos.map((actual) =>
        actual.id === grupo.id ? alternarPalabra(grupo, fichas, palabra) : actual,
      ),
    });
  }

  return (
    <div className={estilos.formulario}>
      <CampoArea
        id={`${idBase}-consigna`}
        etiqueta="Consigna"
        ayuda={`Si la dejas vacía, el alumno ve: ${CONSIGNA_POR_DEFECTO.bancoPalabras}`}
        valor={consigna}
        alCambiar={(valor) => alCambiar({ ...borrador, consigna: valor })}
        maxLongitud={LIMITES_ACTIVIDADES.consignaMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
      <CampoConEspacios
        id={`${idBase}-texto`}
        valor={texto}
        alCambiar={cambiarTexto}
        ayuda="Cada ___ es un espacio que el alumno llena con una ficha."
        error={errores.texto}
        maxLongitud={LIMITES_ACTIVIDADES.textoEspaciosMax}
        deshabilitado={deshabilitado}
      />
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Fichas</legend>
        <p className={estilos.ayuda}>
          Incluye las que van en los espacios y otras de más. Si una palabra va en dos espacios,
          agrégala dos veces.
        </p>
        <ListaEditable
          filas={fichas}
          dibujarFila={(ficha, indice) => (
            <CampoTexto
              id={`${idBase}-ficha-${ficha.id}`}
              etiqueta={`Ficha ${indice + 1}`}
              valor={ficha.texto}
              alCambiar={(nuevo) => cambiarFicha(ficha.id, nuevo)}
              error={errores[`fichas.${ficha.id}`]}
              invalido={indice === 0 && errores.fichas !== undefined}
              maxLongitud={LIMITES_ACTIVIDADES.fichaMax}
              deshabilitado={deshabilitado}
            />
          )}
          alAgregar={() => alCambiar({ ...borrador, fichas: [...fichas, crearFicha()] })}
          alQuitar={quitarFicha}
          textoAgregar="Agregar ficha"
          minimo={LIMITES_ACTIVIDADES.fichasMin}
          maximo={LIMITES_ACTIVIDADES.fichasMax}
          deshabilitada={deshabilitado}
        />
      </fieldset>
      {errores.fichas && <Aviso texto={errores.fichas} />}
      {sobranGrupos && <Aviso tono="calido" texto={MENSAJES_EDITOR.gruposDeMas} />}
      {grupos.map((grupo, indice) => {
        const error = errores[`grupo.${grupo.id}`];
        return (
          <fieldset key={grupo.id} className={estilos.grupo}>
            <legend className={estilos.etiqueta}>Espacio {indice + 1}</legend>
            <div className={estilos.casillas}>
              {palabras.map((palabra, lugar) => (
                <label key={palabra} className={estilos.radio}>
                  <input
                    type="checkbox"
                    checked={palabraMarcada(grupo, fichas, palabra)}
                    onChange={() => marcar(grupo, palabra)}
                    disabled={deshabilitado}
                    aria-invalid={error && lugar === 0 ? true : undefined}
                  />
                  {palabra}
                </label>
              ))}
            </div>
            {error && <Aviso texto={error} />}
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
          </fieldset>
        );
      })}
    </div>
  );
}
