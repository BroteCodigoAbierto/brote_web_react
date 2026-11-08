import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AmbitoActividad } from "../../actividades/ambito.ts";
import { registroActividades } from "../../actividades/registro.ts";
import type { ComponenteActividad } from "../../actividades/tipos.ts";
import Boton from "../../componentes/Boton/Boton.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { ContextoAudios, crearAlmacenAudios } from "../../contextos/ContextoAudios.ts";
import { useValorDemorado } from "../../hooks/useValorDemorado.ts";
import type { Actividad } from "../../tipos/contrato.ts";
import estilos from "./VistaPrevia.module.css";

type PropsVistaPrevia = {
  // null mientras la actividad está incompleta
  actividad: Actividad | null;
  idBloque: string;
};

// La actividad como la verá el alumno, con su mismo componente (principio IV),
// dentro de un recuadro (brote_specs, research de F05, punto 11). Nada de lo que se
// hace aquí se guarda. Se actualiza con un poco de espera, para que las opciones no
// se mezclen otra vez con cada letra. F14: tiene sus propios audios, que no se vuelven a pedir
// con cada letra, y el idioma del curso lo da el lienzo (ContextoIdioma).
export default function VistaPrevia({ actividad, idBloque }: PropsVistaPrevia) {
  const contenedor = useRef<HTMLDivElement>(null);
  const zonaReiniciar = useRef<HTMLDivElement>(null);
  const ambito = useMemo(() => ({ contenedor }), []);
  const [intento, setIntento] = useState(0);
  const [audios] = useState(crearAlmacenAudios);
  useEffect(() => () => audios.liberar(), [audios]);
  const texto = useValorDemorado(JSON.stringify(actividad));
  const demorada = JSON.parse(texto) as Actividad | null;
  const mostrada = actividad ? (demorada ?? actividad) : null;

  // al empezar de nuevo se desmonta lo que tenía el foco
  function reiniciar() {
    setIntento((n) => n + 1);
    requestAnimationFrame(() => zonaReiniciar.current?.querySelector("button")?.focus());
  }

  const Componente = mostrada ? (registroActividades[mostrada.tipo] as ComponenteActividad) : null;

  return (
    <Superficie tono="suave" className={estilos.vistaPrevia}>
      <div className={estilos.encabezado}>
        <h2 className={estilos.titulo}>Vista previa</h2>
        <div ref={zonaReiniciar}>
          <Boton
            variante="fantasma"
            tamano="chico"
            icono={RotateCcw}
            deshabilitado={!mostrada}
            alPulsar={reiniciar}
          >
            Reiniciar
          </Boton>
        </div>
      </div>
      {/* tabIndex: pulsar dentro pone aquí el foco, y entonces valen las teclas */}
      <div ref={contenedor} tabIndex={-1} className={estilos.contenido}>
        {Componente && mostrada ? (
          <AmbitoActividad value={ambito}>
            <ContextoAudios value={audios}>
              <Componente
                key={`${idBloque}-${intento}-${texto}`}
                actividad={mostrada}
                alInteractuar={() => {}}
                alTerminar={reiniciar}
              />
            </ContextoAudios>
          </AmbitoActividad>
        ) : (
          <p className={estilos.mensaje}>Completa esta actividad para ver su vista previa.</p>
        )}
      </div>
    </Superficie>
  );
}
