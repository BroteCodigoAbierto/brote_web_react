import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAmbito } from "../../actividades/ambito.ts";
import { useTeclasActividad } from "../../hooks/useTeclasActividad.ts";
import Boton from "../Boton/Boton.tsx";
import Superficie from "../Superficie/Superficie.tsx";
import estilos from "./BarraRespuesta.module.css";

export type EstadoRespuesta = "neutro" | "correcto" | "incorrecto";

type PropsBarraRespuesta = {
  estado: EstadoRespuesta;
  titulo?: string;
  detalle?: string;
  textoBoton: string;
  deshabilitado?: boolean;
  alPulsar: () => void;
};

// Enter en estos ya hace algo por su cuenta: salto de línea, pulsar el botón
// o seguir el enlace, o enviar el formulario de los espacios.
function enterPropio(objetivo: EventTarget | null): boolean {
  return objetivo instanceof Element && objetivo.closest("textarea, button, a, input") !== null;
}

// Barra inferior fija de cada actividad (docs/diseno.md, sección 6): el botón
// "Comprobar"/"Continuar" y, al comprobar, la retroalimentación. Enter la
// pulsa (sección 6, "Teclado") y, al dejar de ser neutra, el foco pasa al
// botón para que el lector de pantalla lea el resultado y Enter continúe.
export default function BarraRespuesta({
  estado,
  titulo,
  detalle,
  textoBoton,
  deshabilitado = false,
  alPulsar,
}: PropsBarraRespuesta) {
  const contenedor = useRef<HTMLDivElement>(null);
  const enRecuadro = useAmbito() !== null;

  useEffect(() => {
    if (estado !== "neutro") contenedor.current?.querySelector("button")?.focus();
  }, [estado]);

  useTeclasActividad((evento) => {
    if (evento.key !== "Enter" || evento.isComposing || evento.defaultPrevented) return;
    if (deshabilitado || enterPropio(evento.target)) return;
    evento.preventDefault();
    alPulsar();
  });

  const Icono = estado === "correcto" ? CircleCheck : CircleX;

  return (
    <div className={`${estilos.contenedor} ${enRecuadro ? estilos.enLinea : ""}`} ref={contenedor}>
      <Superficie tono="solido" elevada className={`${estilos.barra} ${estilos[estado]}`}>
        <div className={estilos.mensaje} aria-live="polite">
          {titulo && (
            <p className={estilos.titulo}>
              {estado !== "neutro" && <Icono className={estilos.icono} aria-hidden="true" />}
              {titulo}
            </p>
          )}
          {detalle && <p className={estilos.detalle}>{detalle}</p>}
        </div>
        <Boton anchoCompleto deshabilitado={deshabilitado} alPulsar={alPulsar}>
          {textoBoton}
        </Boton>
      </Superficie>
    </div>
  );
}
