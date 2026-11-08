import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAmbito } from "../../actividades/ambito.ts";
import { useTeclasActividad } from "../../hooks/useTeclasActividad.ts";
import type { ParteRespuesta } from "../../utilidades/actividades.ts";
import Boton from "../Boton/Boton.tsx";
import MiniaturaImagen from "../MiniaturaImagen/MiniaturaImagen.tsx";
import Superficie from "../Superficie/Superficie.tsx";
import estilos from "./BarraRespuesta.module.css";

export type EstadoRespuesta = "neutro" | "correcto" | "incorrecto";

type PropsBarraRespuesta = {
  estado: EstadoRespuesta;
  titulo?: string;
  // F12: un comando o el nombre de un commit, en letra de código, entre el título y el detalle
  codigo?: string;
  detalle?: string;
  // F13: la respuesta con imágenes, una línea por renglón; cada imagen, una miniatura
  lineas?: ParteRespuesta[][];
  textoBoton: string;
  deshabilitado?: boolean;
  // al ponerse en true, el foco pasa al botón (F11: la respuesta quedó completa)
  enfocar?: boolean;
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
  codigo,
  detalle,
  lineas,
  textoBoton,
  deshabilitado = false,
  enfocar = false,
  alPulsar,
}: PropsBarraRespuesta) {
  const contenedor = useRef<HTMLDivElement>(null);
  const enRecuadro = useAmbito() !== null;

  useEffect(() => {
    if (estado !== "neutro") contenedor.current?.querySelector("button")?.focus();
  }, [estado]);

  useEffect(() => {
    if (enfocar) contenedor.current?.querySelector("button")?.focus();
  }, [enfocar]);

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
          {/* el código y el detalle se desplazan juntos, y "Continuar" sigue a la vista */}
          {(codigo || detalle || lineas) && (
            <div className={estilos.desplazable}>
              {codigo && <p className={estilos.codigo}>{codigo}</p>}
              {detalle && <p className={estilos.detalle}>{detalle}</p>}
              {lineas?.map((linea, i) => (
                <p key={i} className={`${estilos.detalle} ${estilos.linea}`}>
                  {linea.map((parte, j) =>
                    "texto" in parte ? (
                      <span key={j}>{parte.texto}</span>
                    ) : (
                      <span key={j} className={estilos.parteImagen}>
                        <MiniaturaImagen imagen={parte.imagen} />
                        {/* el anuncio lee el texto alternativo, o "Imagen" */}
                        {parte.imagen.textoAlternativo ? (
                          <span>{parte.imagen.textoAlternativo}</span>
                        ) : (
                          <span className="oculto">Imagen</span>
                        )}
                      </span>
                    ),
                  )}
                </p>
              ))}
            </div>
          )}
        </div>
        <Boton anchoCompleto deshabilitado={deshabilitado} alPulsar={alPulsar}>
          {textoBoton}
        </Boton>
      </Superficie>
    </div>
  );
}
