import { Mic, Square } from "lucide-react";
import { useState } from "react";
import { LIMITES_AUDIOS } from "../../tipos/contrato.ts";
import { formatearDuracion } from "../../utilidades/audios.ts";
import Boton from "../Boton/Boton.tsx";
import estilos from "./BotonGrabar.module.css";

type EstadoBotonGrabar = "listo" | "grabando" | "conGrabacion";

type PropsBotonGrabar = {
  estado: EstadoBotonGrabar;
  // los que lleva grabando
  segundos: number;
  deshabilitado?: boolean;
  alPulsar: () => void;
};

// "Grabarme" de escuchar y repetir (docs/diseno.md, sección 4; spec F14, "Grabarse"). Mientras
// graba, "Detener" y el tiempo, con un punto que late. "Grabando" y "Grabación lista" se
// anuncian; el tiempo no, para no leerlo cada segundo.
export default function BotonGrabar({
  estado,
  segundos,
  deshabilitado = false,
  alPulsar,
}: PropsBotonGrabar) {
  // "Grabación lista" solo después de grabar, no al abrir la actividad
  const [grabo, setGrabo] = useState(false);
  if (estado === "grabando" && !grabo) setGrabo(true);
  const anuncio =
    estado === "grabando"
      ? "Grabando"
      : grabo && estado === "conGrabacion"
        ? "Grabación lista"
        : "";
  const maximo = formatearDuracion(LIMITES_AUDIOS.grabacionMax);

  return (
    <div className={estilos.grabar}>
      {estado === "grabando" ? (
        <>
          <Boton
            variante="secundario"
            icono={Square}
            etiqueta="Detener la grabación"
            alPulsar={alPulsar}
          >
            Detener
          </Boton>
          <p className={estilos.tiempo}>
            <span className={estilos.punto} aria-hidden="true" />
            Grabando… {formatearDuracion(segundos * 1000)} de {maximo}
          </p>
        </>
      ) : (
        <Boton variante="secundario" icono={Mic} deshabilitado={deshabilitado} alPulsar={alPulsar}>
          {estado === "conGrabacion" ? "Volver a grabarme" : "Grabarme"}
        </Boton>
      )}
      <span className="oculto" aria-live="polite">
        {anuncio}
      </span>
    </div>
  );
}
