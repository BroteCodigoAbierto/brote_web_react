import { useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import DiagramaCommits from "../../componentes/DiagramaCommits/DiagramaCommits.tsx";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";

// Grafo de commits (spec F12): elige un commit, como una opción. Sin las teclas 1 a 9: los
// commits se recorren con Tab y se eligen con Enter o la barra espaciadora.
export default function GrafoCommits({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"grafoCommits">) {
  const [elegido, setElegido] = useState<number | null>(null);
  const [comprobado, setComprobado] = useState(false);
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const acerto = elegido === actividad.respuesta;

  function elegir(indice: number) {
    if (comprobado) return;
    setElegido(indice);
    alInteractuar();
  }

  return (
    <div className={comun.actividad}>
      <h2 ref={inicio} tabIndex={-1} className={comun.consigna}>
        {actividad.consigna}
      </h2>
      <DiagramaCommits
        actividad={actividad}
        elegido={elegido}
        comprobado={comprobado}
        alElegir={elegir}
      />
      {!comprobado ? (
        <BarraRespuesta
          estado="neutro"
          textoBoton="Comprobar"
          deshabilitado={elegido === null}
          alPulsar={() => {
            if (elegido !== null) setComprobado(true);
          }}
        />
      ) : (
        <BarraRespuesta
          estado={acerto ? "correcto" : "incorrecto"}
          titulo={acerto ? "¡Correcto!" : "Respuesta correcta:"}
          codigo={acerto ? undefined : actividad.commits[actividad.respuesta].nombre}
          detalle={actividad.explicacion}
          textoBoton="Continuar"
          alPulsar={() => alTerminar(acerto ? "acierto" : "fallo")}
        />
      )}
    </div>
  );
}
