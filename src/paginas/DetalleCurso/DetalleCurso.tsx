import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  CircleCheck,
  CircleSlash,
  GitFork,
  Lock,
  NotebookPen,
  Share2,
  Sparkles,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import AvanceCurso from "../../componentes/AvanceCurso/AvanceCurso.tsx";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoSelector from "../../componentes/CampoSelector/CampoSelector.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import Dialogo from "../../componentes/Dialogo/Dialogo.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import Insignia from "../../componentes/Insignia/Insignia.tsx";
import PortadaCurso from "../../componentes/PortadaCurso/PortadaCurso.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useEspacio } from "../../hooks/useEspacio.ts";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import {
  esNoDisponible,
  leerErrorDeCarga,
  traerCurso,
  traerCursoPorEnlace,
} from "../../servicios/cursos.ts";
import { bifurcarCurso } from "../../servicios/editor.ts";
import {
  MENSAJES_CATALOGO,
  NOMBRE_CATEGORIA,
  NOMBRE_IDIOMA,
  NOMBRE_NIVEL,
  type DetalleCurso as Curso,
  type LeccionDelCurso,
} from "../../tipos/contrato.ts";
import { textoCantidadLecciones } from "../../utilidades/cursos.ts";
import { ESTADO_DESDE_CURSO } from "../../utilidades/navegacion.ts";
import { avanceCurso, textoAciertos, textoBotonSiguiente } from "../../utilidades/progreso.ts";
import estilos from "./DetalleCurso.module.css";

type BloqueModulo = {
  nombre: string;
  lecciones: LeccionDelCurso[];
};

function agruparPorModulo(lecciones: LeccionDelCurso[]): BloqueModulo[] | null {
  if (!lecciones.some((l) => l.modulo)) return null;
  const bloques: BloqueModulo[] = [];
  for (const leccion of lecciones) {
    const nombre = leccion.modulo?.trim() || "General";
    const ultimo = bloques[bloques.length - 1];
    if (ultimo && ultimo.nombre === nombre) {
      ultimo.lecciones.push(leccion);
    } else {
      bloques.push({ nombre, lecciones: [leccion] });
    }
  }
  return bloques;
}

