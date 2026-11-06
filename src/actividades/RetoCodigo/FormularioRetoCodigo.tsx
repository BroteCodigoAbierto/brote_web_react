import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoSelector from "../../componentes/CampoSelector/CampoSelector.tsx";
import {
  LENGUAJES_CODIGO,
  LIMITES_ACTIVIDADES,
  NOMBRE_LENGUAJE,
  type LenguajeCodigo,
} from "../../tipos/contrato.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import type { BorradorRetoCodigo } from "./editorRetoCodigo.ts";

const OPCIONES_LENGUAJE = LENGUAJES_CODIGO.map((lenguaje) => ({
  valor: lenguaje,
  texto: NOMBRE_LENGUAJE[lenguaje],
}));

// Formulario del reto de código (spec F12, "Formulario de cada tipo"). Aquí Tab cambia de
// campo, como en todo el editor: el Tab con espacios es solo del alumno.
export default function FormularioRetoCodigo({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorRetoCodigo>) {
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
      <CampoSelector
        id={`${idBase}-lenguaje`}
        etiqueta="Lenguaje"
        valor={borrador.lenguaje}
        opciones={OPCIONES_LENGUAJE}
        textoVacio="Elige un lenguaje"
        alCambiar={(lenguaje) =>
          alCambiar({ ...borrador, lenguaje: lenguaje as LenguajeCodigo | null })
        }
        error={errores.lenguaje}
        ayuda="Se muestra como etiqueta en el panel de código. Con Otro, no se muestra."
        deshabilitado={deshabilitado}
      />
      <CampoArea
        id={`${idBase}-codigo-inicial`}
        etiqueta="Código inicial"
        valor={borrador.codigoInicial}
        alCambiar={(codigoInicial) => alCambiar({ ...borrador, codigoInicial })}
        ayuda="El alumno empieza con este código. Si lo dejas vacío, empieza en blanco."
        maxLongitud={LIMITES_ACTIVIDADES.codigoMax}
        filas={5}
        codigo
        deshabilitado={deshabilitado}
      />
      <CampoArea
        id={`${idBase}-solucion`}
        etiqueta="Solución"
        valor={borrador.solucion}
        alCambiar={(solucion) => alCambiar({ ...borrador, solucion })}
        error={errores.solucion}
        ayuda="El alumno la ve al comprobar, para compararla con lo que escribió."
        maxLongitud={LIMITES_ACTIVIDADES.solucionMax}
        filas={5}
        codigo
        deshabilitado={deshabilitado}
      />
    </div>
  );
}
