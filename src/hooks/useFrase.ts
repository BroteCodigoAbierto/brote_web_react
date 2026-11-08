import { useCallback, useEffect, useRef, useState } from "react";
import type { AlmacenAudios } from "../contextos/ContextoAudios.ts";
import {
  VELOCIDAD_LENTA,
  type ActividadEscucharRepetir,
  type IdiomaCurso,
} from "../tipos/contrato.ts";
import { decir, elegirVoz, vocesDelIdioma } from "../utilidades/voz.ts";

// La frase de un escuchar y repetir (spec F14, "Cursar la actividad"; brote_specs, research de
// F14, puntos 9, 11 y 14): su audio, si el autor subió uno, o la voz del dispositivo en el
// idioma del curso. Nunca la voz en lugar de un audio que no cargó.

export type EstadoFrase = "cargando" | "lista" | "sonando" | "noCargo" | "sinVoz" | "noSono";

export type VelocidadFrase = "normal" | "lenta";

export type Frase = {
  estado: EstadoFrase;
  // la del botón que la hizo sonar
  velocidad: VelocidadFrase;
  // empezó a sonar alguna vez: habilita "Comprobar"
  sono: boolean;
  escuchar: (velocidad: VelocidadFrase) => void;
  detener: () => void;
};

const RITMO: Record<VelocidadFrase, number> = { normal: 1, lenta: VELOCIDAD_LENTA };

export function useFrase(
  { frase, audio }: ActividadEscucharRepetir,
  idioma: IdiomaCurso,
  almacen: AlmacenAudios,
): Frase {
  const [estado, setEstado] = useState<EstadoFrase>("cargando");
  const [velocidad, setVelocidad] = useState<VelocidadFrase>("normal");
  const [sono, setSono] = useState(false);
  const url = useRef<string | null>(null);
  const voz = useRef<SpeechSynthesisVoice | null>(null);
  const elemento = useRef<HTMLAudioElement | null>(null);
  const detenerVoz = useRef<(() => void) | null>(null);
  const montado = useRef(true);

  // Al abrir: trae el audio (o espera al que ya pidió la precarga) o busca la voz.
  useEffect(() => {
    montado.current = true;
    if (audio) {
      almacen.traer(audio).then(
        (lista) => {
          if (!montado.current) return;
          url.current = lista;
          setEstado("lista");
        },
        () => montado.current && setEstado("noCargo"),
      );
    } else {
      void vocesDelIdioma(idioma).then((voces) => {
        if (!montado.current) return;
        voz.current = elegirVoz(voces, idioma);
        setEstado(voz.current ? "lista" : "sinVoz");
      });
    }
    return () => {
      montado.current = false;
      detenerVoz.current?.();
      elemento.current?.pause();
    };
  }, [audio, idioma, almacen]);

  const detener = useCallback(() => {
    detenerVoz.current?.();
    detenerVoz.current = null;
    if (elemento.current) {
      elemento.current.pause();
      elemento.current.currentTime = 0;
    }
    setEstado((actual) => (actual === "sonando" ? "lista" : actual));
  }, []);

  function empezo() {
    if (!montado.current) return;
    setSono(true);
    setEstado("sonando");
  }

  function terminoDeSonar() {
    if (montado.current) setEstado("lista");
  }

  // Un audio que no pudo sonar (llegó dañado, o el navegador no lo toca): sale del almacén
  // para que el siguiente "Escuchar" lo traiga otra vez.
  function noLogroSonar() {
    if (!montado.current) return;
    if (audio) {
      almacen.olvidar(audio.id);
      url.current = null;
      elemento.current = null;
    }
    setEstado("noSono");
  }

  function sonarAudio(fuente: string, ritmo: number) {
    if (!elemento.current || elemento.current.src !== fuente) {
      elemento.current?.pause();
      const nuevo = new Audio(fuente);
      nuevo.onplaying = empezo;
      nuevo.onended = terminoDeSonar;
      nuevo.onerror = noLogroSonar;
      elemento.current = nuevo;
    }
    const reproductor = elemento.current;
    reproductor.pause();
    reproductor.currentTime = 0;
    reproductor.playbackRate = ritmo;
    // es lo de siempre en Chrome; se pone igual para que más lento no suene más grave
    reproductor.preservesPitch = true;
    reproductor.play().catch((error: unknown) => {
      // AbortError: otro "Escuchar" lo detuvo antes de empezar
      if (!(error instanceof DOMException && error.name === "AbortError")) noLogroSonar();
    });
  }

  function escuchar(nueva: VelocidadFrase) {
    const ritmo = RITMO[nueva];
    detenerVoz.current?.();
    setVelocidad(nueva);
    if (!audio) {
      if (estado === "sinVoz") return;
      setEstado("sonando");
      detenerVoz.current = decir(frase, voz.current, idioma, ritmo, {
        alEmpezar: empezo,
        alTerminar: terminoDeSonar,
        alFallar: noLogroSonar,
      });
      return;
    }
    if (url.current) {
      setEstado("sonando");
      sonarAudio(url.current, ritmo);
      return;
    }
    // no cargó o llegó dañado: se pide en este momento y, si llega, suena
    setEstado("cargando");
    almacen.traer(audio).then(
      (lista) => {
        if (!montado.current) return;
        url.current = lista;
        setEstado("sonando");
        sonarAudio(lista, ritmo);
      },
      () => montado.current && setEstado("noCargo"),
    );
  }

  return { estado, velocidad, sono, escuchar, detener };
}
