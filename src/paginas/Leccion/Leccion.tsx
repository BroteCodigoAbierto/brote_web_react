import { CircleSlash, NotebookPen } from "lucide-react";
import { useCallback, type ReactNode } from "react";
import { Link, useBlocker, useLocation, useNavigate, useParams } from "react-router";
import EncabezadoLeccion from "../../actividades/ReproductorLeccion/EncabezadoLeccion.tsx";
import ReproductorLeccion from "../../actividades/ReproductorLeccion/ReproductorLeccion.tsx";
import { actividadesConocidas } from "../../actividades/registro.ts";
import Boton from "../../componentes/Boton/Boton.tsx";
import Dialogo from "../../componentes/Dialogo/Dialogo.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import ResultadoLeccion from "../../componentes/ResultadoLeccion/ResultadoLeccion.tsx";
import { useGuardarProgreso } from "../../hooks/useGuardarProgreso.ts";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { useReproductor } from "../../hooks/useReproductor.ts";
import { esNoDisponible, leerErrorDeCarga } from "../../servicios/cursos.ts";
import { traerLeccion } from "../../servicios/lecciones.ts";
import { MENSAJES_LECCION, type DetalleLeccion } from "../../tipos/contrato.ts";
import { vieneDelCurso } from "../../utilidades/navegacion.ts";
import estilos from "./Leccion.module.css";

// Cursar una lección (spec F03), a pantalla completa y fuera del marco común.
export default function Leccion() {
  const { idCurso = "", idLeccion = "" } = useParams();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const { datos, cargando, error, recargar } = usePeticion(
    useCallback(() => traerLeccion(idCurso, idLeccion), [idCurso, idLeccion]),
  );

  // Vuelve a la pantalla anterior si es el detalle del curso. Si no (dirección
  // abierta directo, o después de "Entrar"), reemplaza la lección por el
  // detalle: así "atrás" no regresa a la lección (research de F03, punto 8).
  function salir() {
    if (vieneDelCurso(ubicacion.state)) navegar(-1);
    else navegar(`/cursos/${idCurso}`, { replace: true });
  }

  function conEncabezado(contenido: ReactNode) {
    return (
      <div className={estilos.pantalla}>
        <EncabezadoLeccion alSalir={salir} />
        <div className={estilos.estado}>{contenido}</div>
      </div>
    );
  }

  if (cargando) return conEncabezado(<IndicadorCarga />);

  if (esNoDisponible(error)) {
    return conEncabezado(
      <EstadoVacio
        icono={CircleSlash}
        titulo={MENSAJES_LECCION.leccionNoDisponible}
        anunciar
        accion={<Link to="/">Ver cursos</Link>}
      />,
    );
  }

  if (error || !datos) {
    return conEncabezado(<ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />);
  }

  const actividades = actividadesConocidas(datos.leccion.actividades);
  if (actividades.length === 0) {
    return conEncabezado(
      <EstadoVacio
        icono={NotebookPen}
        titulo="Esta lección todavía no tiene actividades."
        accion={
          <Boton variante="secundario" alPulsar={salir}>
            Volver al curso
          </Boton>
        }
      />,
    );
  }

  // con key: si cambia la lección en la dirección, empieza de cero
  return (
    <CursarLeccion
      key={datos.leccion.id}
      idCurso={idCurso}
      idLeccion={idLeccion}
      leccion={datos.leccion}
      actividades={actividades}
      alSalir={salir}
    />
  );
}

type PropsCursarLeccion = {
  idCurso: string;
  idLeccion: string;
  leccion: DetalleLeccion;
  actividades: DetalleLeccion["actividades"];
  alSalir: () => void;
};

// La lección ya cargada: el reproductor, la pantalla final y la confirmación
// de salida. Va aparte porque sus hooks necesitan las actividades.
function CursarLeccion({ idCurso, idLeccion, leccion, actividades, alSalir }: PropsCursarLeccion) {
  const reproductor = useReproductor(actividades);
  const { hizoAlgo, terminada, aciertos, preguntas } = reproductor;

  // La X, el botón de volver del navegador y cualquier enlace pasan por aquí.
  // Recargar o cerrar la pestaña no pide confirmación (spec F03).
  const bloqueo = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hizoAlgo && !terminada && currentLocation.pathname !== nextLocation.pathname,
  );

  if (terminada) {
    return (
      <LeccionTerminada
        idCurso={idCurso}
        idLeccion={idLeccion}
        titulo={leccion.titulo}
        total={actividades.length}
        aciertos={aciertos}
        preguntas={preguntas}
        alSalir={alSalir}
      />
    );
  }

  return (
    <>
      <ReproductorLeccion
        actividades={actividades}
        idioma={leccion.idioma}
        reproductor={reproductor}
        alSalir={alSalir}
      />
      <Dialogo
        abierto={bloqueo.state === "blocked"}
        titulo="¿Salir de la lección?"
        texto="Perderás tu avance en esta lección."
        textoConfirmar="Salir"
        textoCancelar="Seguir aquí"
        alConfirmar={() => bloqueo.proceed?.()}
        alCancelar={() => bloqueo.reset?.()}
      />
    </>
  );
}

type PropsLeccionTerminada = {
  idCurso: string;
  idLeccion: string;
  titulo: string;
  total: number;
  aciertos: number;
  preguntas: number;
  alSalir: () => void;
};

// La pantalla final: guarda el resultado al aparecer (spec F04). Mientras
// guarda, "Volver al curso" y la X esperan, para llegar al detalle con la
// lección ya marcada.
function LeccionTerminada({
  idCurso,
  idLeccion,
  titulo,
  total,
  aciertos,
  preguntas,
  alSalir,
}: PropsLeccionTerminada) {
  const { estado, reintentar } = useGuardarProgreso(idCurso, idLeccion, { aciertos, preguntas });

  return (
    <div className={estilos.pantalla}>
      <EncabezadoLeccion
        alSalir={alSalir}
        progreso={{ actual: total, total }}
        deshabilitada={estado === "guardando"}
      />
      <main className={estilos.estado}>
        <ResultadoLeccion
          titulo={titulo}
          aciertos={aciertos}
          preguntas={preguntas}
          alVolver={alSalir}
          guardado={estado}
          alReintentar={reintentar}
        />
      </main>
    </div>
  );
}
