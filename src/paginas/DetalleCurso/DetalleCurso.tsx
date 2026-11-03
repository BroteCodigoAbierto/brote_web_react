import { useCallback } from "react";
import { Link, useParams } from "react-router";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import PortadaCurso from "../../componentes/PortadaCurso/PortadaCurso.tsx";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { esNoDisponible, leerErrorDeCarga, traerCurso } from "../../servicios/cursos.ts";
import { MENSAJES_CATALOGO } from "../../tipos/contrato.ts";
import { textoCantidadLecciones } from "../../utilidades/cursos.ts";
import estilos from "./DetalleCurso.module.css";

// Detalle de un curso publicado (spec F02): sus datos y la lista de lecciones.
export default function DetalleCurso() {
  const { idCurso = "" } = useParams();
  const { datos, cargando, error, recargar } = usePeticion(
    useCallback(() => traerCurso(idCurso), [idCurso]),
  );

  if (cargando) return <IndicadorCarga />;

  if (esNoDisponible(error)) {
    return (
      <section className={estilos.noDisponible}>
        <p role="alert">{MENSAJES_CATALOGO.cursoNoDisponible}</p>
        <Link to="/">Ver cursos</Link>
      </section>
    );
  }

  if (error || !datos) {
    return <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />;
  }

  const { curso } = datos;

  return (
    <article className={estilos.detalle}>
      <header className={estilos.encabezado}>
        <PortadaCurso id={curso.id} titulo={curso.titulo} tamano="detalle" />
        <div className={estilos.datos}>
          <h1 className={estilos.titulo}>{curso.titulo}</h1>
          <p className={estilos.suave}>Por {curso.autor.nombre}</p>
          <p className={estilos.suave}>{textoCantidadLecciones(curso.cantidadLecciones)}</p>
        </div>
      </header>

      <p className={estilos.descripcion}>{curso.descripcion}</p>

      {curso.lecciones.length === 0 ? (
        <p className={estilos.suave}>Este curso todavía no tiene lecciones.</p>
      ) : (
        <ol className={estilos.lista}>
          {curso.lecciones.map((leccion) => (
            <li key={leccion.id} className={estilos.leccion}>
              {leccion.posicion}. {leccion.titulo}
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
