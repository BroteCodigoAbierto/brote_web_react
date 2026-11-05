import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ListaEditable from "../../componentes/ListaEditable/ListaEditable.tsx";
import { CONSIGNA_POR_DEFECTO, LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import { crearPareja, type BorradorEmparejar, type ParejaBorrador } from "./editorEmparejar.ts";

// Formulario de emparejar (spec F11, "Formulario de cada tipo").
export default function FormularioEmparejar({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorEmparejar>) {
  const { consigna, parejas } = borrador;

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
      <fieldset className={estilos.grupo}>
        <legend className={estilos.etiqueta}>Parejas</legend>
        <ListaEditable
          filas={parejas}
          dibujarFila={(pareja, indice) => (
            <div className={estilos.filaDoble}>
              <CampoTexto
                id={`${idBase}-izquierda-${pareja.id}`}
                etiqueta={`Izquierda ${indice + 1}`}
                valor={pareja.izquierda}
                alCambiar={(izquierda) => cambiarPareja(pareja.id, { izquierda })}
                error={errores[`izquierda.${pareja.id}`]}
                maxLongitud={LIMITES_ACTIVIDADES.parejaTextoMax}
                deshabilitado={deshabilitado}
              />
              <CampoTexto
                id={`${idBase}-derecha-${pareja.id}`}
                etiqueta={`Derecha ${indice + 1}`}
                valor={pareja.derecha}
                alCambiar={(derecha) => cambiarPareja(pareja.id, { derecha })}
                error={errores[`derecha.${pareja.id}`]}
                maxLongitud={LIMITES_ACTIVIDADES.parejaTextoMax}
                deshabilitado={deshabilitado}
              />
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
