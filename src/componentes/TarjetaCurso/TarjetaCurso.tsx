import { Link } from "react-router";
import type { ResumenCurso } from "../../tipos/contrato.ts";
import { textoCantidadLecciones } from "../../utilidades/cursos.ts";
import PortadaCurso from "../PortadaCurso/PortadaCurso.tsx";
import estilos from "./TarjetaCurso.module.css";

type PropsTarjetaCurso = {
  curso: ResumenCurso;
};

// Un curso del catálogo; toda la tarjeta lleva a su detalle.
export default function TarjetaCurso({ curso }: PropsTarjetaCurso) {
  return (
    <Link to={`/cursos/${curso.id}`} className={estilos.tarjeta}>
      <PortadaCurso id={curso.id} titulo={curso.titulo} tamano="tarjeta" />
      <div className={estilos.texto}>
        <h2 className={estilos.titulo}>{curso.titulo}</h2>
        <p className={estilos.autor}>Por {curso.autor.nombre}</p>
        <p className={estilos.descripcion}>{curso.descripcion}</p>
        <p className={estilos.lecciones}>{textoCantidadLecciones(curso.cantidadLecciones)}</p>
      </div>
    </Link>
  );
}
