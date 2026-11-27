import { Award, BookOpen, Building2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import {
  NOMBRE_CATEGORIA,
  NOMBRE_IDIOMA,
  NOMBRE_NIVEL,
  type ResumenCurso,
} from "../../tipos/contrato.ts";
import { textoCantidadLecciones } from "../../utilidades/cursos.ts";
import AvanceCurso from "../AvanceCurso/AvanceCurso.tsx";
import Insignia from "../Insignia/Insignia.tsx";
import PortadaCurso from "../PortadaCurso/PortadaCurso.tsx";
import Superficie from "../Superficie/Superficie.tsx";
import estilos from "./TarjetaCurso.module.css";

type PropsTarjetaCurso = {
  curso: ResumenCurso;
  // con él, la tarjeta de un curso empezado ("Mis cursos", "Sigue aprendiendo", F04)
  avance?: { completadas: number; total: number };
};

// Un curso del catálogo, o uno empezado con su avance en lugar de la
// descripción; toda la tarjeta lleva a su detalle.
export default function TarjetaCurso({ curso, avance }: PropsTarjetaCurso) {
  return (
    <Superficie como={Link} to={`/cursos/${curso.id}`} className={estilos.tarjeta}>
      <PortadaCurso
        id={curso.id}
        titulo={curso.titulo}
        tamano="tarjeta"
        idPortada={curso.idPortada}
      />
      <div className={estilos.texto}>
        <div className={estilos.etiquetasSuperiores}>
          <Insignia tono="primario">{NOMBRE_CATEGORIA[curso.categoria]}</Insignia>
          <Insignia>{NOMBRE_NIVEL[curso.nivel]}</Insignia>
          {curso.organizacion && (
            <Insignia tono="acento" icono={Building2}>
              {curso.organizacion.nombre}
            </Insignia>
          )}
        </div>
        <h2 className={estilos.titulo}>{curso.titulo}</h2>
        <p className={estilos.autor}>Por {curso.autor.nombre}</p>
        {avance ? (
          <div className={estilos.avance}>
            <AvanceCurso completadas={avance.completadas} total={avance.total} />
          </div>
        ) : (
          <>
            <p className={estilos.descripcion}>{curso.descripcion}</p>
            <div className={estilos.pie}>
              <Insignia icono={BookOpen}>
                {textoCantidadLecciones(curso.cantidadLecciones)}
              </Insignia>
              <Insignia>{NOMBRE_IDIOMA[curso.idioma]}</Insignia>
              {curso.daInsignia && (
                <Insignia tono="acento" icono={Award}>
                  Insignia
                </Insignia>
              )}
              {curso.completado && (
                <Insignia tono="brote" icono={CheckCircle2}>
                  Completado
                </Insignia>
              )}
            </div>
          </>
        )}
      </div>
    </Superficie>
  );
}
