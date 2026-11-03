import { useEffect, useId, useRef } from "react";
import Boton from "../Boton/Boton.tsx";
import estilos from "./Dialogo.module.css";

type PropsDialogo = {
  abierto: boolean;
  titulo: string;
  texto: string;
  textoConfirmar: string;
  textoCancelar: string;
  alConfirmar: () => void;
  alCancelar: () => void;
};

// Confirmación modal (docs/diseno.md, sección 4) sobre el <dialog> nativo:
// encierra el foco, se anuncia y Esc cancela, sin librería. El foco empieza en
// la opción que no pierde nada. En el móvil, lo mismo es Alert.alert.
export default function Dialogo({
  abierto,
  titulo,
  texto,
  textoConfirmar,
  textoCancelar,
  alConfirmar,
  alCancelar,
}: PropsDialogo) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (abierto && !elemento.open) {
      elemento.showModal();
      elemento.querySelector<HTMLButtonElement>("button")?.focus();
    }
    if (!abierto && elemento.open) elemento.close();
  }, [abierto]);

  return (
    <dialog
      ref={dialogo}
      className={estilos.dialogo}
      aria-labelledby={`${id}-titulo`}
      aria-describedby={`${id}-texto`}
      onCancel={(evento) => {
        // Esc: lo cierra el padre al cambiar `abierto`
        evento.preventDefault();
        alCancelar();
      }}
    >
      <h2 id={`${id}-titulo`} className={estilos.titulo}>
        {titulo}
      </h2>
      <p id={`${id}-texto`} className={estilos.texto}>
        {texto}
      </p>
      <div className={estilos.botones}>
        <Boton variante="secundario" alPulsar={alCancelar}>
          {textoCancelar}
        </Boton>
        <Boton variante="peligro" alPulsar={alConfirmar}>
          {textoConfirmar}
        </Boton>
      </div>
    </dialog>
  );
}
