import type { ComponentPropsWithoutRef, ElementType } from "react";
import estilos from "./Superficie.module.css";

type PropsSuperficie<E extends ElementType> = {
  // etiqueta HTML o componente que se dibuja (div, section, article, Link...)
  como?: E;
  tono?: "normal" | "suave" | "solido";
  elevada?: boolean;
} & Omit<ComponentPropsWithoutRef<E>, "como">;

// Panel de vidrio esmerilado, base de tarjetas, paneles y barras
// (brote_specs/docs/diseno.md, sección 3). Sin transparencia disponible, los
// tokens lo vuelven opaco: las páginas no tienen que decidir nada.
export default function Superficie<E extends ElementType = "div">({
  como,
  tono = "normal",
  elevada = false,
  className,
  ...props
}: PropsSuperficie<E>) {
  const Elemento: ElementType = como ?? "div";
  const clases = [estilos.superficie, estilos[tono], elevada ? estilos.elevada : "", className]
    .filter(Boolean)
    .join(" ");
  return <Elemento className={clases} {...props} />;
}
