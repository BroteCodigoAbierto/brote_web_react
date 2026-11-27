import { ArrowRight, BookOpen, Building2, CalendarClock } from "lucide-react";
import { Link } from "react-router";
import type { CursoEnRevision } from "../../tipos/contrato.ts";
import { textoCantidadLecciones } from "../../utilidades/cursos.ts";
import Insignia from "../Insignia/Insignia.tsx";
import PortadaCurso from "../PortadaCurso/PortadaCurso.tsx";
import Superficie from "../Superficie/Superficie.tsx";
import base from "../TarjetaCurso/TarjetaCurso.module.css";
import estilos from "../TarjetaCursoAutor/TarjetaCursoAutor.module.css";

const FECHA = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });

type PropsTarjetaCursoRevision = {
  curso: CursoEnRevision;
};

// Un curso en la cola de revisión (decisión 0018 y 0020).
export default function TarjetaCursoRevision({ curso }: PropsTarjetaCursoRevision) {
  return (
    <Superficie como={Link} to={`/moderacion/${curso.id}`} className={base.tarjeta}>
      <PortadaCurso
        id={curso.id}
        titulo={curso.titulo}
        tamano="tarjeta"
        idPortada={curso.idPortada}
      />
      <div className={base.texto}>
        <h3 className={base.titulo}>{curso.titulo}</h3>
        <p className={base.autor}>{curso.nombreAutor}</p>
        <p className={base.descripcion}>{curso.descripcion}</p>
        <div className={estilos.insignias}>
          {curso.organizacion && (
            <Insignia tono="acento" icono={Building2}>
              {curso.organizacion.nombre}
            </Insignia>
          )}
          <Insignia icono={BookOpen}>{textoCantidadLecciones(curso.cantidadLecciones)}</Insignia>
          <Insignia icono={CalendarClock}>
            Enviado el {FECHA.format(new Date(curso.enviadoEn))}
          </Insignia>
        </div>
        <p className={estilos.accion}>
          Revisar
          <ArrowRight className={estilos.icono} aria-hidden="true" />
        </p>
      </div>
    </Superficie>
  );
}
