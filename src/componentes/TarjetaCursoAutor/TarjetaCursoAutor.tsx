import { ArrowRight, BookOpen, Globe, PencilLine } from "lucide-react";
import { Link } from "react-router";
import type { CursoDelAutor } from "../../tipos/contrato.ts";
import { textoCantidadLecciones } from "../../utilidades/cursos.ts";
import Insignia from "../Insignia/Insignia.tsx";
import PortadaCurso from "../PortadaCurso/PortadaCurso.tsx";
import Superficie from "../Superficie/Superficie.tsx";
import estilos from "./TarjetaCursoAutor.module.css";

type PropsTarjetaCursoAutor = {
  curso: CursoDelAutor;
};

// Un curso en "Cursos que creé" (spec F05; docs/diseno.md, sección 5, "Estado de un
// curso"). Toda la tarjeta es un enlace: un borrador lleva a su mapa y uno publicado
// a su detalle, porque no se edita.
export default function TarjetaCursoAutor({ curso }: PropsTarjetaCursoAutor) {
  const publicado = curso.estado === "publicado";

  return (
    <Superficie
      como={Link}
      to={publicado ? `/cursos/${curso.id}` : `/editor/${curso.id}`}
      className={estilos.tarjeta}
    >
      <PortadaCurso id={curso.id} titulo={curso.titulo} tamano="tarjeta" />
      <div className={estilos.texto}>
        <h3 className={estilos.titulo}>{curso.titulo}</h3>
        <div className={estilos.insignias}>
          {publicado ? (
            <Insignia tono="primario" icono={Globe}>
              Publicado
            </Insignia>
          ) : (
            <Insignia icono={PencilLine}>Borrador</Insignia>
          )}
          <Insignia icono={BookOpen}>{textoCantidadLecciones(curso.cantidadLecciones)}</Insignia>
        </div>
        <p className={estilos.accion}>
          {publicado ? "Ver curso" : "Editar"}
          <ArrowRight className={estilos.icono} aria-hidden="true" />
        </p>
      </div>
    </Superficie>
  );
}
