import { useEffect, useRef } from "react";
import type { PropsAnimacionGif } from "./AnimacionGif.tsx";

// Respaldo de AnimacionGif sin ImageDecoder (no se valida: la web se valida en Chrome): un
// <img> que se cambia por su primer cuadro al pausar; al reanudar empieza de nuevo.
export default function GifSinDecodificador({
  imagen,
  url,
  quieta,
  pausada,
  alCargar,
  alFallar,
}: PropsAnimacionGif) {
  const fuente = useRef<HTMLImageElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const quieto = quieta || pausada;

  useEffect(() => {
    const img = fuente.current;
    if (!quieto || !img?.complete) return;
    lienzo.current?.getContext("2d")?.drawImage(img, 0, 0);
  }, [quieto]);

  return (
    <>
      <img
        ref={fuente}
        src={url}
        alt=""
        hidden={quieto}
        onLoad={(evento) => {
          if (quieto) lienzo.current?.getContext("2d")?.drawImage(evento.currentTarget, 0, 0);
          alCargar();
        }}
        onError={alFallar}
      />
      {quieto && <canvas ref={lienzo} width={imagen.ancho} height={imagen.alto} />}
    </>
  );
}
