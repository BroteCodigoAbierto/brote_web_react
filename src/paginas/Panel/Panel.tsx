import {
  ArrowRight,
  BookMarked,
  Check,
  Copy,
  GraduationCap,
  Medal,
  PenTool,
  Users,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import AvanceCurso from "../../componentes/AvanceCurso/AvanceCurso.tsx";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import Insignia from "../../componentes/Insignia/Insignia.tsx";
import InsigniaCurso from "../../componentes/InsigniaCurso/InsigniaCurso.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import TarjetaCurso from "../../componentes/TarjetaCurso/TarjetaCurso.tsx";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import { leerErrorDeCarga } from "../../servicios/cursos.ts";
import { traerMisGrupos, unirseAGrupo } from "../../servicios/grupos.ts";
import { traerCursosEmpezados, traerInsignias } from "../../servicios/progreso.ts";
import {
  LIMITES_GRUPO,
  type CursoEmpezado,
  type GrupoResumen,
  type InsigniaCurso as TipoInsignia,
} from "../../tipos/contrato.ts";
import estilos from "./Panel.module.css";

// "Mi aprendizaje" (/panel, F04 + F08 + decisión 0020): enfocado en el alumno
// (progreso, aulas a las que se unió e insignias ganadas). La creación de cursos,
// aulas docentes, organizaciones y moderación viven en /estudio.
export default function Panel() {
  const navegar = useNavigate();

  return (
    <div className={estilos.panel}>
      <header className={estilos.encabezadoPagina}>
        <div>
          <h1 className={estilos.titulo}>Mi aprendizaje</h1>
          <p className={estilos.subtitulo}>
            Retoma tus cursos, revisa tus aulas y consulta las insignias que ganaste.
          </p>
        </div>
        <Boton
          variante="secundario"
          tamano="chico"
          icono={PenTool}
          alPulsar={() => navegar("/estudio")}
        >
          Ir al Estudio
        </Boton>
      </header>

      <SigueAprendiendo />
      <MisAulasAlumno />
      <MisInsignias />
    </div>
  );
}

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

// Aulas a las que el alumno se unió mediante código de clase (decisión 0020).
function MisAulasAlumno() {
  const { datos, cargando, error, recargar } = usePeticion(traerMisGrupos);
  const [codigo, setCodigo] = useState("");
  const [uniendose, setUniendose] = useState(false);
  const [errorUnion, setErrorUnion] = useState<string | null>(null);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);

  const gruposAlumno = (datos?.grupos ?? []).filter((g) => !g.esDocente);

  async function alUnirse(evento: FormEvent) {
    evento.preventDefault();
    const limpio = codigo.trim().toUpperCase();
    if (!limpio) {
      setErrorUnion("Escribe el código que te compartió tu docente.");
      return;
    }
    setUniendose(true);
    setErrorUnion(null);
    setMensajeOk(null);
    try {
      const { grupo } = await unirseAGrupo({ codigo: limpio });
      setCodigo("");
      setMensajeOk(`Te uniste al aula «${grupo.nombre}».`);
      recargar();
    } catch (err) {
      setErrorUnion(leerErrorDeCarga(err));
    } finally {
      setUniendose(false);
    }
  }

  return (
    <section className={estilos.seccion} aria-labelledby="titulo-mis-aulas">
      <h2 id="titulo-mis-aulas" className={estilos.tituloSeccion}>
        Mis aulas y grupos
      </h2>

      <Superficie className={estilos.tarjetaCodigo}>
        <form className={estilos.formularioCodigo} onSubmit={alUnirse} noValidate>
          <div className={estilos.campoCodigo}>
            <CampoTexto
              id="codigo-aula"
              etiqueta="Unirme a un aula con código"
              valor={codigo}
              alCambiar={setCodigo}
              maxLongitud={LIMITES_GRUPO.codigoMax}
              ayuda="Si un profesor te dio un código de clase, ingrésalo aquí para compartir tu avance."
              deshabilitado={uniendose}
            />
          </div>
          <div className={estilos.botonCodigo}>
            <Boton tipo="submit" enviando={uniendose} textoEnviando="Uniéndome...">
              Unirme al aula
            </Boton>
          </div>
        </form>
        {errorUnion && <Aviso tono="error" texto={errorUnion} />}
        {mensajeOk && <Aviso tono="exito" texto={mensajeOk} />}
      </Superficie>

      <ContenidoAulas
        grupos={gruposAlumno}
        cargando={cargando}
        error={error}
        alReintentar={recargar}
      />
    </section>
  );
}

