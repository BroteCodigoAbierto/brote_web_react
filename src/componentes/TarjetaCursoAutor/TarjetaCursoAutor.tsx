import { ArrowRight, BookOpen, Building2, Link2, MessageSquareWarning } from "lucide-react";
import { Link } from "react-router";
import type { CursoDelAutor } from "../../tipos/contrato.ts";
import { textoCantidadLecciones } from "../../utilidades/cursos.ts";
import Insignia from "../Insignia/Insignia.tsx";
import InsigniaEstadoCurso from "../InsigniaEstadoCurso/InsigniaEstadoCurso.tsx";
import PortadaCurso from "../PortadaCurso/PortadaCurso.tsx";
import Superficie from "../Superficie/Superficie.tsx";
import base from "../TarjetaCurso/TarjetaCurso.module.css";
import estilos from "./TarjetaCursoAutor.module.css";

type PropsTarjetaCursoAutor = {
  curso: CursoDelAutor;
};

// Un curso en "Mis cursos" del Estudio (F06 + decisión 0020).
export default function TarjetaCursoAutor({ curso }: PropsTarjetaCursoAutor) {
  return (
    <Superficie como={Link} to={`/editor/${curso.id}`} className={base.tarjeta}>
      <PortadaCurso
        id={curso.id}
        titulo={curso.titulo}
        tamano="tarjeta"
        idPortada={curso.idPortada}
      />
      <div className={base.texto}>
        <h3 className={base.titulo}>{curso.titulo}</h3>
        <div className={estilos.insignias}>
          <InsigniaEstadoCurso estado={curso.estado} />
          {curso.visibilidad === "enlacePrivado" && (
            <Insignia icono={Link2}>Enlace privado</Insignia>
          )}
          {curso.organizacion && (
            <Insignia tono="acento" icono={Building2}>
              {curso.organizacion.nombre}
            </Insignia>
          )}
          {curso.revisionRechazada && (
            <Insignia tono="acento" icono={MessageSquareWarning}>
              Revisión no aprobada
            </Insignia>
          )}
          <Insignia icono={BookOpen}>{textoCantidadLecciones(curso.cantidadLecciones)}</Insignia>
        </div>
        <p className={estilos.accion}>
          {curso.estado === "borrador" ? "Editar" : "Administrar"}
          <ArrowRight className={estilos.icono} aria-hidden="true" />
        </p>
      </div>
    </Superficie>
  );
}
