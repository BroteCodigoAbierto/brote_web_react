import { useCallback, useEffect, useRef, useState } from "react";
import type { EstadoGuardado } from "../componentes/ResultadoLeccion/ResultadoLeccion.tsx";
import { esNoDisponible } from "../servicios/cursos.ts";
import { guardarProgreso } from "../servicios/progreso.ts";
import type { CuerpoProgresoLeccion } from "../tipos/contrato.ts";

// Guarda el resultado de una lección al llegar a la pantalla final (spec F04;
// brote_specs, research de F04, punto 7). Se intenta una sola vez; volver a
// intentarlo lo decide el alumno con "Reintentar". El 401 ya lo maneja pedir().
export function useGuardarProgreso(
  idCurso: string,
  idLeccion: string,
  { aciertos, preguntas }: CuerpoProgresoLeccion,
) {
  const [estado, setEstado] = useState<EstadoGuardado>("guardando");
  // Dos refs y no una variable del efecto: StrictMode monta, desmonta y vuelve
  // a montar. `enviado` evita el segundo PUT y `montado` deja que la respuesta
  // del primero llegue al montaje que sigue vivo.
  const enviado = useRef(false);
  const montado = useRef(false);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const enviar = useCallback(() => {
    guardarProgreso(idCurso, idLeccion, { aciertos, preguntas })
      .then(() => {
        if (montado.current) setEstado("guardado");
      })
      .catch((error: unknown) => {
        if (montado.current) setEstado(esNoDisponible(error) ? "noDisponible" : "error");
      });
  }, [idCurso, idLeccion, aciertos, preguntas]);

  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    enviar();
  }, [enviar]);

  function reintentar() {
    setEstado("guardando");
    enviar();
  }

  return { estado, reintentar };
}
