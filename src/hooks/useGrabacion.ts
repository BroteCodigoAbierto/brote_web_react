import { useCallback, useEffect, useRef, useState } from "react";
import { LIMITES_AUDIOS } from "../tipos/contrato.ts";

// Grabarse en un escuchar y repetir (spec F14, "Grabarse"; brote_specs, research de F14, punto
// 12), con getUserMedia y MediaRecorder. La grabación vive en una URL de objeto mientras está
// la actividad: nunca se manda a ningún lado.
// https://developer.mozilla.org/docs/Web/API/MediaStream_Recording_API

export type EstadoGrabacion =
  | "lista"
  | "pidiendoPermiso"
  | "grabando"
  | "conGrabacion"
  | "sonando"
  | "sinPermiso"
  | "sinMicrofono";

export type Grabacion = {
  estado: EstadoGrabacion;
  // los que lleva grabando
  segundos: number;
  // ya grabó algo (aunque después falte el permiso)
  hayGrabacion: boolean;
  grabar: () => void;
  detener: () => void;
  escuchar: () => void;
  detenerEscucha: () => void;
};

// NotAllowedError y SecurityError: no hay permiso. Lo demás (no hay micrófono, está en uso o
// no cumple lo pedido) cuenta como que no se encontró uno.
function estadoDelError(error: unknown): EstadoGrabacion {
  const nombre = error instanceof DOMException ? error.name : "";
  return nombre === "NotAllowedError" || nombre === "SecurityError" ? "sinPermiso" : "sinMicrofono";
}

export function useGrabacion(): Grabacion {
  const [estado, setEstado] = useState<EstadoGrabacion>("lista");
  const [segundos, setSegundos] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const grabador = useRef<MediaRecorder | null>(null);
  const flujo = useRef<MediaStream | null>(null);
  const reloj = useRef<number | null>(null);
  const limite = useRef<number | null>(null);
  const reproductor = useRef<HTMLAudioElement | null>(null);
  const montado = useRef(true);

  function pararReloj() {
    if (reloj.current !== null) clearInterval(reloj.current);
    if (limite.current !== null) clearTimeout(limite.current);
    reloj.current = null;
    limite.current = null;
  }

  // apaga el micrófono, para que el navegador quite su indicador
  function soltarMicrofono() {
    for (const pista of flujo.current?.getTracks() ?? []) pista.stop();
    flujo.current = null;
  }

  const detener = useCallback(() => {
    pararReloj();
    if (grabador.current?.state === "recording") grabador.current.stop();
  }, []);

  const detenerEscucha = useCallback(() => {
    if (!reproductor.current) return;
    reproductor.current.pause();
    reproductor.current.currentTime = 0;
    setEstado((actual) => (actual === "sonando" ? "conGrabacion" : actual));
  }, []);

  // Al salir de la actividad, la grabación se descarta.
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      pararReloj();
      if (grabador.current?.state === "recording") grabador.current.stop();
      soltarMicrofono();
      reproductor.current?.pause();
    };
  }, []);

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  async function grabar() {
    detenerEscucha();
    if (!navigator.mediaDevices?.getUserMedia) {
      // sin HTTPS fuera de localhost no hay mediaDevices
      setEstado("sinMicrofono");
      return;
    }
    setEstado("pidiendoPermiso");
    let nuevo: MediaStream;
    try {
      nuevo = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      if (montado.current) setEstado(estadoDelError(error));
      return;
    }
    if (!montado.current) {
      for (const pista of nuevo.getTracks()) pista.stop();
      return;
    }
    flujo.current = nuevo;
    const trozos: Blob[] = [];
    const nuevoGrabador = new MediaRecorder(nuevo);
    nuevoGrabador.ondataavailable = (evento) => {
      if (evento.data.size > 0) trozos.push(evento.data);
    };
    nuevoGrabador.onstop = () => {
      pararReloj();
      soltarMicrofono();
      if (!montado.current) return;
      // WebM con Opus en Chrome, MP4 en Safari: el tipo que dé el navegador
      setUrl(URL.createObjectURL(new Blob(trozos, { type: nuevoGrabador.mimeType })));
      setEstado("conGrabacion");
    };
    // el micrófono se desconectó a mitad: se queda lo grabado
    for (const pista of nuevo.getTracks()) pista.onended = detener;
    grabador.current = nuevoGrabador;
    reproductor.current = null;
    setUrl(null);
    setSegundos(0);
    const inicio = Date.now();
    nuevoGrabador.start();
    setEstado("grabando");
    reloj.current = window.setInterval(() => {
      setSegundos((Math.min(LIMITES_AUDIOS.grabacionMax, Date.now() - inicio) / 1000) | 0);
    }, 250);
    limite.current = window.setTimeout(() => {
      setSegundos(LIMITES_AUDIOS.grabacionMax / 1000);
      detener();
    }, LIMITES_AUDIOS.grabacionMax);
  }

  function escuchar() {
    if (!url) return;
    if (!reproductor.current) {
      const nuevo = new Audio(url);
      nuevo.onended = () => montado.current && setEstado("conGrabacion");
      reproductor.current = nuevo;
    }
    reproductor.current.currentTime = 0;
    setEstado("sonando");
    reproductor.current.play().catch(() => montado.current && setEstado("conGrabacion"));
  }

  return {
    estado,
    segundos,
    hayGrabacion: url !== null,
    grabar: () => void grabar(),
    detener,
    escuchar,
    detenerEscucha,
  };
}
