import { Building2, ChevronDown, LogOut, ShieldCheck, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAspecto } from "../../hooks/useAspecto.ts";
import { useEspacio } from "../../hooks/useEspacio.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import { inicialPortada } from "../../utilidades/cursos.ts";
import Superficie from "../Superficie/Superficie.tsx";
import estilos from "./MenuCuenta.module.css";

// Botón con el nombre del usuario que abre un menú con su perfil, selector de
// aspecto (Liquid Glass / Editorial), accesos al Estudio y "Cerrar sesión".
// Se cierra con Escape o con un clic fuera.
export default function MenuCuenta() {
  const { usuario, cerrarSesion } = useSesion();
  const { aspecto, cambiarAspecto } = useAspecto();
  const { puedeModerar } = useEspacio();
  const navegar = useNavigate();
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

  function irA(ruta: string) {
    setAbierto(false);
    void navegar(ruta);
  }

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

          <div className={estilos.seccionAspecto}>
            <span className={estilos.etiquetaAspecto}>
              <Sparkles className={estilos.iconoPequeno} aria-hidden="true" />
              Aspecto visual
            </span>
            <div className={estilos.segmentado} role="group" aria-label="Aspecto visual">
              <button
                type="button"
                className={`${estilos.opcionSegmento} ${aspecto === "vidrio" ? estilos.segmentoActivo : ""}`}
                aria-pressed={aspecto === "vidrio"}
                onClick={() => cambiarAspecto("vidrio")}
              >
                Liquid Glass
              </button>
              <button
                type="button"
                className={`${estilos.opcionSegmento} ${aspecto === "editorial" ? estilos.segmentoActivo : ""}`}
                aria-pressed={aspecto === "editorial"}
                onClick={() => cambiarAspecto("editorial")}
              >
                Editorial
              </button>
            </div>
          </div>

          <div className={estilos.grupoOpciones}>
            <button
              type="button"
              className={estilos.opcionNeutra}
              onClick={() => irA(`/autores/${usuario.id}`)}
            >
              <User className={estilos.iconoOpcion} aria-hidden="true" />
              Mi perfil público
            </button>
            <button
              type="button"
              className={estilos.opcionNeutra}
              onClick={() => irA("/estudio?pestana=organizaciones")}
            >
              <Building2 className={estilos.iconoOpcion} aria-hidden="true" />
              Espacios y escuelas
            </button>
            {puedeModerar && (
              <button
                type="button"
                className={estilos.opcionNeutra}
                onClick={() => irA("/estudio?pestana=revision")}
              >
                <ShieldCheck className={estilos.iconoOpcion} aria-hidden="true" />
                Cola de revisión
              </button>
            )}
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
