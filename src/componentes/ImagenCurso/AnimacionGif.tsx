import { useEffect, useRef, useState } from "react";
import type { Imagen } from "../../tipos/contrato.ts";

export type PropsAnimacionGif = {
  imagen: Imagen;
  url: string;
  quieta: boolean;
  pausada: boolean;
  alCargar: () => void;
  alFallar: () => void;
};

// Un GIF que se puede pausar en el cuadro donde va (brote_specs, research de F13, punto 9).
// Un <img> no se pausa, y dibujarlo en un canvas da su primer cuadro: aquí ImageDecoder
// (WebCodecs) decodifica cada cuadro y se dibuja con su duración. Sin ImageDecoder,
// ImagenCurso usa GifSinDecodificador.
export default function AnimacionGif({
  imagen,
  url,
  quieta,
  pausada,
  alCargar,
  alFallar,
}: PropsAnimacionGif) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const [decodificador, setDecodificador] = useState<ImageDecoder | null>(null);
  // el cuadro que está en pantalla: -1 antes del primero
  const cuadro = useRef(-1);
  const vueltas = useRef(0);

  useEffect(() => {
    const control = new AbortController();
    let creado: ImageDecoder | null = null;
    async function decodificar() {
      try {
        const respuesta = await fetch(url, { credentials: "include", signal: control.signal });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        creado = new ImageDecoder({ data: await respuesta.arrayBuffer(), type: "image/gif" });
        await creado.tracks.ready;
        if (control.signal.aborted) return;
        setDecodificador(creado);
        alCargar();
      } catch {
        if (!control.signal.aborted) alFallar();
      }
    }
    void decodificar();
    return () => {
      control.abort();
      creado?.close();
    };
    // alCargar y alFallar cambian en cada render del padre; solo importa la dirección
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    if (!decodificador) return;
    const contexto = lienzo.current?.getContext("2d");
    const pista = decodificador.tracks.selectedTrack;
    if (!contexto || !pista) return;
    let activo = true;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    async function dibujar(indice: number) {
      const { image } = await decodificador!.decode({ frameIndex: indice });
      if (!activo) {
        image.close();
        return;
      }
      contexto!.drawImage(image, 0, 0);
      const duracionMs = (image.duration ?? 100_000) / 1000;
      image.close();
      cuadro.current = indice;
      if (quieta || pausada) return;
      let siguiente = indice + 1;
      if (siguiente >= pista!.frameCount) {
        siguiente = 0;
        vueltas.current += 1;
        // repetitionCount: Infinity para "siempre"; si no, cuántas veces más
        if (vueltas.current > pista!.repetitionCount) return;
      }
      temporizador = setTimeout(() => void dibujar(siguiente), Math.max(20, duracionMs));
    }

    // pausar deja el cuadro actual; reanudar sigue con el siguiente
    const desde = quieta || cuadro.current < 0 ? 0 : cuadro.current + (pausada ? 0 : 1);
    void dibujar(desde % pista.frameCount).catch(() => undefined);
    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  }, [decodificador, quieta, pausada]);

  return <canvas ref={lienzo} width={imagen.ancho} height={imagen.alto} />;
}
