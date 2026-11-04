import { useEffect, useRef } from "react";
import { useBlocker } from "react-router";

// Salir con cambios sin guardar pide confirmación (spec F05): los enlaces y el
// botón de volver pasan por el Dialogo; recargar o cerrar la pestaña, por el aviso
// del navegador. Si la sesión se pierde, RutaProtegida desmonta la página antes de
// navegar, así que el bloqueo no se interpone (research de F05, punto 14).
export function useSalirSinGuardar(hayCambios: boolean) {
  const saliendo = useRef(false);
  const bloqueo = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hayCambios && !saliendo.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!hayCambios) return;
    function avisar(evento: BeforeUnloadEvent) {
      evento.preventDefault();
    }
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [hayCambios]);

  return {
    propsDialogo: {
      abierto: bloqueo.state === "blocked",
      titulo: "¿Salir sin guardar?",
      texto: "Perderás los cambios que no guardaste.",
      textoConfirmar: "Salir",
      textoCancelar: "Seguir aquí",
      alConfirmar: () => bloqueo.proceed?.(),
      alCancelar: () => bloqueo.reset?.(),
    },
    // para irse a propósito, como al eliminar el curso
    salirSinPreguntar() {
      saliendo.current = true;
    },
  };
}
