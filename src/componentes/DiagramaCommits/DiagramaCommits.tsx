import { CircleCheck, CircleX } from "lucide-react";
import { useMemo } from "react";
import { useAncho } from "../../hooks/useAncho.ts";
import type { ActividadGrafoCommits } from "../../tipos/contrato.ts";
import {
  acomodarGrafo,
  medirGrafo,
  nombreAccesibleCommit,
  rutaLinea,
  type EstadoCommit,
} from "../../utilidades/grafo.ts";
import Superficie from "../Superficie/Superficie.tsx";
import estilos from "./DiagramaCommits.module.css";

type PropsDiagramaCommits = {
  actividad: ActividadGrafoCommits;
  elegido: number | null;
  comprobado: boolean;
  alElegir: (indice: number) => void;
};

// La escala de la letra del navegador: los círculos y las etiquetas crecen con ella.
function escalaLetra(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
}

function estadoDe(indice: number, elegido: number | null, comprobado: boolean, respuesta: number) {
  if (comprobado && indice === respuesta) return "correcto";
  if (comprobado && indice === elegido) return "incorrecto";
  return indice === elegido ? "elegido" : "normal";
}

// El grafo de commits (docs/diseno.md, sección 4): líneas en SVG y cada commit un botón
// encima, en las posiciones de acomodarGrafo y medirGrafo (brote_specs, research de F12,
// puntos 2 y 3). Los textos van como texto, también los de las etiquetas.
export default function DiagramaCommits({
  actividad,
  elegido,
  comprobado,
  alElegir,
}: PropsDiagramaCommits) {
  const [refDisponible, disponible] = useAncho<HTMLDivElement>();
  const acomodo = useMemo(() => acomodarGrafo(actividad), [actividad]);
  const medida = disponible > 0 ? medirGrafo(acomodo, actividad, disponible, escalaLetra()) : null;

  // en el DOM, por columna y, en cada una, de arriba abajo: es el orden de Tab
  const orden = actividad.commits
    .map((_, indice) => indice)
    .sort((a, b) => {
      const [pa, pb] = [acomodo.posiciones[a], acomodo.posiciones[b]];
      return pa.columna - pb.columna || pa.fila - pb.fila;
    });

  return (
    <Superficie className={estilos.superficie}>
      <div ref={refDisponible} className={estilos.disponible}>
        {medida && (
          <div className={estilos.caja} style={{ width: medida.ancho, height: medida.alto }}>
            <svg
              className={estilos.lineas}
              width={medida.ancho}
              height={medida.alto}
              aria-hidden="true"
            >
              {actividad.commits.flatMap((commit, hijo) =>
                commit.padres.map((padre, i) => (
                  <path
                    key={`${hijo}-${i}`}
                    d={rutaLinea(
                      medida.centros[padre],
                      medida.centros[hijo],
                      i === 0,
                      medida.separacion,
                    )}
                  />
                )),
              )}
            </svg>
            {/* las ramas y HEAD ya van en el nombre de cada commit */}
            {medida.etiquetas.map((etiqueta, i) => (
              <span
                key={i}
                className={`${estilos.etiqueta} ${estilos[etiqueta.tipo]}`}
                style={{
                  left: etiqueta.x,
                  top: etiqueta.y,
                  width: etiqueta.ancho,
                  height: medida.altoEtiqueta,
                }}
                aria-hidden="true"
              >
                {etiqueta.texto}
              </span>
            ))}
            {orden.map((indice) => {
              const estado: EstadoCommit = estadoDe(
                indice,
                elegido,
                comprobado,
                actividad.respuesta,
              );
              const centro = medida.centros[indice];
              const Icono = estado === "correcto" ? CircleCheck : CircleX;
              return (
                <button
                  key={indice}
                  type="button"
                  className={`${estilos.commit} ${estilos[estado]}`}
                  style={{
                    left: centro.x - medida.area / 2,
                    top: centro.y - medida.area / 2,
                    width: medida.area,
                    height: medida.area,
                  }}
                  onClick={() => alElegir(indice)}
                  disabled={comprobado}
                  aria-label={nombreAccesibleCommit(actividad, indice, estado)}
                >
                  <span
                    className={estilos.circulo}
                    style={{ width: medida.circulo, height: medida.circulo }}
                  >
                    {actividad.commits[indice].nombre}
                    {(estado === "correcto" || estado === "incorrecto") && (
                      <Icono className={estilos.icono} aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Superficie>
  );
}
