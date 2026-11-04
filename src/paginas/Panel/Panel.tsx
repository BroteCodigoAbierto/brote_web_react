import { BookMarked, Plus, SquarePen } from "lucide-react";
import { Link, useNavigate } from "react-router";
import Boton from "../../componentes/Boton/Boton.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import TarjetaCurso from "../../componentes/TarjetaCurso/TarjetaCurso.tsx";
import TarjetaCursoAutor from "../../componentes/TarjetaCursoAutor/TarjetaCursoAutor.tsx";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { leerErrorDeCarga } from "../../servicios/cursos.ts";
import { traerCursosDelAutor } from "../../servicios/editor.ts";
import { traerCursosEmpezados } from "../../servicios/progreso.ts";
import type { CursoDelAutor, CursoEmpezado } from "../../tipos/contrato.ts";
import estilos from "./Panel.module.css";

// "Mi panel" (specs F04 y F05): la página personal (docs/diseno.md, sección 5,
// "Página personal"). Cada feature que agregue un bloque suma su sección, con sus
// propios estados: si una falla, la otra sigue.
export default function Panel() {
  return (
    <div className={estilos.panel}>
      <h1 className={estilos.titulo}>Mi panel</h1>
      <SigueAprendiendo />
      <CursosQueCree />
    </div>
  );
}

// Los cursos empezados, del avance más reciente al más antiguo. La página se
// monta cada vez que se entra, así que siempre trae lo último.
function SigueAprendiendo() {
  const { datos, cargando, error, recargar } = usePeticion(traerCursosEmpezados);

  return (
    <section className={estilos.seccion} aria-labelledby="titulo-sigue-aprendiendo">
      <h2 id="titulo-sigue-aprendiendo" className={estilos.tituloSeccion}>
        Sigue aprendiendo
      </h2>
      <ContenidoSigueAprendiendo
        cursos={datos?.cursos ?? null}
        cargando={cargando}
        error={error}
        alReintentar={recargar}
      />
    </section>
  );
}

type PropsContenido = {
  cursos: CursoEmpezado[] | null;
  cargando: boolean;
  error: unknown;
  alReintentar: () => void;
};

function ContenidoSigueAprendiendo({ cursos, cargando, error, alReintentar }: PropsContenido) {
  if (cargando) return <IndicadorCarga />;
  if (error || !cursos) {
    return <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={alReintentar} />;
  }
  if (cursos.length === 0) {
    return (
      <EstadoVacio
        icono={BookMarked}
        titulo="Todavía no empiezas ningún curso."
        texto="Cuando completes tu primera lección, aquí verás tu avance."
        accion={<Link to="/">Explorar cursos</Link>}
      />
    );
  }
  return (
    <ul className={estilos.cuadricula}>
      {cursos.map((curso) => (
        <li key={curso.id}>
          <TarjetaCurso
            curso={curso}
            avance={{ completadas: curso.leccionesCompletadas, total: curso.cantidadLecciones }}
          />
        </li>
      ))}
    </ul>
  );
}

// Los cursos del autor, del que cambió más recientemente al más antiguo (spec F05).
function CursosQueCree() {
  const navegar = useNavigate();
  const { datos, cargando, error, recargar } = usePeticion(traerCursosDelAutor);

  return (
    <section className={estilos.seccion} aria-labelledby="titulo-cursos-que-cree">
      <div className={estilos.encabezadoSeccion}>
        <h2 id="titulo-cursos-que-cree" className={estilos.tituloSeccion}>
          Cursos que creé
        </h2>
        <Boton tamano="chico" icono={Plus} alPulsar={() => navegar("/editor/nuevo")}>
          Nuevo curso
        </Boton>
      </div>
      <ContenidoCursosQueCree
        cursos={datos?.cursos ?? null}
        cargando={cargando}
        error={error}
        alReintentar={recargar}
      />
    </section>
  );
}

type PropsContenidoCursosQueCree = {
  cursos: CursoDelAutor[] | null;
  cargando: boolean;
  error: unknown;
  alReintentar: () => void;
};

function ContenidoCursosQueCree({
  cursos,
  cargando,
  error,
  alReintentar,
}: PropsContenidoCursosQueCree) {
  if (cargando) return <IndicadorCarga />;
  if (error || !cursos) {
    return <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={alReintentar} />;
  }
  if (cursos.length === 0) {
    return (
      <EstadoVacio
        icono={SquarePen}
        titulo="Todavía no creas ningún curso."
        texto="Crea uno y enseña lo que sabes."
      />
    );
  }
  return (
    <ul className={estilos.cuadricula}>
      {cursos.map((curso) => (
        <li key={curso.id}>
          <TarjetaCursoAutor curso={curso} />
        </li>
      ))}
    </ul>
  );
}
