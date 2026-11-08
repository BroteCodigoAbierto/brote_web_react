import { useId, useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import BloqueCodigo from "../../componentes/BloqueCodigo/BloqueCodigo.tsx";
import ImagenAmpliable from "../../componentes/ImagenAmpliable/ImagenAmpliable.tsx";
import OpcionRespuesta, {
  type EstadoOpcion,
} from "../../componentes/OpcionRespuesta/OpcionRespuesta.tsx";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import { useTeclasActividad } from "../../hooks/useTeclasActividad.ts";
import { mezclar, textoOpcion } from "../../utilidades/actividades.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";
import estilos from "./OpcionMultiple.module.css";

// Las teclas 1 a 9 no eligen nada mientras se escribe en un campo.
function escribiendo(objetivo: EventTarget | null): boolean {
  return objetivo instanceof Element && objetivo.closest("input, textarea") !== null;
}

// Opción múltiple (spec F03): una sola correcta, opciones mezcladas cada vez
// que aparece la pregunta (en el prototipo la correcta siempre era la primera). Desde F13,
// la pregunta puede llevar una imagen y las opciones pueden ser imágenes (mosaicos).
export default function OpcionMultiple({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"opcionMultiple">) {
  const { pregunta, imagen, codigo, opciones, correcta } = actividad;
  // se mezclan una sola vez, al montar; cada una recuerda su lugar original
  const [mezcladas] = useState(() =>
    mezclar(opciones.map((opcion, indice) => ({ opcion, indice }))),
  );
  const [elegida, setElegida] = useState<number | null>(null);
  const [comprobada, setComprobada] = useState(false);
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const idPregunta = useId();
  const conSimbolos = opciones.some((opcion) => "simbolo" in opcion);
  const conImagenes = opciones.some((opcion) => "imagen" in opcion);
  const acerto = elegida === correcta;

  function elegir(indice: number) {
    if (comprobada) return;
    setElegida(indice);
    alInteractuar();
  }

  useTeclasActividad((evento) => {
    if (comprobada || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    if (escribiendo(evento.target)) return;
    const lugar = Number(evento.key);
    const opcion = mezcladas[lugar - 1];
    if (!Number.isInteger(lugar) || !opcion) return;
    evento.preventDefault();
    elegir(opcion.indice);
  });

  function estadoDe(indice: number): EstadoOpcion {
    if (!comprobada) return indice === elegida ? "seleccionada" : "normal";
    if (indice === correcta) return "correcta";
    return indice === elegida ? "incorrecta" : "normal";
  }

  const respuestaCorrecta = opciones[correcta];

  return (
    <div className={comun.actividad}>
      <h2 ref={inicio} tabIndex={-1} id={idPregunta} className={comun.consigna}>
        {pregunta}
      </h2>
      {imagen && <ImagenAmpliable imagen={imagen} />}
      {codigo && <BloqueCodigo codigo={codigo} />}
      <div
        role="radiogroup"
        aria-labelledby={idPregunta}
        className={
          conImagenes ? estilos.mosaicosImagen : conSimbolos ? estilos.mosaicos : estilos.lista
        }
      >
        {mezcladas.map(({ opcion, indice }, lugar) => (
          <OpcionRespuesta
            key={indice}
            estado={estadoDe(indice)}
            {...("imagen" in opcion
              ? { imagen: opcion.imagen }
              : "simbolo" in opcion
                ? { simbolo: opcion.simbolo }
                : { texto: opcion.texto })}
            numero={lugar + 1}
            deshabilitada={comprobada}
            alElegir={() => elegir(indice)}
          />
        ))}
      </div>
      {comprobada ? (
        <BarraRespuesta
          estado={acerto ? "correcto" : "incorrecto"}
          titulo={acerto ? "¡Correcto!" : "Respuesta correcta:"}
          {...(acerto || !respuestaCorrecta
            ? {}
            : "imagen" in respuestaCorrecta
              ? { lineas: [[{ imagen: respuestaCorrecta.imagen }]] }
              : { detalle: textoOpcion(respuestaCorrecta) })}
          textoBoton="Continuar"
          alPulsar={() => alTerminar(acerto ? "acierto" : "fallo")}
        />
      ) : (
        <BarraRespuesta
          estado="neutro"
          textoBoton="Comprobar"
          deshabilitado={elegida === null}
          alPulsar={() => setComprobada(true)}
        />
      )}
    </div>
  );
}
