import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import { LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import estilos from "../formulario.module.css";
import type { PropsFormularioActividad } from "../tipos.ts";
import type { BorradorTarjeta } from "./editorTarjeta.ts";

// Formulario de la tarjeta (spec F05, "Formulario de cada tipo").
export default function FormularioTarjeta({
  borrador,
  alCambiar,
  errores,
  idBase,
  deshabilitado,
}: PropsFormularioActividad<BorradorTarjeta>) {
  return (
    <div className={estilos.formulario}>
      <CampoArea
        id={`${idBase}-frente`}
        etiqueta="Frente"
        valor={borrador.frente}
        alCambiar={(frente) => alCambiar({ ...borrador, frente })}
        error={errores.frente}
        maxLongitud={LIMITES_ACTIVIDADES.frenteMax}
        filas={2}
        deshabilitado={deshabilitado}
      />
      <CampoArea
        id={`${idBase}-reverso`}
        etiqueta="Reverso"
        valor={borrador.reverso}
        alCambiar={(reverso) => alCambiar({ ...borrador, reverso })}
        error={errores.reverso}
        maxLongitud={LIMITES_ACTIVIDADES.reversoMax}
        deshabilitado={deshabilitado}
      />
    </div>
  );
}
