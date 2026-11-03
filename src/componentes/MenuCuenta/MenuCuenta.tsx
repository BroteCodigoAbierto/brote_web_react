import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSesion } from "../../hooks/useSesion.ts";
import { inicialPortada } from "../../utilidades/cursos.ts";
import Superficie from "../Superficie/Superficie.tsx";
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
        <span className={estilos.avatar} aria-hidden="true">
          {inicialPortada(usuario.nombre)}
        </span>
        <span className={estilos.nombre}>{usuario.nombre}</span>
        <ChevronDown
          className={`${estilos.flecha} ${abierto ? estilos.flechaAbierta : ""}`}
          aria-hidden="true"
        />
      </button>
      {abierto && (
        <Superficie id="menu-cuenta" tono="solido" elevada className={estilos.panel}>
          <div className={estilos.datos}>
            <p className={estilos.nombrePanel}>{usuario.nombre}</p>
            <p className={estilos.correo}>{usuario.correo}</p>
          </div>
          <button type="button" className={estilos.opcion} onClick={cerrarSesion}>
            <LogOut className={estilos.iconoOpcion} aria-hidden="true" />
            Cerrar sesión
          </button>
        </Superficie>
      )}
    </div>
  );
}
