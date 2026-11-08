import { useEffect, useRef, useState } from "react";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import BotonEscuchar from "../../componentes/BotonEscuchar/BotonEscuchar.tsx";
import BotonGrabar from "../../componentes/BotonGrabar/BotonGrabar.tsx";
import EstadoAudio from "../../componentes/EstadoAudio/EstadoAudio.tsx";
import FraseEscuchar from "../../componentes/FraseEscuchar/FraseEscuchar.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useAudios } from "../../contextos/ContextoAudios.ts";
import { useIdioma } from "../../contextos/ContextoIdioma.ts";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import { useFrase, type EstadoFrase, type VelocidadFrase } from "../../hooks/useFrase.ts";
import { useGrabacion, type EstadoGrabacion } from "../../hooks/useGrabacion.ts";
import {
  CONSIGNA_ESCUCHAR_REPETIR,
  MENSAJES_AUDIOS,
  NOMBRE_IDIOMA,
  type IdiomaCurso,
} from "../../tipos/contrato.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";
import estilos from "./EscucharRepetir.module.css";

// Cuando la frase no se puede oír, "Comprobar" se habilita y la frase se ve (spec F14).
const NO_SE_OYE: EstadoFrase[] = ["noCargo", "sinVoz", "noSono"];

function avisoDeFrase(estado: EstadoFrase, idioma: IdiomaCurso): string | null {
  if (estado === "sinVoz") {
    return MENSAJES_AUDIOS.sinVoz.replace("{idioma}", NOMBRE_IDIOMA[idioma].toLowerCase());
  }
  return estado === "noSono" ? MENSAJES_AUDIOS.noSono : null;
}

function avisoDeGrabacion(estado: EstadoGrabacion): string | null {
  if (estado === "sinPermiso")
    return `${MENSAJES_AUDIOS.sinPermiso}\n${MENSAJES_AUDIOS.permitirWeb}`;
  return estado === "sinMicrofono" ? MENSAJES_AUDIOS.sinMicrofono : null;
}

// Escuchar y repetir (spec F14; docs/diseno.md, sección 6): oye la frase (su audio o la voz
// del dispositivo, en el idioma del curso), la dice, se graba si quiere y se autoevalúa como en
// el reto de código. Nunca suenan dos cosas a la vez. Escuchar y grabarse no cuentan como
// haber hecho algo; comprobar, sí.
export default function EscucharRepetir({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"escucharRepetir">) {
  const idioma = useIdioma();
  const frase = useFrase(actividad, idioma, useAudios());
  const grabacion = useGrabacion();
  const [sePuedeComprobar, setSePuedeComprobar] = useState(false);
  const [aLaVista, setALaVista] = useState(actividad.mostrarTexto);
  const [comprobada, setComprobada] = useState(false);
  const [loDijoBien, setLoDijoBien] = useState<boolean | null>(null);
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const autoevaluacion = useRef<HTMLDivElement>(null);

  // Las dos se quedan así: la frase no se vuelve a ocultar aunque el audio llegue después.
  const noSeOye = NO_SE_OYE.includes(frase.estado);
  if (!sePuedeComprobar && (frase.sono || noSeOye)) setSePuedeComprobar(true);
  if (!aLaVista && (comprobada || noSeOye)) setALaVista(true);

  // al comprobar, el foco pasa a la autoevaluación
  useEffect(() => {
    if (comprobada) autoevaluacion.current?.querySelector("button")?.focus();
  }, [comprobada]);

  const grabando = grabacion.estado === "grabando" || grabacion.estado === "pidiendoPermiso";
  const avisoFrase = avisoDeFrase(frase.estado, idioma);
  const avisoGrabacion = avisoDeGrabacion(grabacion.estado);

  function escuchar(velocidad: VelocidadFrase) {
    if (frase.estado === "sonando" && frase.velocidad === velocidad) {
      frase.detener();
      return;
    }
    grabacion.detenerEscucha();
    frase.escuchar(velocidad);
  }

  // mientras graba no suena nada, para que el modelo no quede en la grabación
  function grabar() {
    if (grabacion.estado === "grabando") {
      grabacion.detener();
      return;
    }
    frase.detener();
    grabacion.grabar();
  }

  function escucharGrabacion() {
    if (grabacion.estado === "sonando") {
      grabacion.detenerEscucha();
      return;
    }
    frase.detener();
    grabacion.escuchar();
  }

  function comprobar() {
    if (!sePuedeComprobar) return;
    setComprobada(true);
    alInteractuar();
  }

  function botonEscuchar(velocidad: VelocidadFrase) {
    return (
      <BotonEscuchar
        velocidad={velocidad}
        sonando={frase.estado === "sonando" && frase.velocidad === velocidad}
        cargando={frase.estado === "cargando"}
        deshabilitado={grabando || frase.estado === "sinVoz"}
        alPulsar={() => escuchar(velocidad)}
      />
    );
  }

  return (
    <div className={comun.actividad}>
      <h2 ref={inicio} tabIndex={-1} className={comun.consigna}>
        {CONSIGNA_ESCUCHAR_REPETIR}
      </h2>
      <Superficie className={`${comun.panel} ${estilos.panel}`}>
        <FraseEscuchar frase={actividad.frase} idioma={idioma} oculta={!aLaVista} />
        <div className={estilos.botones}>
          {botonEscuchar("normal")}
          {botonEscuchar("lenta")}
        </div>
        {frase.estado === "noCargo" && <EstadoAudio />}
      </Superficie>
      {avisoFrase && <Aviso tono="info" texto={avisoFrase} />}
      {avisoGrabacion && <Aviso tono="info" texto={avisoGrabacion} />}
      <div className={estilos.grabar}>
        <BotonGrabar
          estado={
            grabacion.estado === "grabando"
              ? "grabando"
              : grabacion.hayGrabacion
                ? "conGrabacion"
                : "listo"
          }
          segundos={grabacion.segundos}
          deshabilitado={grabacion.estado === "pidiendoPermiso"}
          alPulsar={grabar}
        />
        {grabacion.hayGrabacion && !grabando && (
          <BotonEscuchar
            etiqueta="Escuchar mi grabación"
            sonando={grabacion.estado === "sonando"}
            alPulsar={escucharGrabacion}
          />
        )}
      </div>
      {comprobada && loDijoBien === null && (
        <div className={estilos.autoevaluacion} ref={autoevaluacion}>
          <p className={estilos.preguntaAuto}>¿Lo dijiste bien?</p>
          <div className={estilos.botones}>
            <Boton variante="secundario" alPulsar={() => setLoDijoBien(true)}>
              Lo dije bien
            </Boton>
            <Boton variante="secundario" alPulsar={() => setLoDijoBien(false)}>
              No me salió
            </Boton>
          </div>
        </div>
      )}
      {/* mientras se autoevalúa no hay "Continuar": la acción son sus dos botones */}
      {!comprobada && (
        <BarraRespuesta
          estado="neutro"
          textoBoton="Comprobar"
          deshabilitado={!sePuedeComprobar}
          alPulsar={comprobar}
        />
      )}
      {loDijoBien !== null && (
        <BarraRespuesta
          estado={loDijoBien ? "correcto" : "incorrecto"}
          titulo={loDijoBien ? "¡Correcto!" : "A repasar"}
          textoBoton="Continuar"
          alPulsar={() => alTerminar(loDijoBien ? "acierto" : "fallo")}
        />
      )}
    </div>
  );
}
