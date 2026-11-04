import { useId, useState } from "react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import BloqueCodigo from "../../componentes/BloqueCodigo/BloqueCodigo.tsx";
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
// que aparece la pregunta (en el prototipo la correcta siempre era la primera).
export default function OpcionMultiple({
  actividad,
  alInteractuar,
  alTerminar,
}: PropsActividad<"opcionMultiple">) {
  const { pregunta, codigo, opciones, correcta } = actividad;
  // se mezclan una sola vez, al montar; cada una recuerda su lugar original
  const [mezcladas] = useState(() =>
    mezclar(opciones.map((opcion, indice) => ({ opcion, indice }))),
  );
  const [elegida, setElegida] = useState<number | null>(null);
  const [comprobada, setComprobada] = useState(false);
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();
  const idPregunta = useId();
  const conSimbolos = opciones.some((opcion) => "simbolo" in opcion);
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
      {codigo && <BloqueCodigo codigo={codigo} />}
      <div
        role="radiogroup"
        aria-labelledby={idPregunta}
        className={conSimbolos ? estilos.mosaicos : estilos.lista}
      >
        {mezcladas.map(({ opcion, indice }, lugar) => (
          <OpcionRespuesta
            key={indice}
            estado={estadoDe(indice)}
            {...("simbolo" in opcion ? { simbolo: opcion.simbolo } : { texto: opcion.texto })}
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
          detalle={acerto || !respuestaCorrecta ? undefined : textoOpcion(respuestaCorrecta)}
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
