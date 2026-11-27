import { CircleSlash, Flag, Lock, NotebookPen } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import {
  Link,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import EncabezadoLeccion from "../../actividades/ReproductorLeccion/EncabezadoLeccion.tsx";
import ReproductorLeccion from "../../actividades/ReproductorLeccion/ReproductorLeccion.tsx";
import { actividadesConocidas } from "../../actividades/registro.ts";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import Dialogo from "../../componentes/Dialogo/Dialogo.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import ResultadoLeccion from "../../componentes/ResultadoLeccion/ResultadoLeccion.tsx";
import { useGuardarProgreso } from "../../hooks/useGuardarProgreso.ts";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { useReproductor } from "../../hooks/useReproductor.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import { ErrorHttp } from "../../servicios/api.ts";
import { esNoDisponible, leerErrorDeCarga, reportarActividad } from "../../servicios/cursos.ts";
import { traerLeccion } from "../../servicios/lecciones.ts";
import {
  LIMITES_REPORTE,
  MENSAJES_LECCION,
  MENSAJES_REPORTE,
  type DetalleLeccion,
} from "../../tipos/contrato.ts";
import { vieneDelCurso } from "../../utilidades/navegacion.ts";
import estilos from "./Leccion.module.css";

// Cursar una lección (F03 + decisión 0020), a pantalla completa y fuera del marco común.
// La primera lección está abierta sin cuenta (muestra abierta); los alumnos con sesión
// guardan su progreso y pueden reportar errores en cualquier actividad.
export default function Leccion() {
  const { idCurso = "", idLeccion = "" } = useParams();
  const [parametros] = useSearchParams();
  const clave = parametros.get("clave") ?? undefined;
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const { usuario } = useSesion();

  const { datos, cargando, error, recargar } = usePeticion(
    useCallback(() => traerLeccion(idCurso, idLeccion, clave), [idCurso, idLeccion, clave]),
  );

  function salir() {
    if (vieneDelCurso(ubicacion.state)) navegar(-1);
    else {
      const sufijo = clave ? `?clave=${encodeURIComponent(clave)}` : "";
      navegar(`/cursos/${idCurso}${sufijo}`, { replace: true });
    }
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

  if (!usuario && error instanceof ErrorHttp && error.estado === 401) {
    return conEncabezado(
      <EstadoVacio
        icono={Lock}
        titulo="Crea una cuenta gratis para continuar."
        texto="La primera lección es una muestra abierta. Inicia sesión o regístrate para cursar las demás lecciones y guardar tu progreso."
        anunciar
        accion={
          <div className={estilos.accionesInvitado}>
            <Boton alPulsar={() => navegar("/registro", { state: { desde: ubicacion } })}>
              Crear cuenta gratis
            </Boton>
            <Boton
              variante="secundario"
              alPulsar={() => navegar("/entrar", { state: { desde: ubicacion } })}
            >
              Ya tengo cuenta
            </Boton>
          </div>
        }
      />,
    );
  }

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

function CursarLeccion({ idCurso, idLeccion, leccion, actividades, alSalir }: PropsCursarLeccion) {
  const { usuario } = useSesion();
  const reproductor = useReproductor(actividades);
  const { hizoAlgo, terminada, aciertos, preguntas, indice } = reproductor;

  const [reportando, setReportando] = useState(false);
  const [mensajeReporte, setMensajeReporte] = useState("");
  const [enviandoReporte, setEnviandoReporte] = useState(false);
  const [errorReporte, setErrorReporte] = useState<string | null>(null);
  const [reporteEnviado, setReporteEnviado] = useState(false);

  const bloqueo = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hizoAlgo && !terminada && currentLocation.pathname !== nextLocation.pathname,
  );

  async function enviarReporte() {
    const limpio = mensajeReporte.trim();
    if (!limpio) {
      setErrorReporte(MENSAJES_REPORTE.mensajeVacio);
      return;
    }
    setEnviandoReporte(true);
    setErrorReporte(null);
    try {
      await reportarActividad(idCurso, idLeccion, {
        indiceActividad: indice,
        mensaje: limpio,
      });
      setReportando(false);
      setMensajeReporte("");
      setReporteEnviado(true);
      setTimeout(() => setReporteEnviado(false), 4000);
    } catch (err) {
      setErrorReporte(leerErrorDeCarga(err));
    } finally {
      setEnviandoReporte(false);
    }
  }

  if (terminada) {
    if (!usuario) {
      return (
        <LeccionTerminadaVisitante
          titulo={leccion.titulo}
          total={actividades.length}
          aciertos={aciertos}
          preguntas={preguntas}
          alSalir={alSalir}
        />
      );
    }
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

      {usuario && (
        <div className={estilos.pieReporte}>
          {reporteEnviado ? (
            <Aviso tono="exito" texto="Gracias, enviamos tu reporte al autor del curso." />
          ) : (
            <Boton
              variante="enlace"
              tamano="chico"
              icono={Flag}
              alPulsar={() => {
                setErrorReporte(null);
                setReportando(true);
              }}
            >
              Reportar error en esta actividad
            </Boton>
          )}
        </div>
      )}

      <Dialogo
        abierto={reportando}
        titulo="Reportar error en esta actividad"
        texto={`Actividad ${indice + 1} de ${actividades.length}. Cuéntale al autor qué conviene corregir.`}
        textoConfirmar="Enviar reporte"
        textoCancelar="Cancelar"
        varianteConfirmar="primario"
        enviando={enviandoReporte}
        alConfirmar={enviarReporte}
        alCancelar={() => setReportando(false)}
      >
        <div className={estilos.camposReporte}>
          {errorReporte && <Aviso tono="error" texto={errorReporte} />}
          <CampoArea
            id="mensaje-reporte"
            etiqueta="¿Qué encontraste?"
            valor={mensajeReporte}
            alCambiar={setMensajeReporte}
            maxLongitud={LIMITES_REPORTE.mensajeMax}
            filas={3}
            deshabilitado={enviandoReporte}
          />
        </div>
      </Dialogo>

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

type PropsLeccionTerminadaVisitante = {
  titulo: string;
  total: number;
  aciertos: number;
  preguntas: number;
  alSalir: () => void;
};

function LeccionTerminadaVisitante({
  titulo,
  total,
  aciertos,
  preguntas,
  alSalir,
}: PropsLeccionTerminadaVisitante) {
  const navegar = useNavigate();

  return (
    <div className={estilos.pantalla}>
      <EncabezadoLeccion alSalir={alSalir} progreso={{ actual: total, total }} />
      <main className={estilos.estado}>
        <ResultadoLeccion
          titulo={titulo}
          aciertos={aciertos}
          preguntas={preguntas}
          alVolver={alSalir}
        />
        <div className={estilos.ctaVisitante}>
          <Aviso
            tono="info"
            texto="Completaste la muestra abierta. Crea una cuenta gratuita para guardar tu avance y cursar el resto del curso."
          />
          <Boton anchoCompleto alPulsar={() => navegar("/registro")}>
            Crear cuenta para guardar mi avance
          </Boton>
        </div>
      </main>
    </div>
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

function LeccionTerminada({
  idCurso,
  idLeccion,
  titulo,
  total,
  aciertos,
  preguntas,
  alSalir,
}: PropsLeccionTerminada) {
  const { estado, reintentar, insignia } = useGuardarProgreso(idCurso, idLeccion, {
    aciertos,
    preguntas,
  });

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
          insignia={insignia}
        />
      </main>
    </div>
  );
}
