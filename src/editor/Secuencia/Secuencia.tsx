import { MousePointerClick } from "lucide-react";
import { useState } from "react";
import BotonesOrden from "../../componentes/BotonesOrden/BotonesOrden.tsx";
import Dialogo from "../../componentes/Dialogo/Dialogo.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import type { Arrastre } from "../../hooks/useArrastrar.ts";
import { bloquesIncompletos, resumenDe, type Bloque, type ItemArrastre } from "../estadoLeccion.ts";
import BloqueActividad from "./BloqueActividad.tsx";
import estilos from "./Secuencia.module.css";

type PropsSecuencia = {
  bloques: Bloque[];
  idSeleccionado: string | null;
  // la instancia es de la página: el arrastre puede empezar en la paleta
  arrastre: Arrastre<ItemArrastre>;
  alSeleccionar: (id: string) => void;
  alMover: (desde: number, hasta: number) => void;
  alEliminar: (id: string) => void;
  deshabilitada: boolean;
};

// Las actividades de la lección, en orden (spec F05, "Armar una lección").
export default function Secuencia({
  bloques,
  idSeleccionado,
  arrastre,
  alSeleccionar,
  alMover,
  alEliminar,
  deshabilitada,
}: PropsSecuencia) {
  const [porEliminar, setPorEliminar] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState("");
  const incompletos = new Set(bloquesIncompletos(bloques).map(({ id }) => id));

  function mover(desde: number, hasta: number) {
    alMover(desde, hasta);
    setAnuncio(`Movida a la posición ${hasta + 1}`);
  }

  return (
    <div className={estilos.zona} {...arrastre.propsZona(bloques.length)}>
      {bloques.length === 0 ? (
        <EstadoVacio
          icono={MousePointerClick}
          titulo="Esta lección todavía no tiene actividades."
          texto="Arrastra un tipo de la paleta o púlsalo para agregarlo."
        />
      ) : (
        <ol className={estilos.lista}>
          {bloques.map((bloque, indice) => (
            <li
              key={bloque.id}
              className={[
                estilos.item,
                arrastre.destino === indice ? estilos.destinoArriba : "",
                arrastre.destino === indice + 1 && indice === bloques.length - 1
                  ? estilos.destinoAbajo
                  : "",
              ].join(" ")}
              {...(deshabilitada
                ? {}
                : arrastre.propsOrigen({ origen: "secuencia", id: bloque.id }))}
              {...arrastre.propsDestino(indice)}
            >
              <BloqueActividad
                numero={indice + 1}
                tipo={bloque.tipo}
                resumen={resumenDe(bloque)}
                incompleta={incompletos.has(bloque.id)}
                seleccionado={bloque.id === idSeleccionado}
                alSeleccionar={() => alSeleccionar(bloque.id)}
                alEliminar={() => setPorEliminar(bloque.id)}
                deshabilitado={deshabilitada}
                orden={
                  <BotonesOrden
                    etiqueta={`actividad ${indice + 1}`}
                    esPrimero={indice === 0}
                    esUltimo={indice === bloques.length - 1}
                    deshabilitado={deshabilitada}
                    alSubir={() => mover(indice, indice - 1)}
                    alBajar={() => mover(indice, indice + 1)}
                  />
                }
              />
            </li>
          ))}
        </ol>
      )}
      <p className="oculto" role="status">
        {anuncio}
      </p>
      <Dialogo
        abierto={porEliminar !== null}
        titulo="¿Eliminar esta actividad?"
        texto="Perderás lo que escribiste en ella."
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        alConfirmar={() => {
          if (porEliminar) alEliminar(porEliminar);
          setPorEliminar(null);
        }}
        alCancelar={() => setPorEliminar(null)}
      />
    </div>
  );
}
