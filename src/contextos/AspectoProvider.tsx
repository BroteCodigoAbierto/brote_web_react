import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CLAVES, leerTexto, ponerTexto } from "../constantes/almacenamiento.ts";
import { ASPECTOS_INTERFAZ, type AspectoInterfaz } from "../tipos/contrato.ts";
import { AspectoContext } from "./AspectoContext.ts";

function leerAspectoInicial(): AspectoInterfaz {
  const guardado = leerTexto(CLAVES.aspecto);
  if (guardado && (ASPECTOS_INTERFAZ as readonly string[]).includes(guardado)) {
    return guardado as AspectoInterfaz;
  }
  return "vidrio";
}

type PropsAspectoProvider = { children: ReactNode };

export default function AspectoProvider({ children }: PropsAspectoProvider) {
  const [aspecto, setAspecto] = useState<AspectoInterfaz>(leerAspectoInicial);

  useEffect(() => {
    if (aspecto === "editorial") {
      document.documentElement.dataset.variante = "editorial";
    } else {
      delete document.documentElement.dataset.variante;
    }
  }, [aspecto]);

  const cambiarAspecto = useCallback((nuevo: AspectoInterfaz) => {
    setAspecto(nuevo);
    ponerTexto(CLAVES.aspecto, nuevo);
  }, []);

  const valor = useMemo(() => ({ aspecto, cambiarAspecto }), [aspecto, cambiarAspecto]);

  return <AspectoContext value={valor}>{children}</AspectoContext>;
}
