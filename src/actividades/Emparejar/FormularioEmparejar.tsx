import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoImagen from "../../componentes/CampoImagen/CampoImagen.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import { useSubidas } from "../../contextos/ContextoSubidas.ts";
import SelectorTipoContenido from "../../editor/SelectorTipoContenido/SelectorTipoContenido.tsx";
import { CONSIGNA_POR_DEFECTO, LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import { crearPareja, type BorradorEmparejar, type ParejaBorrador } from "./editorEmparejar.ts";

// Formulario de emparejar (spec F11, "Formulario de cada tipo"). Desde F13, cada columna es
// de textos o de imágenes.
export default function FormularioEmparejar({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorEmparejar>) {
  const { consigna, parejas, tipoIzquierda, tipoDerecha } = borrador;
  const { subir } = useSubidas();

  function cambiarPareja(id: string, cambios: Partial<ParejaBorrador>) {
    alCambiar({
      ...borrador,
      parejas: parejas.map((pareja) => (pareja.id === id ? { ...pareja, ...cambios } : pareja)),
    });
  }

  return (
    <div className={estilos.formulario}>
      <CampoArea
        id={`${idBase}-consigna`}
        etiqueta="Consigna"
        ayuda={`Si la dejas vacía, el alumno ve: ${CONSIGNA_POR_DEFECTO.emparejar}`}
        valor={consigna}
        alCambiar={(valor) => alCambiar({ ...borrador, consigna: valor })}
        maxLongitud={LIMITES_ACTIVIDADES.consignaMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
      <SelectorTipoContenido
        nombre={`${idBase}-tipo-izquierda`}
        etiqueta="Columna izquierda"
        valor={tipoIzquierda}
        alCambiar={(tipo) => alCambiar({ ...borrador, tipoIzquierda: tipo })}
        deshabilitado={deshabilitado}
      />
      <SelectorTipoContenido
        nombre={`${idBase}-tipo-derecha`}
        etiqueta="Columna derecha"
        valor={tipoDerecha}
        alCambiar={(tipo) => alCambiar({ ...borrador, tipoDerecha: tipo })}
        deshabilitado={deshabilitado}
      />
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Parejas</legend>
        <ListaEditable
          filas={parejas}
          dibujarFila={(pareja, indice) => (
            <div className={estilos.filaDoble}>
              {tipoIzquierda === "imagen" ? (
                <CampoImagen
                  id={`${idBase}-izquierda-${pareja.id}`}
                  etiqueta={`Izquierda ${indice + 1}`}
                  valor={pareja.imagenIzquierda}
                  alCambiar={(imagenIzquierda) => cambiarPareja(pareja.id, { imagenIzquierda })}
                  alElegirArchivo={subir}
                  error={errores[`izquierda.${pareja.id}`]}
                  deshabilitado={deshabilitado}
                />
              ) : (
                <CampoTexto
                  id={`${idBase}-izquierda-${pareja.id}`}
                  etiqueta={`Izquierda ${indice + 1}`}
                  valor={pareja.izquierda}
                  alCambiar={(izquierda) => cambiarPareja(pareja.id, { izquierda })}
                  error={errores[`izquierda.${pareja.id}`]}
                  maxLongitud={LIMITES_ACTIVIDADES.parejaTextoMax}
                  deshabilitado={deshabilitado}
                />
              )}
              {tipoDerecha === "imagen" ? (
                <CampoImagen
                  id={`${idBase}-derecha-${pareja.id}`}
                  etiqueta={`Derecha ${indice + 1}`}
                  valor={pareja.imagenDerecha}
                  alCambiar={(imagenDerecha) => cambiarPareja(pareja.id, { imagenDerecha })}
                  alElegirArchivo={subir}
                  error={errores[`derecha.${pareja.id}`]}
                  deshabilitado={deshabilitado}
                />
              ) : (
                <CampoTexto
                  id={`${idBase}-derecha-${pareja.id}`}
                  etiqueta={`Derecha ${indice + 1}`}
                  valor={pareja.derecha}
                  alCambiar={(derecha) => cambiarPareja(pareja.id, { derecha })}
                  error={errores[`derecha.${pareja.id}`]}
                  maxLongitud={LIMITES_ACTIVIDADES.parejaTextoMax}
                  deshabilitado={deshabilitado}
                />
              )}
            </div>
          )}
          alAgregar={() => alCambiar({ ...borrador, parejas: [...parejas, crearPareja()] })}
          alQuitar={(id) =>
            alCambiar({ ...borrador, parejas: parejas.filter((pareja) => pareja.id !== id) })
          }
          textoAgregar="Agregar pareja"
          minimo={LIMITES_ACTIVIDADES.parejasMin}
          maximo={LIMITES_ACTIVIDADES.parejasMax}
          deshabilitada={deshabilitado}
        />
      </fieldset>
    </div>
  );
}
