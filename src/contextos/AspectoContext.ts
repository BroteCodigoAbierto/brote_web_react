import { createContext } from "react";
import type { AspectoInterfaz } from "../tipos/contrato.ts";

// Preferencia opcional de variante visual (decisión 0020):
// "vidrio" (Liquid Glass, predeterminado) o "editorial" (opcional).
export type ValorAspecto = {
  aspecto: AspectoInterfaz;
  cambiarAspecto: (nuevo: AspectoInterfaz) => void;
};

export const AspectoContext = createContext<ValorAspecto | null>(null);
