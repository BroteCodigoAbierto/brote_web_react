import { Medal } from "lucide-react";
import type { InsigniaCurso as Insignia } from "../../tipos/contrato.ts";
import PortadaCurso from "../PortadaCurso/PortadaCurso.tsx";
import estilos from "./InsigniaCurso.module.css";

type PropsInsigniaCurso = {
  insignia: Insignia;
  tamano: "lista" | "grande";
};

const FECHA = new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" });

// La insignia de un curso completado (spec F08; docs/diseno.md, sección 4): la portada del
// curso en un círculo con una medalla. Si la portada no carga, PortadaCurso pone la
// generada. En "lista" va con el título y la fecha; en "grande", sola.
export default function InsigniaCurso({ insignia, tamano }: PropsInsigniaCurso) {
  const circulo = (
    <span
      className={`${estilos.circulo} ${estilos[tamano]}`}
      role="img"
      aria-label={`Insignia de ${insignia.titulo}`}
    >
      <PortadaCurso
        id={insignia.idCurso}
        titulo={insignia.titulo}
        tamano="detalle"
        idPortada={insignia.idPortada}
      />
      <span className={estilos.medalla} aria-hidden="true">
        <Medal />
      </span>
    </span>
  );

  if (tamano === "grande") return circulo;
  return (
    <div className={estilos.fila}>
      {circulo}
      <div className={estilos.textos}>
        <span className={estilos.titulo}>{insignia.titulo}</span>
        <span className={estilos.fecha}>Ganada el {FECHA.format(new Date(insignia.ganadaEn))}</span>
      </div>
    </div>
  );
}
