import { useEffect, useId, useRef, type ReactNode } from "react";
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
  // mientras se hace lo que se confirmó; no se puede cancelar (F05)
  enviando?: boolean;
  // decisión 0018: "primario" cuando confirmar no pierde nada (aprobar un curso)
  varianteConfirmar?: "peligro" | "primario";
  // decisión 0018: campos entre el texto y los botones (el motivo de "No aprobar")
  children?: ReactNode;
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
  enviando = false,
  varianteConfirmar = "peligro",
  children,
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
        if (!enviando) alCancelar();
      }}
    >
      <h2 id={`${id}-titulo`} className={estilos.titulo}>
        {titulo}
      </h2>
      <p id={`${id}-texto`} className={estilos.texto}>
        {texto}
      </p>
      {children}
      <div className={estilos.botones}>
        <Boton variante="secundario" deshabilitado={enviando} alPulsar={alCancelar}>
          {textoCancelar}
        </Boton>
        <Boton
          variante={varianteConfirmar}
          enviando={enviando}
          textoEnviando={textoConfirmar}
          alPulsar={alConfirmar}
        >
          {textoConfirmar}
        </Boton>
      </div>
    </dialog>
  );
}
