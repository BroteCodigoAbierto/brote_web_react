import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarClock,
  Check,
  ChevronRight,
  CircleSlash,
  Medal,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import Dialogo from "../../componentes/Dialogo/Dialogo.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import Insignia from "../../componentes/Insignia/Insignia.tsx";
import PortadaCurso from "../../componentes/PortadaCurso/PortadaCurso.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { leerErrorDeCarga } from "../../servicios/cursos.ts";
import {
  aprobarCurso,
  leerErrorDeModeracion,
  rechazarCurso,
  traerCursoEnModeracion,
  yaNoEnRevision,
} from "../../servicios/moderacion.ts";
import { LIMITES_MODERACION, NOMBRE_IDIOMA, type CursoEnModeracion } from "../../tipos/contrato.ts";
import { textoCantidadLecciones } from "../../utilidades/cursos.ts";
import { estadoConAviso } from "../../utilidades/moderacion.ts";
import { ESTADO_DESDE_CURSO } from "../../utilidades/navegacion.ts";
import detalle from "../DetalleCurso/DetalleCurso.module.css";
import estilos from "./RevisarCurso.module.css";

const FECHA = new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" });

// La revisión de un curso (decisión 0018 y 0020): el curso como lo vería un alumno,
// sus lecciones para probarlas sin registrar progreso, y la decisión.
export default function RevisarCurso() {
  const { idCurso = "" } = useParams();
  const { datos, cargando, error, recargar } = usePeticion(
    useCallback(() => traerCursoEnModeracion(idCurso), [idCurso]),
  );

  if (cargando) return <IndicadorCarga />;

  if (yaNoEnRevision(error)) {
    return (
      <EstadoVacio
        icono={CircleSlash}
        titulo={leerErrorDeModeracion(error, "Este curso ya no está en revisión.")}
        anunciar
        accion={<Link to="/estudio?pestana=revision">Volver a la cola de revisión</Link>}
      />
    );
  }

  if (error || !datos) {
    return <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />;
  }

  return <Revision curso={datos.curso} />;
}

