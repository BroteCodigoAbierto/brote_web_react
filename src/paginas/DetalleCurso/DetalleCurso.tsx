import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  CircleSlash,
  NotebookPen,
} from "lucide-react";
import { useCallback } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import AvanceCurso from "../../componentes/AvanceCurso/AvanceCurso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import Insignia from "../../componentes/Insignia/Insignia.tsx";
import PortadaCurso from "../../componentes/PortadaCurso/PortadaCurso.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { esNoDisponible, leerErrorDeCarga, traerCurso } from "../../servicios/cursos.ts";
import { MENSAJES_CATALOGO, type DetalleCurso as Curso } from "../../tipos/contrato.ts";
import { textoCantidadLecciones } from "../../utilidades/cursos.ts";
import { ESTADO_DESDE_CURSO } from "../../utilidades/navegacion.ts";
import { avanceCurso, textoBotonSiguiente } from "../../utilidades/progreso.ts";
import estilos from "./DetalleCurso.module.css";

// Detalle de un curso publicado (spec F02): sus datos, el avance del alumno
// (F04) y la lista de lecciones, que se abren para cursarlas (F03). Al volver
// de una lección la página se monta de nuevo y trae el avance actualizado.
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

      {curso.lecciones.length > 0 && <Avance curso={curso} />}

      <section className={estilos.lecciones} aria-labelledby="titulo-lecciones">
        <h2 id="titulo-lecciones" className={estilos.seccion}>
          Lecciones
        </h2>
        {curso.lecciones.length === 0 ? (
          <EstadoVacio icono={NotebookPen} titulo="Este curso todavía no tiene lecciones." />
        ) : (
          <Superficie como="ol" className={estilos.lista}>
            {curso.lecciones.map((leccion) => (
              <li key={leccion.id}>
                <Link
                  to={`/cursos/${curso.id}/lecciones/${leccion.id}`}
                  state={ESTADO_DESDE_CURSO}
                  className={estilos.leccion}
                >
                  <span className={estilos.numero} aria-hidden="true">
                    {leccion.posicion}
                  </span>
                  {/* el número se lee como "1. ..." aunque se dibuje en el círculo */}
                  <span className="oculto">{leccion.posicion}. </span>
                  <span className={estilos.tituloLeccion}>{leccion.titulo}</span>
                  <ChevronRight className={estilos.flecha} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </Superficie>
        )}
      </section>
    </article>
  );
}

type PropsAvance = {
  curso: Curso;
};

// Cuánto lleva y por dónde seguir (docs/diseno.md, sección 5, "Detalle del
// curso con progreso"): el botón abre la primera lección sin completar.
function Avance({ curso }: PropsAvance) {
  const navegar = useNavigate();
  const { completadas, total, siguiente } = avanceCurso(curso.lecciones);

  return (
    <Superficie className={estilos.avance}>
      <AvanceCurso completadas={completadas} total={total} />
      {siguiente && (
        <div>
          <Boton
            iconoFinal={ArrowRight}
            alPulsar={() =>
              navegar(`/cursos/${curso.id}/lecciones/${siguiente.id}`, {
                state: ESTADO_DESDE_CURSO,
              })
            }
          >
            {textoBotonSiguiente(siguiente, completadas)}
          </Boton>
        </div>
      )}
    </Superficie>
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
