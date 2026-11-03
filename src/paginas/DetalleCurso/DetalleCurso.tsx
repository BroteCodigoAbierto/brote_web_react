import { ArrowLeft, BookOpen, CircleSlash, NotebookPen } from "lucide-react";
import { useCallback } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import Boton from "../../componentes/Boton/Boton.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import Insignia from "../../componentes/Insignia/Insignia.tsx";
import PortadaCurso from "../../componentes/PortadaCurso/PortadaCurso.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
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
      <EstadoVacio
        icono={CircleSlash}
        titulo={MENSAJES_CATALOGO.cursoNoDisponible}
        anunciar
        accion={<Link to="/">Ver cursos</Link>}
      />
    );
  }

  if (error || !datos) {
    return <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />;
  }

  const { curso } = datos;

  return (
    <article className={estilos.detalle}>
      <Volver />

      <Superficie className={estilos.encabezado} elevada>
        <PortadaCurso id={curso.id} titulo={curso.titulo} tamano="detalle" />
        <div className={estilos.datos}>
          <h1 className={estilos.titulo}>{curso.titulo}</h1>
          <p className={estilos.autor}>Por {curso.autor.nombre}</p>
          <Insignia tono="primario" icono={BookOpen}>
            {textoCantidadLecciones(curso.cantidadLecciones)}
          </Insignia>
        </div>
      </Superficie>

      <p className={estilos.descripcion}>{curso.descripcion}</p>

      <section className={estilos.lecciones} aria-labelledby="titulo-lecciones">
        <h2 id="titulo-lecciones" className={estilos.seccion}>
          Lecciones
        </h2>
        {curso.lecciones.length === 0 ? (
          <EstadoVacio icono={NotebookPen} titulo="Este curso todavía no tiene lecciones." />
        ) : (
          <Superficie como="ol" className={estilos.lista}>
            {curso.lecciones.map((leccion) => (
              <li key={leccion.id} className={estilos.leccion}>
                <span className={estilos.numero} aria-hidden="true">
                  {leccion.posicion}
                </span>
                {/* el número se lee como "1. ..." aunque se dibuje en el círculo */}
                <span className="oculto">{leccion.posicion}. </span>
                <span className={estilos.tituloLeccion}>{leccion.titulo}</span>
              </li>
            ))}
          </Superficie>
        )}
      </section>
    </article>
  );
}

// Vuelve a la página anterior (el catálogo con su búsqueda y su posición); si
// se entró directo al detalle, va al catálogo.
function Volver() {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const hayAnterior = ubicacion.key !== "default";

  return (
    <div className={estilos.volver}>
      <Boton
        variante="enlace"
        tamano="chico"
        icono={ArrowLeft}
        alPulsar={() => (hayAnterior ? navegar(-1) : navegar("/"))}
      >
        Cursos
      </Boton>
    </div>
  );
}
