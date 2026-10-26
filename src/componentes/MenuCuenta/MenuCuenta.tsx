import { useEffect, useRef, useState } from "react";
import { useSesion } from "../../hooks/useSesion.ts";
import estilos from "./MenuCuenta.module.css";

// Botón con el nombre del usuario que abre un menú con su correo y "Cerrar
// sesión". Se cierra con Escape o con un clic fuera.
export default function MenuCuenta() {
  const { usuario, cerrarSesion } = useSesion();
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key !== "Escape") return;
      setAbierto(false);
      boton.current?.focus(); // el foco vuelve a donde estaba
    }
    function alHacerClic(evento: MouseEvent) {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    }
    document.addEventListener("keydown", alPresionarTecla);
    document.addEventListener("mousedown", alHacerClic);
    return () => {
      document.removeEventListener("keydown", alPresionarTecla);
      document.removeEventListener("mousedown", alHacerClic);
    };
  }, [abierto]);

  if (!usuario) return null;

  return (
    <div className={estilos.menu} ref={contenedor}>
      <button
        ref={boton}
        type="button"
        className={estilos.alternar}
        title={usuario.nombre}
        aria-expanded={abierto}
        aria-controls="menu-cuenta"
        onClick={() => setAbierto((a) => !a)}
      >
        {usuario.nombre}
      </button>
      {abierto && (
        <div id="menu-cuenta" className={estilos.panel}>
          <p className={estilos.correo}>{usuario.correo}</p>
          <button type="button" className={estilos.opcion} onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
