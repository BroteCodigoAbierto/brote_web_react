import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoSelector from "../../componentes/CampoSelector/CampoSelector.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import { CONSIGNA_POR_DEFECTO, LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import {
  crearCategoria,
  crearElemento,
  type BorradorClasificar,
  type ElementoBorrador,
} from "./editorClasificar.ts";

// Formulario de clasificar (spec F11, "Formulario de cada tipo").
export default function FormularioClasificar({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorClasificar>) {
  const { consigna, categorias, elementos } = borrador;
  const opciones = categorias.map(({ id, texto }, indice) => ({
    valor: id,
    texto: texto.trim() !== "" ? texto : `Categoría ${indice + 1}`,
  }));

  function cambiarCategoria(id: string, texto: string) {
    alCambiar({
      ...borrador,
      categorias: categorias.map((fila) => (fila.id === id ? { ...fila, texto } : fila)),
    });
  }

  // sus elementos se quedan sin categoría: el autor decide a dónde van
  function quitarCategoria(id: string) {
    alCambiar({
      ...borrador,
      categorias: categorias.filter((fila) => fila.id !== id),
      elementos: elementos.map((elemento) =>
        elemento.idCategoria === id ? { ...elemento, idCategoria: null } : elemento,
      ),
    });
  }

  function cambiarElemento(id: string, cambios: Partial<ElementoBorrador>) {
    alCambiar({
      ...borrador,
      elementos: elementos.map((fila) => (fila.id === id ? { ...fila, ...cambios } : fila)),
    });
  }

  return (
    <div className={estilos.formulario}>
      <CampoArea
        id={`${idBase}-consigna`}
        etiqueta="Consigna"
        ayuda={`Si la dejas vacía, el alumno ve: ${CONSIGNA_POR_DEFECTO.clasificar}`}
        valor={consigna}
        alCambiar={(valor) => alCambiar({ ...borrador, consigna: valor })}
        maxLongitud={LIMITES_ACTIVIDADES.consignaMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Categorías</legend>
        <ListaEditable
          filas={categorias}
          dibujarFila={(categoria, indice) => (
            <CampoTexto
              id={`${idBase}-categoria-${categoria.id}`}
              etiqueta={`Categoría ${indice + 1}`}
              valor={categoria.texto}
              alCambiar={(texto) => cambiarCategoria(categoria.id, texto)}
              error={errores[`categorias.${categoria.id}`]}
              maxLongitud={LIMITES_ACTIVIDADES.categoriaMax}
              deshabilitado={deshabilitado}
            />
          )}
          alAgregar={() =>
            alCambiar({ ...borrador, categorias: [...categorias, crearCategoria()] })
          }
          alQuitar={quitarCategoria}
          textoAgregar="Agregar categoría"
          minimo={LIMITES_ACTIVIDADES.categoriasMin}
          maximo={LIMITES_ACTIVIDADES.categoriasMax}
          deshabilitada={deshabilitado}
        />
      </fieldset>
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Elementos</legend>
        <ListaEditable
          filas={elementos}
          dibujarFila={(elemento, indice) => (
            <div className={estilos.filaDoble}>
              <CampoTexto
                id={`${idBase}-elemento-${elemento.id}`}
                etiqueta={`Elemento ${indice + 1}`}
                valor={elemento.texto}
                alCambiar={(texto) => cambiarElemento(elemento.id, { texto })}
                error={errores[`elementos.${elemento.id}`]}
                maxLongitud={LIMITES_ACTIVIDADES.elementoClasificarMax}
                deshabilitado={deshabilitado}
              />
              <CampoSelector
                id={`${idBase}-categoria-de-${elemento.id}`}
                etiqueta="Categoría"
                valor={elemento.idCategoria}
                opciones={opciones}
                textoVacio="Elige una categoría"
                alCambiar={(idCategoria) => cambiarElemento(elemento.id, { idCategoria })}
                error={errores[`categoria.${elemento.id}`]}
                deshabilitado={deshabilitado}
              />
            </div>
          )}
          alAgregar={() => alCambiar({ ...borrador, elementos: [...elementos, crearElemento()] })}
          alQuitar={(id) =>
            alCambiar({ ...borrador, elementos: elementos.filter((fila) => fila.id !== id) })
          }
          textoAgregar="Agregar elemento"
          minimo={LIMITES_ACTIVIDADES.elementosClasificarMin}
          maximo={LIMITES_ACTIVIDADES.elementosClasificarMax}
          deshabilitada={deshabilitado}
        />
      </fieldset>
    </div>
  );
}
