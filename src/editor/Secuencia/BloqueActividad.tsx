import { CircleAlert, GripVertical } from "lucide-react";
import type { ReactNode } from "react";
import Boton from "../../componentes/Boton/Boton.tsx";
import Insignia from "../../componentes/Insignia/Insignia.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import type { TipoActividad } from "../../tipos/contrato.ts";
import { datosTipo } from "../paleta.ts";
import estilos from "./Secuencia.module.css";

type PropsBloqueActividad = {
  numero: number;
  tipo: TipoActividad;
  resumen: string;
  incompleta: boolean;
  seleccionado: boolean;
  alSeleccionar: () => void;
  alEliminar: () => void;
  deshabilitado: boolean;
  // BotonesOrden
  orden: ReactNode;
};

// Una actividad en la secuencia (docs/diseno.md, sección 4, "Editor (solo web)"). Lo
// que selecciona es un botón aparte, para llegar con el teclado sin anidar botones.
export default function BloqueActividad({
  numero,
  tipo,
  resumen,
  incompleta,
  seleccionado,
  alSeleccionar,
  alEliminar,
  deshabilitado,
  orden,
}: PropsBloqueActividad) {
  const { etiqueta, icono: Icono } = datosTipo(tipo);

  return (
    <Superficie className={`${estilos.bloque} ${seleccionado ? estilos.seleccionado : ""}`}>
      <GripVertical className={estilos.asa} aria-hidden="true" />
      <button
        type="button"
        className={estilos.contenido}
        aria-pressed={seleccionado}
        disabled={deshabilitado}
        onClick={alSeleccionar}
      >
        <span className={estilos.cabecera}>
          <span className={estilos.numero}>{numero}</span>
          <Icono className={estilos.icono} aria-hidden="true" />
          <span className={estilos.tipo}>{etiqueta}</span>
          {incompleta && (
            <Insignia tono="acento" icono={CircleAlert}>
              Incompleta
            </Insignia>
          )}
        </span>
        <span className={resumen.trim() === "" ? estilos.sinContenido : estilos.resumen}>
          {resumen.trim() === "" ? "Sin contenido" : resumen}
        </span>
      </button>
      {orden}
      <Boton variante="fantasma" tamano="chico" deshabilitado={deshabilitado} alPulsar={alEliminar}>
        Eliminar
      </Boton>
    </Superficie>
  );
}
