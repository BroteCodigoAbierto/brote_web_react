import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import estilos from "./Boton.module.css";

type PropsBoton = {
  children: ReactNode;
  tipo?: "submit" | "button";
  variante?: "primario" | "secundario" | "fantasma" | "peligro" | "enlace";
  tamano?: "normal" | "chico";
  icono?: LucideIcon;
  iconoFinal?: LucideIcon;
  anchoCompleto?: boolean;
  // mientras se envía queda deshabilitado, para que no se envíe dos veces
  enviando?: boolean;
  textoEnviando?: string;
  alPulsar?: () => void;
};

// Botón de píldora (docs/diseno.md, sección 4). Al enviar muestra el
// indicador y el texto de envío sin cambiar de ancho de golpe.
export default function Boton({
  children,
  tipo = "button",
  variante = "primario",
  tamano = "normal",
  icono: Icono,
  iconoFinal: IconoFinal,
  anchoCompleto = false,
  enviando = false,
  textoEnviando = "Enviando...",
  alPulsar,
}: PropsBoton) {
  const clases = [
    estilos.boton,
    estilos[variante],
    estilos[tamano],
    anchoCompleto ? estilos.anchoCompleto : "",
  ].join(" ");

  return (
    <button
      type={tipo}
      className={clases}
      disabled={enviando}
      aria-busy={enviando || undefined}
      onClick={alPulsar}
    >
      {enviando ? (
        <span className={estilos.indicador} aria-hidden="true" />
      ) : (
        Icono && <Icono className={estilos.icono} aria-hidden="true" />
      )}
      <span>{enviando ? textoEnviando : children}</span>
      {!enviando && IconoFinal && <IconoFinal className={estilos.icono} aria-hidden="true" />}
    </button>
  );
}
