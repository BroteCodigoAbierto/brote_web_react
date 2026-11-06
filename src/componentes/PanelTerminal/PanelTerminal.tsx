import { useId, type ChangeEvent, type KeyboardEvent } from "react";
import { useAlturaAutomatica } from "../../hooks/useAlturaAutomatica.ts";
import { LIMITES_ACTIVIDADES } from "../../tipos/contrato.ts";
import { limpiarEscrito } from "../../utilidades/codigo.ts";
import estilos from "./PanelTerminal.module.css";

type PropsPanelTerminal = {
  salidaPrevia?: string;
  carpeta?: string;
  comando: string;
  alCambiar: (comando: string) => void;
  // con Enter, solo si hay algo escrito
  alEnviar: () => void;
  soloLectura?: boolean;
  // va debajo del comando (al acertar)
  salida?: string;
};

// La terminal simulada (docs/diseno.md, sección 4): el panel oscuro con la salida previa, la
// línea del comando y, al acertar, su salida. La línea es un textarea para que un comando
// largo pase a la línea siguiente mientras se escribe (brote_specs, research de F12, punto 6).
export default function PanelTerminal({
  salidaPrevia,
  carpeta,
  comando,
  alCambiar,
  alEnviar,
  soloLectura = false,
  salida,
}: PropsPanelTerminal) {
  const linea = useAlturaAutomatica(comando);
  const idCarpeta = useId();

  function enviar() {
    if (!soloLectura && comando.trim() !== "") alEnviar();
  }

  function manejarCambio(evento: ChangeEvent<HTMLTextAreaElement>) {
    const area = evento.currentTarget;
    const { texto, cursor } = limpiarEscrito(
      area.value,
      area.selectionStart,
      LIMITES_ACTIVIDADES.comandoMax,
      true,
    );
    // si el texto cambió, React lo reemplaza y el cursor salta al final: se devuelve a su lugar
    if (texto !== area.value) requestAnimationFrame(() => area.setSelectionRange(cursor, cursor));
    alCambiar(texto);
  }

  // Enter comprueba; con el comando vacío no hace nada, y nunca salta de línea
  function manejarTecla(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key !== "Enter" || evento.nativeEvent.isComposing) return;
    evento.preventDefault();
    enviar();
  }

  // pulsar en cualquier parte pone el cursor en la línea, salvo al seleccionar la salida
  function enfocarLinea() {
    if (soloLectura || window.getSelection()?.toString()) return;
    linea.current?.focus();
  }

  return (
    <form
      className={estilos.panel}
      onClick={enfocarLinea}
      onSubmit={(evento) => {
        evento.preventDefault();
        enviar();
      }}
    >
      {salidaPrevia && <pre className={estilos.salida}>{salidaPrevia}</pre>}
      <div className={estilos.linea}>
        <span className={estilos.indicador}>
          {carpeta && (
            <span id={idCarpeta} className={estilos.carpeta}>
              {carpeta}
            </span>
          )}
          <span className={estilos.dolar} aria-hidden="true">
            $
          </span>
        </span>
        <textarea
          ref={linea}
          className={estilos.comando}
          value={comando}
          onChange={manejarCambio}
          onKeyDown={manejarTecla}
          readOnly={soloLectura}
          rows={1}
          maxLength={LIMITES_ACTIVIDADES.comandoMax}
          aria-label="Comando"
          aria-describedby={carpeta ? idCarpeta : undefined}
          enterKeyHint="send"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
        />
      </div>
      {salida && <pre className={estilos.salida}>{salida}</pre>}
    </form>
  );
}
