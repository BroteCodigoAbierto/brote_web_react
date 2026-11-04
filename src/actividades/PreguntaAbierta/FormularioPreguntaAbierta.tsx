import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import { LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import type { BorradorPreguntaAbierta } from "./editorPreguntaAbierta.ts";

// Formulario de la pregunta abierta (spec F05, "Formulario de cada tipo").
export default function FormularioPreguntaAbierta({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorPreguntaAbierta>) {
  return (
    <div className={estilos.formulario}>
      <CampoArea
        id={`${idBase}-pregunta`}
        etiqueta="Pregunta"
        valor={borrador.pregunta}
        alCambiar={(pregunta) => alCambiar({ ...borrador, pregunta })}
        error={errores.pregunta}
        maxLongitud={LIMITES_ACTIVIDADES.preguntaMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
      <CampoArea
        id={`${idBase}-solucion`}
        etiqueta="Solución de referencia"
        valor={borrador.solucion}
        alCambiar={(solucion) => alCambiar({ ...borrador, solucion })}
        error={errores.solucion}
        maxLongitud={LIMITES_ACTIVIDADES.solucionMax}
        filas={5}
        deshabilitado={deshabilitado}
      />
    </div>
  );
}
