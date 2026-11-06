import { useEffect, useRef, useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import BloqueCodigo from "../../componentes/BloqueCodigo/BloqueCodigo.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoCodigo from "../../componentes/CampoCodigo/CampoCodigo.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";
import estilos from "./RetoCodigo.module.css";

// Reto de código (spec F12): escribe su código, ve la solución de referencia y se califica
// él mismo, como en la pregunta abierta. No se ejecuta nada.
export default function RetoCodigo({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"retoCodigo">) {
  const inicial = actividad.codigoInicial ?? "";
  const [codigo, setCodigo] = useState(inicial);
  const [comprobada, setComprobada] = useState(false);
  const [laTuvoBien, setLaTuvoBien] = useState<boolean | null>(null);
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const autoevaluacion = useRef<HTMLDivElement>(null);
  // para comprobar tiene que intentar algo: escribir y cambiar el código inicial
  const sinRespuesta = codigo.trim() === "" || codigo === inicial;

  // al ver la solución, el foco pasa a la autoevaluación
  useEffect(() => {
    if (comprobada) autoevaluacion.current?.querySelector("button")?.focus();
  }, [comprobada]);

  function escribir(valor: string) {
    setCodigo(valor);
    alInteractuar();
  }

  function comprobar() {
    if (!sinRespuesta) setComprobada(true);
  }

  return (
    <div className={comun.actividad}>
      <h2 ref={inicio} tabIndex={-1} className={comun.consigna}>
        {actividad.consigna}
      </h2>
      <CampoCodigo
        valor={codigo}
        alCambiar={escribir}
        lenguaje={actividad.lenguaje}
        soloLectura={comprobada}
        etiqueta="Tu código"
      />
      {comprobada && (
        <>
          <Superficie tono="suave" className={estilos.solucion}>
            <p className={estilos.seccion}>Solución de referencia</p>
            {/* en SQL o Bash, una línea con - es código normal: sin colores de diff */}
            <BloqueCodigo codigo={actividad.solucion} lenguaje={actividad.lenguaje} diff={false} />
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
          deshabilitado={sinRespuesta}
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
