import type { ReactNode } from "react";
import estilos from "./Boton.module.css";

type PropsBoton = {
  children: ReactNode;
  tipo?: "submit" | "button";
  variante?: "primario" | "secundario";
  // mientras se envía queda deshabilitado, para que no se envíe dos veces
  enviando?: boolean;
  textoEnviando?: string;
  alPulsar?: () => void;
};

export default function Boton({
  children,
  tipo = "button",
  variante = "primario",
  enviando = false,
  textoEnviando = "Enviando...",
  alPulsar,
}: PropsBoton) {
  return (
    <button
      type={tipo}
      className={`${estilos.boton} ${estilos[variante]}`}
      disabled={enviando}
      aria-busy={enviando || undefined}
      onClick={alPulsar}
    >
      {enviando ? textoEnviando : children}
    </button>
  );
}
