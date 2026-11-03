import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import estilos from "./Insignia.module.css";

type PropsInsignia = {
  children: ReactNode;
  tono?: "neutro" | "primario" | "brote" | "acento";
  icono?: LucideIcon;
};

// Píldora chica para metadatos ("6 lecciones") y logros.
export default function Insignia({ children, tono = "neutro", icono: Icono }: PropsInsignia) {
  return (
    <span className={`${estilos.insignia} ${estilos[tono]}`}>
      {Icono && <Icono className={estilos.icono} aria-hidden="true" />}
      {children}
    </span>
  );
}