type PropsContenidoAulas = {
  grupos: GrupoResumen[];
  cargando: boolean;
  error: unknown;
  alReintentar: () => void;
};

function ContenidoAulas({ grupos, cargando, error, alReintentar }: PropsContenidoAulas) {
  if (cargando) return <IndicadorCarga />;
  if (error) {
    return <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={alReintentar} />;
  }
  if (grupos.length === 0) {
    return (
      <EstadoVacio
        icono={GraduationCap}
        titulo="Aún no estás en ningún aula."
        texto="Las aulas son opcionales. Si estudias con un grupo o docente, pide el código para unirte."
      />
    );
  }
  return (
    <ul className={estilos.listaAulas}>
      {grupos.map((grupo) => (
        <li key={grupo.id}>
          <Superficie className={estilos.tarjetaAula}>
            <div className={estilos.encabezadoAula}>
              <div>
                <h3 className={estilos.nombreAula}>{grupo.nombre}</h3>
                <p className={estilos.metaAula}>
                  Docente: {grupo.nombreDocente}
                  {grupo.organizacion ? ` · ${grupo.organizacion.nombre}` : ""}
                </p>
              </div>
              <Insignia icono={Users}>{grupo.cantidadAlumnos} alumnos</Insignia>
            </div>
            <p className={estilos.cursoAula}>{grupo.tituloCurso}</p>
            {typeof grupo.leccionesCompletadas === "number" &&
              typeof grupo.cantidadLecciones === "number" && (
                <AvanceCurso
                  completadas={grupo.leccionesCompletadas}
                  total={grupo.cantidadLecciones}
                />
              )}
            <Link to={`/cursos/${grupo.idCurso}`} className={estilos.abrirCurso}>
              Abrir curso
              <ArrowRight className={estilos.iconoInline} aria-hidden="true" />
            </Link>
          </Superficie>
        </li>
      ))}
    </ul>
  );
}

function MisInsignias() {
  const { usuario } = useSesion();
  const { datos, cargando, error, recargar } = usePeticion(traerInsignias);
  const [copiada, setCopiada] = useState<string | null>(null);

  async function copiarConstancia(insignia: TipoInsignia) {
    const fecha = new Intl.DateTimeFormat("es", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(insignia.ganadaEn));
    const texto = `Constancia de finalización en Brote — ${usuario?.nombre ?? "Estudiante"} completó el curso «${insignia.titulo}» el ${fecha}. (${window.location.origin}/cursos/${insignia.idCurso})`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiada(insignia.idCurso);
      setTimeout(() => setCopiada((actual) => (actual === insignia.idCurso ? null : actual)), 2500);
    } catch {
      // sin permiso de portapapeles
    }
  }

  return (
    <section className={estilos.seccion} aria-labelledby="titulo-mis-insignias">
      <h2 id="titulo-mis-insignias" className={estilos.tituloSeccion}>
        Mis insignias
      </h2>
      <ContenidoMisInsignias
        insignias={datos?.insignias ?? null}
        cargando={cargando}
        error={error}
        alReintentar={recargar}
        copiada={copiada}
        alCopiar={copiarConstancia}
      />
    </section>
  );
}

type PropsContenidoMisInsignias = {
  insignias: TipoInsignia[] | null;
  cargando: boolean;
  error: unknown;
  alReintentar: () => void;
  copiada: string | null;
  alCopiar: (insignia: TipoInsignia) => void;
};

function ContenidoMisInsignias({
  insignias,
  cargando,
  error,
  alReintentar,
  copiada,
  alCopiar,
}: PropsContenidoMisInsignias) {
  if (cargando) return <IndicadorCarga />;
  if (error || !insignias) {
    return (
      <ErrorCarga mensaje="No se pudieron cargar tus insignias." alReintentar={alReintentar} />
    );
  }
  if (insignias.length === 0) {
    return (
      <EstadoVacio
        icono={Medal}
        titulo="Todavía no tienes insignias"
        texto="Completa un curso que dé insignia para ganar la primera."
      />
    );
  }
  return (
    <ul className={estilos.insignias}>
      {insignias.map((insignia) => (
        <li key={insignia.idCurso} className={estilos.itemInsignia}>
          <InsigniaCurso insignia={insignia} tamano="lista" />
          <Boton
            variante="fantasma"
            tamano="chico"
            icono={copiada === insignia.idCurso ? Check : Copy}
            alPulsar={() => alCopiar(insignia)}
          >
            {copiada === insignia.idCurso ? "Constancia copiada" : "Copiar constancia"}
          </Boton>
        </li>
      ))}
    </ul>
  );
}
