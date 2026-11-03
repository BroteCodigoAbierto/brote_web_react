import { BookOpen } from "lucide-react";
import { Link } from "react-router";
import type { ResumenCurso } from "../../tipos/contrato.ts";
import { textoCantidadLecciones } from "../../utilidades/cursos.ts";
import Insignia from "../Insignia/Insignia.tsx";
import PortadaCurso from "../PortadaCurso/PortadaCurso.tsx";
import Superficie from "../Superficie/Superficie.tsx";
import estilos from "./TarjetaCurso.module.css";

type PropsTarjetaCurso = {
  curso: ResumenCurso;
};

// Un curso del catálogo; toda la tarjeta lleva a su detalle.
export default function TarjetaCurso({ curso }: PropsTarjetaCurso) {
  return (
    <Superficie como={Link} to={`/cursos/${curso.id}`} className={estilos.tarjeta}>
      <PortadaCurso id={curso.id} titulo={curso.titulo} tamano="tarjeta" />
      <div className={estilos.texto}>
        <h2 className={estilos.titulo}>{curso.titulo}</h2>
        <p className={estilos.autor}>Por {curso.autor.nombre}</p>
        <p className={estilos.descripcion}>{curso.descripcion}</p>
        <div className={estilos.pie}>
          <Insignia icono={BookOpen}>{textoCantidadLecciones(curso.cantidadLecciones)}</Insignia>
        </div>
      </div>
    </Superficie>
  );
}