function Revision({ curso }: { curso: CursoEnModeracion }) {
  const navegar = useNavigate();

  return (
    <article className={detalle.detalle}>
      <div className={detalle.volver}>
        <Boton
          variante="enlace"
          tamano="chico"
          icono={ArrowLeft}
          alPulsar={() => navegar("/estudio?pestana=revision")}
        >
          Cola de revisión
        </Boton>
      </div>

      <Aviso
        tono="info"
        texto="Este curso está en revisión. Prueba sus lecciones y decide si se publica; probar no cuenta como progreso."
      />

      <Superficie className={detalle.encabezado} elevada>
        <PortadaCurso
          id={curso.id}
          titulo={curso.titulo}
          tamano="detalle"
          idPortada={curso.idPortada}
        />
        <div className={detalle.datos}>
          <h1 className={detalle.titulo}>{curso.titulo}</h1>
          <p className={detalle.autor}>Por {curso.nombreAutor}</p>
          <p className={detalle.idioma}>Idioma: {NOMBRE_IDIOMA[curso.idioma]}</p>
          <div className={estilos.insignias}>
            <Insignia tono="primario" icono={BookOpen}>
              {textoCantidadLecciones(curso.cantidadLecciones)}
            </Insignia>
            {curso.organizacion && (
              <Insignia tono="acento" icono={Building2}>
                {curso.organizacion.nombre}
              </Insignia>
            )}
            {curso.daInsignia && <Insignia icono={Medal}>Da insignia</Insignia>}
            <Insignia icono={CalendarClock}>
              Enviado el {FECHA.format(new Date(curso.enviadoEn))}
            </Insignia>
          </div>
        </div>
      </Superficie>

      <p className={detalle.descripcion}>{curso.descripcion}</p>

      <section className={detalle.lecciones} aria-labelledby="titulo-lecciones">
        <h2 id="titulo-lecciones" className={detalle.seccion}>
          Lecciones
        </h2>
        <Superficie como="ol" className={detalle.lista}>
          {curso.lecciones.map((leccion) => (
            <li key={leccion.id}>
              <Link
                to={`/moderacion/${curso.id}/lecciones/${leccion.id}`}
                state={ESTADO_DESDE_CURSO}
                className={detalle.leccion}
              >
                <span className={detalle.numero} aria-hidden="true">
                  {leccion.posicion}
                </span>
                <span className="oculto">{leccion.posicion}. </span>
                <span className={detalle.tituloLeccion}>{leccion.titulo}</span>
                <span className={estilos.probar}>
                  <span className="oculto">, </span>
                  Probar
                </span>
                <ChevronRight className={detalle.flecha} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </Superficie>
      </section>

      <Decision curso={curso} />
    </article>
  );
}

type Accion = "aprobar" | "rechazar";

// Los dos botones y sus confirmaciones. Con éxito, o si alguien más ya decidió (404 o
// 409), vuelve a "Mi panel" y lo dice ahí; con otro error se queda y lo dice aquí.
function Decision({ curso }: { curso: CursoEnModeracion }) {
  const navegar = useNavigate();
  const [confirmando, setConfirmando] = useState<Accion | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  // el estado tarda un render en verse; con la ref un doble clic no decide dos veces
  const accionEnCurso = useRef(false);

  async function confirmar(accion: Accion) {
    if (accionEnCurso.current) return;
    accionEnCurso.current = true;
    setEnviando(true);
    setError(null);
    try {
      if (accion === "aprobar") await aprobarCurso(curso.id);
      else await rechazarCurso(curso.id, { motivo });
      const texto =
        accion === "aprobar"
          ? `«${curso.titulo}» ya está publicado en el catálogo.`
          : `«${curso.titulo}» no se aprobó: volvió a su autor como borrador.`;
      navegar("/estudio?pestana=revision", { state: estadoConAviso({ texto, tono: "exito" }) });
    } catch (err) {
      const respaldo =
        accion === "aprobar" ? "No se pudo aprobar el curso." : "No se pudo enviar la decisión.";
      const texto = leerErrorDeModeracion(err, respaldo);
      if (yaNoEnRevision(err)) {
        navegar("/estudio?pestana=revision", { state: estadoConAviso({ texto, tono: "error" }) });
        return;
      }
      setError(texto);
      setConfirmando(null);
    } finally {
      accionEnCurso.current = false;
      setEnviando(false);
    }
  }

  return (
    <Superficie className={estilos.decision}>
      <div className={estilos.textoDecision}>
        <h2 className={detalle.seccion}>Decisión</h2>
        <p className={estilos.ayuda}>
          Al aprobarlo, aparece en el catálogo. Si no lo apruebas, vuelve a su autor como borrador,
          con tu motivo.
        </p>
      </div>
      {error && <Aviso texto={error} />}
      <div className={estilos.botones}>
        <Boton variante="secundario" icono={X} alPulsar={() => setConfirmando("rechazar")}>
          No aprobar
        </Boton>
        <Boton icono={Check} alPulsar={() => setConfirmando("aprobar")}>
          Aprobar
        </Boton>
      </div>

      <Dialogo
        abierto={confirmando === "aprobar"}
        titulo="¿Aprobar este curso?"
        texto={`«${curso.titulo}» se publicará y cualquiera podrá cursarlo.`}
        textoConfirmar="Aprobar"
        textoCancelar="Cancelar"
        varianteConfirmar="primario"
        enviando={enviando}
        alConfirmar={() => void confirmar("aprobar")}
        alCancelar={() => setConfirmando(null)}
      />

      <Dialogo
        abierto={confirmando === "rechazar"}
        titulo="¿No aprobar este curso?"
        texto="Volverá a su autor como borrador, con la marca «Revisión no aprobada»."
        textoConfirmar="No aprobar"
        textoCancelar="Cancelar"
        enviando={enviando}
        alConfirmar={() => void confirmar("rechazar")}
        alCancelar={() => setConfirmando(null)}
      >
        <CampoArea
          id="motivo-rechazo"
          etiqueta="Motivo (opcional)"
          valor={motivo}
          alCambiar={setMotivo}
          ayuda="Tu autor lo verá en el mapa del curso."
          maxLongitud={LIMITES_MODERACION.motivoMax}
          filas={4}
          deshabilitado={enviando}
        />
      </Dialogo>
    </Superficie>
  );
}
