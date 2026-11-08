import BotonesOrden from "../../componentes/BotonesOrden/BotonesOrden.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoImagen from "../../componentes/CampoImagen/CampoImagen.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import { useSubidas } from "../../contextos/ContextoSubidas.ts";
import type { ValorImagen } from "../../editor/imagenes.ts";
import SelectorTipoContenido from "../../editor/SelectorTipoContenido/SelectorTipoContenido.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import { LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import { crearElementoOrdenar, type BorradorOrdenar } from "./editorOrdenar.ts";

// Formulario de ordenar (spec F11, "Formulario de cada tipo"). El orden de la lista es la
// respuesta: por eso aquí sí hay "Subir" y "Bajar".
export default function FormularioOrdenar({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorOrdenar>) {
  const { consigna, elementos, tipoElementos } = borrador;
  const { subir } = useSubidas();

  function cambiarElemento(id: string, cambios: { texto?: string; imagen?: ValorImagen }) {
    alCambiar({
      ...borrador,
      elementos: elementos.map((fila) => (fila.id === id ? { ...fila, ...cambios } : fila)),
    });
  }

  function mover(desde: number, hasta: number) {
    const nuevos = [...elementos];
    const [fila] = nuevos.splice(desde, 1);
    if (fila) nuevos.splice(hasta, 0, fila);
    alCambiar({ ...borrador, elementos: nuevos });
  }

  return (
    <div className={estilos.formulario}>
      <CampoArea
        id={`${idBase}-consigna`}
        etiqueta="Consigna"
        valor={consigna}
        alCambiar={(valor) => alCambiar({ ...borrador, consigna: valor })}
        error={errores.consigna}
        maxLongitud={LIMITES_ACTIVIDADES.consignaMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
      <SelectorTipoContenido
        nombre={`${idBase}-tipo-elementos`}
        etiqueta="Tipo de elementos"
        valor={tipoElementos}
        alCambiar={(tipo) => alCambiar({ ...borrador, tipoElementos: tipo })}
        deshabilitado={deshabilitado}
      />
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Elementos</legend>
        <p className={estilos.ayuda}>
          Escríbelos en el orden correcto. El alumno los verá mezclados.
        </p>
        <ListaEditable
          filas={elementos}
          dibujarFila={(elemento, indice) => (
            <div className={estilos.filaConOrden}>
              {tipoElementos === "imagen" ? (
                <CampoImagen
                  id={`${idBase}-elemento-${elemento.id}`}
                  etiqueta={`Elemento ${indice + 1}`}
                  valor={elemento.imagen}
                  alCambiar={(imagen) => cambiarElemento(elemento.id, { imagen })}
                  alElegirArchivo={subir}
                  error={errores[`elementos.${elemento.id}`]}
                  deshabilitado={deshabilitado}
                />
              ) : (
                <CampoTexto
                  id={`${idBase}-elemento-${elemento.id}`}
                  etiqueta={`Elemento ${indice + 1}`}
                  valor={elemento.texto}
                  alCambiar={(texto) => cambiarElemento(elemento.id, { texto })}
                  error={errores[`elementos.${elemento.id}`]}
                  maxLongitud={LIMITES_ACTIVIDADES.elementoOrdenarMax}
                  deshabilitado={deshabilitado}
                />
              )}
              <div className={estilos.botonesFila}>
                <BotonesOrden
                  alSubir={() => mover(indice, indice - 1)}
                  alBajar={() => mover(indice, indice + 1)}
                  esPrimero={indice === 0}
                  esUltimo={indice === elementos.length - 1}
                  etiqueta={`elemento ${indice + 1}`}
                  deshabilitado={deshabilitado}
                />
              </div>
            </div>
          )}
          alAgregar={() =>
            alCambiar({ ...borrador, elementos: [...elementos, crearElementoOrdenar()] })
          }
          alQuitar={(id) =>
            alCambiar({ ...borrador, elementos: elementos.filter((fila) => fila.id !== id) })
          }
          textoAgregar="Agregar elemento"
          minimo={LIMITES_ACTIVIDADES.elementosOrdenarMin}
          maximo={LIMITES_ACTIVIDADES.elementosOrdenarMax}
          deshabilitada={deshabilitado}
        />
      </fieldset>
    </div>
  );
}
