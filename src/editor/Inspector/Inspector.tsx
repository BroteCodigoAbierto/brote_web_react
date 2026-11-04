import { registroEditor } from "../../actividades/registroEditor.ts";
import type { EditorActividad } from "../../actividades/tipos.ts";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import type { TipoActividad } from "../../tipos/contrato.ts";
import { aActividad, erroresDe, type Bloque } from "../estadoLeccion.ts";
import { datosTipo } from "../paleta.ts";
import VistaPrevia from "../VistaPrevia/VistaPrevia.tsx";
import estilos from "./Inspector.module.css";

type PropsInspector = {
  bloque: Bloque | null;
  mostrarErrores: boolean;
  alCambiar: (id: string, borrador: unknown) => void;
  deshabilitado: boolean;
};

// El formulario de la actividad seleccionada y, debajo, su vista previa (spec F05).
export default function Inspector({
  bloque,
  mostrarErrores,
  alCambiar,
  deshabilitado,
}: PropsInspector) {
  if (!bloque) {
    return (
      <Superficie className={estilos.panel}>
        <p className={estilos.mensaje}>Elige una actividad para editarla.</p>
      </Superficie>
    );
  }

  const { Formulario } = registroEditor[bloque.tipo] as EditorActividad<TipoActividad, unknown>;
  const errores = erroresDe(bloque);
  const completa = Object.keys(errores).length === 0;

  return (
    <div className={estilos.inspector}>
      <Superficie className={estilos.panel}>
        <h2 className={estilos.titulo}>{datosTipo(bloque.tipo).etiqueta}</h2>
        {/* con key: otro bloque empieza sin lo de este */}
        <Formulario
          key={bloque.id}
          borrador={bloque.borrador}
          alCambiar={(borrador) => alCambiar(bloque.id, borrador)}
          errores={mostrarErrores ? errores : {}}
          idBase={bloque.id}
          deshabilitado={deshabilitado}
        />
      </Superficie>
      <VistaPrevia
        key={bloque.id}
        actividad={completa ? aActividad(bloque) : null}
        idBloque={bloque.id}
      />
    </div>
  );
}
