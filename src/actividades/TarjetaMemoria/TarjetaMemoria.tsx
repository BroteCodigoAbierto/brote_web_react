import { RotateCw } from "lucide-react";
import { useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import TarjetaVolteable from "../../componentes/TarjetaVolteable/TarjetaVolteable.tsx";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";

// Tarjeta de memoria (spec F03): se voltea las veces que quiera; "Continuar"
// se habilita al voltearla por primera vez. No se califica.
export default function TarjetaMemoria({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"tarjeta">) {
  const [volteada, setVolteada] = useState(false);
  const [yaVolteada, setYaVolteada] = useState(false);
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();

  function voltear() {
    setVolteada((antes) => !antes);
    if (!yaVolteada) {
      setYaVolteada(true);
      alInteractuar();
    }
  }

  return (
    <div className={comun.actividad}>
      <h2 ref={inicio} tabIndex={-1} className="oculto">
        Tarjeta de memoria
      </h2>
      <TarjetaVolteable
        frente={actividad.frente}
        reverso={actividad.reverso}
        volteada={volteada}
        alVoltear={voltear}
      />
      {!yaVolteada && (
        <p className={comun.indicacion}>
          <RotateCw aria-hidden="true" />
          Toca la tarjeta para voltearla
        </p>
      )}
      <BarraRespuesta
        estado="neutro"
        textoBoton="Continuar"
        deshabilitado={!yaVolteada}
        alPulsar={() => alTerminar("sinCalificar")}
      />
    </div>
  );
}