// Detalle de un curso publicado o abierto por enlace privado (F02 + decisión 0020):
// metadatos completos, autor clicable, bifurcación (fork), temario agrupado por
// módulos y muestra abierta de la lección 1 para visitantes.
export default function DetalleCurso() {
  const { idCurso = "", clave: claveRuta } = useParams();
  const [parametros] = useSearchParams();
  const claveConsulta = parametros.get("clave") ?? undefined;
  const claveSolicitada = claveRuta ?? claveConsulta;

  const { usuario } = useSesion();
  const { organizacionesDocente } = useEspacio();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const { datos, cargando, error, recargar } = usePeticion(
    useCallback(
      () => (claveRuta ? traerCursoPorEnlace(claveRuta) : traerCurso(idCurso, claveConsulta)),
      [idCurso, claveRuta, claveConsulta],
    ),
  );

  const [copiado, setCopiado] = useState(false);
  const [dialogoFork, setDialogoFork] = useState(false);
  const [destinoFork, setDestinoFork] = useState<string | null>(null);
  const [tituloFork, setTituloFork] = useState("");
  const [bifurcando, setBifurcando] = useState(false);
  const [errorFork, setErrorFork] = useState<string | null>(null);

  const bloques = useMemo(() => (datos ? agruparPorModulo(datos.curso.lecciones) : null), [datos]);

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
  const claveActiva = curso.claveEnlace ?? claveSolicitada;
  const sufijoClave = claveActiva ? `?clave=${encodeURIComponent(claveActiva)}` : "";

  function rutaLeccion(idLeccion: string) {
    return `/cursos/${curso.id}/lecciones/${idLeccion}${sufijoClave}`;
  }

  async function copiarEnlace() {
    const ruta =
      curso.visibilidad === "enlacePrivado" && curso.claveEnlace
        ? `/cursos/enlace/${curso.claveEnlace}`
        : `/cursos/${curso.id}`;
    const url = `${window.location.origin}${ruta}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // sin permiso de portapapeles
    }
  }

  function abrirDialogoFork() {
    if (!usuario) {
      void navegar("/entrar", { state: { desde: ubicacion } });
      return;
    }
    setTituloFork(`${curso.titulo} (copia)`);
    setDestinoFork(null);
    setErrorFork(null);
    setDialogoFork(true);
  }

  async function confirmarFork() {
    setBifurcando(true);
    setErrorFork(null);
    try {
      const { curso: copia } = await bifurcarCurso(curso.id, {
        idOrganizacion: destinoFork,
        titulo: tituloFork.trim() || undefined,
      });
      setDialogoFork(false);
      void navegar(`/editor/${copia.id}`);
    } catch (err) {
      setErrorFork(leerErrorDeCarga(err));
    } finally {
      setBifurcando(false);
    }
  }

  function renderizarFilaLeccion(leccion: LeccionDelCurso) {
    const aciertos = leccion.progreso ? textoAciertos(leccion.progreso) : null;
    const bloqueadaVisitante = !usuario && leccion.posicion > 1;

    if (bloqueadaVisitante) {
      return (
        <li key={leccion.id}>
          <Link
            to="/entrar"
            state={{ desde: ubicacion }}
            className={`${estilos.leccion} ${estilos.leccionBloqueada}`}
          >
            <span className={estilos.numero} aria-hidden="true">
              {leccion.posicion}
            </span>
            <span className="oculto">{leccion.posicion}. </span>
            <span className={estilos.tituloLeccion}>{leccion.titulo}</span>
            <span className={estilos.etiquetaBloqueo}>
              <Lock className={estilos.iconoCandado} aria-hidden="true" />
              Requiere cuenta
            </span>
            <ChevronRight className={estilos.flecha} aria-hidden="true" />
          </Link>
        </li>
      );
    }

    return (
      <li key={leccion.id}>
        <Link to={rutaLeccion(leccion.id)} state={ESTADO_DESDE_CURSO} className={estilos.leccion}>
          <span
            className={`${estilos.numero} ${leccion.progreso ? estilos.numeroCompletada : ""}`}
            aria-hidden="true"
          >
            {leccion.posicion}
          </span>
          <span className="oculto">{leccion.posicion}. </span>
          <span className={estilos.tituloLeccion}>{leccion.titulo}</span>
          {!usuario && leccion.posicion === 1 && (
            <span className={estilos.muestraAbierta}>
              <Insignia tono="brote" icono={Sparkles}>
                Muestra abierta
              </Insignia>
            </span>
          )}
          {leccion.progreso && (
            <span className={estilos.completada}>
              <span className="oculto">, completada</span>
              <CircleCheck className={estilos.iconoCompletada} aria-hidden="true" />
              {aciertos && (
                <span className={estilos.aciertos}>
                  <span className="oculto">, </span>
                  {aciertos}
                </span>
              )}
            </span>
          )}
          <ChevronRight className={estilos.flecha} aria-hidden="true" />
        </Link>
      </li>
    );
  }

  return (
    <article className={estilos.detalle}>
      <Volver />

      <Superficie className={estilos.encabezado} elevada>
        <PortadaCurso
          id={curso.id}
          titulo={curso.titulo}
          tamano="detalle"
          idPortada={curso.idPortada}
        />
        <div className={estilos.datos}>
          <div className={estilos.insignias}>
            <Insignia tono="primario">{NOMBRE_CATEGORIA[curso.categoria]}</Insignia>
            <Insignia>{NOMBRE_NIVEL[curso.nivel]}</Insignia>
            <Insignia>{NOMBRE_IDIOMA[curso.idioma]}</Insignia>
            <Insignia icono={BookOpen}>{textoCantidadLecciones(curso.cantidadLecciones)}</Insignia>
            {curso.daInsignia && (
              <Insignia tono="acento" icono={Award}>
                Otorga insignia
              </Insignia>
            )}
          </div>

          <h1 className={estilos.titulo}>{curso.titulo}</h1>

          <div className={estilos.metaAutor}>
            <span>
              Por{" "}
              <Link to={`/autores/${curso.autor.id}`} className={estilos.enlaceAutor}>
                {curso.autor.nombre}
              </Link>
            </span>
            {curso.organizacion && (
              <Link to={`/o/${curso.organizacion.slug}`} className={estilos.enlaceOrg}>
                <Building2 className={estilos.iconoInline} aria-hidden="true" />
                {curso.organizacion.nombre}
              </Link>
            )}
          </div>

          {curso.cursoOrigen && (
            <p className={estilos.origenFork}>
              <GitFork className={estilos.iconoInline} aria-hidden="true" />
              Adaptado de{" "}
              <Link to={`/cursos/${curso.cursoOrigen.id}`}>
                {curso.cursoOrigen.titulo}
              </Link> (por {curso.cursoOrigen.nombreAutor})
            </p>
          )}

          {curso.etiquetas.length > 0 && (
            <div className={estilos.etiquetas}>
              {curso.etiquetas.map((etiqueta) => (
                <span key={etiqueta} className={estilos.etiqueta}>
                  #{etiqueta}
                </span>
              ))}
            </div>
          )}

          <div className={estilos.accionesEncabezado}>
            <Boton
              variante="secundario"
              tamano="chico"
              icono={copiado ? Check : Share2}
              alPulsar={copiarEnlace}
            >
              {copiado ? "Enlace copiado" : "Compartir"}
            </Boton>
            {curso.permiteFork && (
              <Boton
                variante="secundario"
                tamano="chico"
                icono={GitFork}
                alPulsar={abrirDialogoFork}
              >
                Adaptar curso
              </Boton>
            )}
          </div>
        </div>
      </Superficie>

      <p className={estilos.descripcion}>{curso.descripcion}</p>

      {curso.lecciones.length > 0 && (
        <Avance curso={curso} usuarioAutenticado={Boolean(usuario)} rutaLeccion={rutaLeccion} />
      )}

      <section className={estilos.lecciones} aria-labelledby="titulo-lecciones">
        <h2 id="titulo-lecciones" className={estilos.seccion}>
          Temario
        </h2>
        {curso.lecciones.length === 0 ? (
          <EstadoVacio icono={NotebookPen} titulo="Este curso todavía no tiene lecciones." />
        ) : bloques ? (
          <div className={estilos.modulos}>
            {bloques.map((bloque, indice) => (
              <div key={`${bloque.nombre}-${indice}`} className={estilos.bloqueModulo}>
                <h3 className={estilos.tituloModulo}>{bloque.nombre}</h3>
                <Superficie como="ol" className={estilos.lista}>
                  {bloque.lecciones.map(renderizarFilaLeccion)}
                </Superficie>
              </div>
            ))}
          </div>
        ) : (
          <Superficie como="ol" className={estilos.lista}>
            {curso.lecciones.map(renderizarFilaLeccion)}
          </Superficie>
        )}
      </section>

      <Dialogo
        abierto={dialogoFork}
        titulo="Adaptar este curso"
        texto="Se creará un borrador propio con todas sus lecciones y recursos, manteniendo el crédito al curso original."
        textoConfirmar="Crear adaptación"
        textoCancelar="Cancelar"
        varianteConfirmar="primario"
        enviando={bifurcando}
        alConfirmar={confirmarFork}
        alCancelar={() => setDialogoFork(false)}
      >
        <div className={estilos.camposDialogo}>
          {errorFork && <Aviso tono="error" texto={errorFork} />}
          <CampoTexto
            id="titulo-fork"
            etiqueta="Título de tu adaptación"
            valor={tituloFork}
            alCambiar={setTituloFork}
            deshabilitado={bifurcando}
          />
          {organizacionesDocente.length > 0 && (
            <CampoSelector
              id="destino-fork"
              etiqueta="Guardar en"
              valor={destinoFork}
              textoVacio="Mi cuenta personal"
              opciones={organizacionesDocente.map((org) => ({
                valor: org.id,
                texto: org.nombre,
              }))}
              alCambiar={setDestinoFork}
              deshabilitado={bifurcando}
            />
          )}
        </div>
      </Dialogo>
    </article>
  );
}

type PropsAvance = {
  curso: Curso;
  usuarioAutenticado: boolean;
  rutaLeccion: (idLeccion: string) => string;
};

function Avance({ curso, usuarioAutenticado, rutaLeccion }: PropsAvance) {
  const navegar = useNavigate();
  const { completadas, total, siguiente } = avanceCurso(curso.lecciones);

  if (!usuarioAutenticado) {
    const primera = curso.lecciones[0];
    if (!primera) return null;
    return (
      <Superficie className={estilos.avance}>
        <p className={estilos.notaVisitante}>
          Puedes probar la primera lección sin crear cuenta. Regístrate cuando quieras guardar tu
          progreso y desbloquear todo el curso.
        </p>
        <div>
          <Boton
            iconoFinal={ArrowRight}
            alPulsar={() => navegar(rutaLeccion(primera.id), { state: ESTADO_DESDE_CURSO })}
          >
            Probar lección 1 gratis
          </Boton>
        </div>
      </Superficie>
    );
  }

  return (
    <Superficie className={estilos.avance}>
      <AvanceCurso completadas={completadas} total={total} />
      {siguiente && (
        <div>
          <Boton
            iconoFinal={ArrowRight}
            alPulsar={() =>
              navegar(rutaLeccion(siguiente.id), {
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
