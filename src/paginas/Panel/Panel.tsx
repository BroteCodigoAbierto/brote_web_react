import { BookMarked } from "lucide-react";
import { Link } from "react-router";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import TarjetaCurso from "../../componentes/TarjetaCurso/TarjetaCurso.tsx";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { leerErrorDeCarga } from "../../servicios/cursos.ts";
import { traerCursosEmpezados } from "../../servicios/progreso.ts";
import type { CursoEmpezado } from "../../tipos/contrato.ts";
import estilos from "./Panel.module.css";

// "Mi panel" (spec F04): la página personal del alumno (docs/diseno.md,
// sección 5, "Página personal"). Por ahora solo "Sigue aprendiendo"; cada
// feature que agregue un bloque suma su sección.
export default function Panel() {
  return (
    <div className={estilos.panel}>
      <h1 className={estilos.titulo}>Mi panel</h1>
      <SigueAprendiendo />
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
