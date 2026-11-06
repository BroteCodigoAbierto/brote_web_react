import { useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import PanelTerminal from "../../componentes/PanelTerminal/PanelTerminal.tsx";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import { comandoAceptado } from "../../utilidades/codigo.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";

// Terminal simulada (spec F12): escribe un comando y Enter (o "Comprobar") lo compara con
// los aceptados. Un solo intento. No se ejecuta nada: si falla, la terminal no inventa una
// salida, y la barra muestra el primer comando aceptado y la pista.
export default function TerminalSimulada({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"terminalSimulada">) {
  const [comando, setComando] = useState("");
  const [acerto, setAcerto] = useState<boolean | null>(null);
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const comprobada = acerto !== null;

  function escribir(valor: string) {
    setComando(valor);
    alInteractuar();
  }

  function comprobar() {
    if (comprobada || comando.trim() === "") return;
    setAcerto(comandoAceptado(comando, actividad.comandos));
  }

  return (
    <div className={comun.actividad}>
      <h2 ref={inicio} tabIndex={-1} className={comun.consigna}>
        {actividad.consigna}
      </h2>
      <PanelTerminal
        salidaPrevia={actividad.salidaPrevia}
        carpeta={actividad.carpeta}
        comando={comando}
        alCambiar={escribir}
        alEnviar={comprobar}
        soloLectura={comprobada}
        salida={acerto ? actividad.salidaAcierto : undefined}
      />
      {!comprobada ? (
        <BarraRespuesta
          estado="neutro"
          textoBoton="Comprobar"
          deshabilitado={comando.trim() === ""}
          alPulsar={comprobar}
        />
      ) : acerto ? (
        <BarraRespuesta
          estado="correcto"
          titulo="¡Correcto!"
          textoBoton="Continuar"
          alPulsar={() => alTerminar("acierto")}
        />
      ) : (
        <BarraRespuesta
          estado="incorrecto"
          titulo="Respuesta correcta:"
          codigo={actividad.comandos[0]}
          detalle={actividad.pista}
          textoBoton="Continuar"
          alPulsar={() => alTerminar("fallo")}
        />
      )}
    </div>
  );
}
