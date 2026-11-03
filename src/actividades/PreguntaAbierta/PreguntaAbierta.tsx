import { useEffect, useId, useRef, useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import { LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";
import estilos from "./PreguntaAbierta.module.css";

// Pregunta abierta (spec F03): escribe su respuesta, ve la solución de
// referencia y se califica él mismo.
export default function PreguntaAbierta({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"preguntaAbierta">) {
  const [respuesta, setRespuesta] = useState("");
  const [comprobada, setComprobada] = useState(false);
  const [laTuvoBien, setLaTuvoBien] = useState<boolean | null>(null);
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const autoevaluacion = useRef<HTMLDivElement>(null);
  const idPregunta = useId();

  // al ver la solución, el foco pasa a la autoevaluación
  useEffect(() => {
    if (comprobada) autoevaluacion.current?.querySelector("button")?.focus();
  }, [comprobada]);

  function escribir(valor: string) {
    setRespuesta(valor);
    alInteractuar();
  }

  function comprobar() {
    if (respuesta.trim() !== "") setComprobada(true);
  }

  return (
    <div className={comun.actividad}>
      <h2 ref={inicio} tabIndex={-1} id={idPregunta} className={comun.consigna}>
        {actividad.pregunta}
      </h2>
      <textarea
        className={estilos.respuesta}
        value={respuesta}
        onChange={(evento) => escribir(evento.target.value)}
        placeholder="Escribe tu respuesta…"
        aria-labelledby={idPregunta}
        maxLength={LIMITES_ACTIVIDADES.respuestaAbiertaMax}
        readOnly={comprobada}
        rows={5}
      />
      {comprobada && (
        <>
          <Superficie tono="suave" className={estilos.solucion}>
            <p className={estilos.seccion}>Solución de referencia</p>
            <p className={comun.parrafo}>{actividad.solucion}</p>
          </Superficie>
          {laTuvoBien === null && (
            <div className={estilos.autoevaluacion} ref={autoevaluacion}>
              <p className={estilos.preguntaAuto}>¿La tuviste bien?</p>
              <div className={estilos.botones}>
                <Boton variante="secundario" alPulsar={() => setLaTuvoBien(true)}>
                  La tuve bien
                </Boton>
                <Boton variante="secundario" alPulsar={() => setLaTuvoBien(false)}>
                  No la tuve
                </Boton>
              </div>
            </div>
          )}
        </>
      )}
      {/* mientras se autoevalúa no hay "Continuar": la acción son sus dos botones */}
      {!comprobada && (
        <BarraRespuesta
          estado="neutro"
          textoBoton="Comprobar"
          deshabilitado={respuesta.trim() === ""}
          alPulsar={comprobar}
        />
      )}
      {laTuvoBien !== null && (
        <BarraRespuesta
          estado={laTuvoBien ? "correcto" : "incorrecto"}
          titulo={laTuvoBien ? "¡Correcto!" : "A repasar"}
          textoBoton="Continuar"
          alPulsar={() => alTerminar(laTuvoBien ? "acierto" : "fallo")}
        />
      )}
    </div>
  );
}
