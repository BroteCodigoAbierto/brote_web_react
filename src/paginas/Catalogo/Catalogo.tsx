import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronDown,
  Library,
  SearchX,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import Boton from "../../componentes/Boton/Boton.tsx";
import Buscador from "../../componentes/Buscador/Buscador.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import Insignia from "../../componentes/Insignia/Insignia.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import TarjetaCurso from "../../componentes/TarjetaCurso/TarjetaCurso.tsx";
import { useCatalogo } from "../../hooks/useCatalogo.ts";
import { useEspacio } from "../../hooks/useEspacio.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import { leerErrorDeCarga } from "../../servicios/cursos.ts";
import { traerOrganizacionPorSlug } from "../../servicios/organizaciones.ts";
import { traerCursosEmpezados } from "../../servicios/progreso.ts";
import {
  CATEGORIAS_CURSO,
  IDIOMAS_CURSO,
  NIVELES_CURSO,
  NOMBRE_CATEGORIA,
  NOMBRE_IDIOMA,
  NOMBRE_NIVEL,
  ORDENES_CATALOGO,
  type CategoriaCurso,
  type CursoEmpezado,
  type IdiomaCurso,
  type NivelCurso,
  type OrdenCatalogo,
  type OrganizacionPublica,
} from "../../tipos/contrato.ts";
import estilos from "./Catalogo.module.css";

const ESPERA_BUSQUEDA_MS = 300;
const OPCIONES_DIRECCION = { replace: true, preventScrollReset: true };

const NOMBRE_ORDEN: Record<OrdenCatalogo, string> = {
  destacados: "Destacados",
  recientes: "Más recientes",
  az: "A–Z",
};

function leerCategoria(valor: string | null): CategoriaCurso | undefined {
  return CATEGORIAS_CURSO.includes(valor as CategoriaCurso)
    ? (valor as CategoriaCurso)
    : undefined;
}

function leerNivel(valor: string | null): NivelCurso | undefined {
  return NIVELES_CURSO.includes(valor as NivelCurso) ? (valor as NivelCurso) : undefined;
}

function leerIdioma(valor: string | null): IdiomaCurso | undefined {
  return IDIOMAS_CURSO.includes(valor as IdiomaCurso) ? (valor as IdiomaCurso) : undefined;
}

function leerOrden(valor: string | null): OrdenCatalogo {
  return ORDENES_CATALOGO.includes(valor as OrdenCatalogo)
    ? (valor as OrdenCatalogo)
    : "destacados";
}

// Catálogo explorable (F02 + decisión 0020): búsqueda, filtros por categoría, nivel,
// idioma, orden, ocultar completados y vista opcional de espacio/organización (/o/:slug).
export default function Catalogo() {
  const { slug } = useParams();
  const [parametros, setParametros] = useSearchParams();
  const { usuario } = useSesion();
  const { configuracion, seleccionarEspacio } = useEspacio();

  const q = parametros.get("q") ?? "";
  const categoria = leerCategoria(parametros.get("categoria"));
  const nivel = leerNivel(parametros.get("nivel"));
  const idioma = leerIdioma(parametros.get("idioma"));
  const orden = leerOrden(parametros.get("orden"));
  const ocultarCompletados = parametros.get("ocultarCompletados") === "1";

  const slugOrganizacion =
    slug ??
    (configuracion.modoInstancia === "organizacion"
      ? (configuracion.slugOrganizacionFija ?? undefined)
      : undefined);

  const {
    cursos,
    siguiente,
    fase,
    buscando,
    cargandoMas,
    errorMas,
    error,
    buscar,
    cargarMas,
    reintentar,
  } = useCatalogo();

  const [texto, setTexto] = useState(q);
  const [enviado, setEnviado] = useState(q);
  const [qAnterior, setQAnterior] = useState(q);

  const [estadoOrg, setEstadoOrg] = useState<{
    slug: string;
    organizacion: OrganizacionPublica | null;
    error: string | null;
  } | null>(null);
  const [empezadosCargados, setEmpezadosCargados] = useState<CursoEmpezado[]>([]);

  const organizacion =
    slugOrganizacion && estadoOrg?.slug === slugOrganizacion ? estadoOrg.organizacion : null;
  const errorOrg =
    slugOrganizacion && estadoOrg?.slug === slugOrganizacion ? estadoOrg.error : null;
  const empezados = usuario && !slugOrganizacion ? empezadosCargados : [];

  if (q !== qAnterior) {
    setQAnterior(q);
    if (q !== enviado) {
      setTexto(q);
      setEnviado(q);
    }
  }

  // Sincroniza el espacio activo en memoria al abrir /o/:slug
  useEffect(() => {
    if (slug) seleccionarEspacio(slug);
  }, [slug, seleccionarEspacio]);

  // Carga los datos de la organización cuando se explora /o/:slug
  useEffect(() => {
    if (!slugOrganizacion) return;
    let cancelado = false;
    void traerOrganizacionPorSlug(slugOrganizacion)
      .then((res) => {
        if (!cancelado) {
          setEstadoOrg({ slug: slugOrganizacion, organizacion: res.organizacion, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setEstadoOrg({
            slug: slugOrganizacion,
            organizacion: null,
            error: leerErrorDeCarga(err),
          });
        }
      });
    return () => {
      cancelado = true;
    };
  }, [slugOrganizacion]);

  // Franja "Sigue aprendiendo" para alumnos autenticados en el inicio
  useEffect(() => {
    if (!usuario || slugOrganizacion) return;
    let cancelado = false;
    void traerCursosEmpezados()
      .then((res) => {
        if (!cancelado) setEmpezadosCargados(res.cursos.slice(0, 3));
      })
      .catch(() => {
        if (!cancelado) setEmpezadosCargados([]);
      });
    return () => {
      cancelado = true;
    };
  }, [usuario, slugOrganizacion]);

  function actualizarParametro(clave: string, valor: string | undefined) {
    const siguientes = new URLSearchParams(parametros);
    if (!valor) siguientes.delete(clave);
    else siguientes.set(clave, valor);
    setParametros(siguientes, OPCIONES_DIRECCION);
  }

  useEffect(() => {
    if (texto === q) return;
    const temporizador = setTimeout(() => {
      setEnviado(texto);
      const siguientes = new URLSearchParams(parametros);
      if (texto) siguientes.set("q", texto);
      else siguientes.delete("q");
      setParametros(siguientes, OPCIONES_DIRECCION);
    }, ESPERA_BUSQUEDA_MS);
    return () => clearTimeout(temporizador);
  }, [texto, q, parametros, setParametros]);

  const filtrosActivos = useMemo(
    () => ({
      q: q.trim(),
      categoria,
      nivel,
      idioma,
      orden,
      ocultarCompletados: usuario ? ocultarCompletados : false,
      organizacion: slugOrganizacion,
    }),
    [q, categoria, nivel, idioma, orden, ocultarCompletados, usuario, slugOrganizacion],
  );

  useEffect(() => {
    buscar(filtrosActivos);
  }, [filtrosActivos, buscar]);

  const hayFiltros =
    q.trim() !== "" ||
    Boolean(categoria) ||
    Boolean(nivel) ||
    Boolean(idioma) ||
    orden !== "destacados" ||
    ocultarCompletados;

  function limpiarFiltros() {
    setTexto("");
    setEnviado("");
    setParametros({}, OPCIONES_DIRECCION);
  }

  const catalogoVacio = fase === "listo" && !hayFiltros && cursos.length === 0;
  const sinResultados = fase === "listo" && hayFiltros && cursos.length === 0;
  const mensajeError = error ? leerErrorDeCarga(error) : null;
  const mensajeErrorMas = errorMas ? leerErrorDeCarga(errorMas) : null;

  return (
    <section className={estilos.catalogo}>
      {slugOrganizacion && organizacion ? (
        <Superficie className={estilos.encabezadoOrg} elevada>
          <div className={estilos.filaOrg}>
            <div className={estilos.infoOrg}>
              <div className={estilos.etiquetasOrg}>
                <Insignia tono="primario" icono={Building2}>
                  Espacio educativo
                </Insignia>
                <Insignia icono={Users}>{organizacion.cantidadMiembros} miembros</Insignia>
                <Insignia icono={Library}>{organizacion.cantidadCursos} cursos</Insignia>
              </div>
              <h1 className={estilos.titulo}>{organizacion.nombre}</h1>
              {organizacion.descripcion && (
                <p className={estilos.subtitulo}>{organizacion.descripcion}</p>
              )}
            </div>
            {configuracion.modoInstancia !== "organizacion" && (
              <Link
                to="/"
                className={estilos.enlaceVolverComunidad}
                onClick={() => seleccionarEspacio(null)}
              >
                <ArrowLeft className={estilos.iconoPequeno} aria-hidden="true" />
                Comunidad abierta
              </Link>
            )}
          </div>
        </Superficie>
      ) : slugOrganizacion && errorOrg ? (
        <EstadoVacio
          icono={Building2}
          titulo="No pudimos abrir este espacio."
          texto={errorOrg}
          accion={
            <Link to="/" onClick={() => seleccionarEspacio(null)}>
              Volver a la comunidad abierta
            </Link>
          }
        />
      ) : (
        <header className={estilos.encabezado}>
          <h1 className={estilos.titulo}>Explora cursos</h1>
          <p className={estilos.subtitulo}>
            Lecciones cortas e interactivas, abiertas y creadas por la comunidad.
          </p>
        </header>
      )}

      {!usuario && !slugOrganizacion && !hayFiltros && (
        <Superficie className={estilos.bienvenida}>
          <div className={estilos.textoBienvenida}>
            <Insignia tono="brote" icono={Sparkles}>
              Muestra abierta
            </Insignia>
            <p className={estilos.tituloBienvenida}>
              Prueba la primera lección de cualquier curso sin registrarte.
            </p>
            <p className={estilos.notaBienvenida}>
              Crea una cuenta gratuita cuando quieras guardar tu progreso, obtener insignias o
              publicar tus propios cursos y aulas.
            </p>
          </div>
          <div className={estilos.accionesBienvenida}>
            <Link to="/registro" className={estilos.ctaRegistro}>
              Crear cuenta gratis
              <ArrowRight className={estilos.iconoPequeno} aria-hidden="true" />
            </Link>
          </div>
        </Superficie>
      )}

      {usuario && !slugOrganizacion && !hayFiltros && empezados.length > 0 && (
        <div className={estilos.sigueAprendiendo}>
          <div className={estilos.cabeceraSeccion}>
            <h2 className={estilos.tituloSeccion}>Sigue aprendiendo</h2>
            <Link to="/panel" className={estilos.verTodo}>
              Ver todo en Mi aprendizaje
              <ArrowRight className={estilos.iconoPequeno} aria-hidden="true" />
            </Link>
          </div>
          <ul className={estilos.cuadriculaCompacta}>
            {empezados.map((curso) => (
              <li key={curso.id}>
                <TarjetaCurso
                  curso={curso}
                  avance={{
                    completadas: curso.leccionesCompletadas,
                    total: curso.cantidadLecciones,
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {(!slugOrganizacion || !errorOrg) && (
        <div className={estilos.barraFiltros}>
          <Buscador valor={texto} alCambiar={setTexto} buscando={buscando} />

          <div className={estilos.chips} role="group" aria-label="Filtrar por categoría">
            <button
              type="button"
              className={`${estilos.chip} ${!categoria ? estilos.chipActivo : ""}`}
              aria-pressed={!categoria}
              onClick={() => actualizarParametro("categoria", undefined)}
            >
              Todos
            </button>
            {CATEGORIAS_CURSO.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${estilos.chip} ${categoria === cat ? estilos.chipActivo : ""}`}
                aria-pressed={categoria === cat}
                onClick={() =>
                  actualizarParametro("categoria", categoria === cat ? undefined : cat)
                }
              >
                {NOMBRE_CATEGORIA[cat]}
              </button>
            ))}
          </div>

          <div className={estilos.controles}>
            <label className={estilos.controlSelect}>
              <span className={estilos.etiquetaControl}>Nivel</span>
              <select
                className={estilos.select}
                value={nivel ?? ""}
                onChange={(evento) =>
                  actualizarParametro("nivel", evento.target.value || undefined)
                }
              >
                <option value="">Todos</option>
                {NIVELES_CURSO.map((n) => (
                  <option key={n} value={n}>
                    {NOMBRE_NIVEL[n]}
                  </option>
                ))}
              </select>
            </label>

            <label className={estilos.controlSelect}>
              <span className={estilos.etiquetaControl}>Idioma</span>
              <select
                className={estilos.select}
                value={idioma ?? ""}
                onChange={(evento) =>
                  actualizarParametro("idioma", evento.target.value || undefined)
                }
              >
                <option value="">Todos</option>
                {IDIOMAS_CURSO.map((id) => (
                  <option key={id} value={id}>
                    {NOMBRE_IDIOMA[id]}
                  </option>
                ))}
              </select>
            </label>

            <label className={estilos.controlSelect}>
              <span className={estilos.etiquetaControl}>Orden</span>
              <select
                className={estilos.select}
                value={orden}
                onChange={(evento) =>
                  actualizarParametro(
                    "orden",
                    evento.target.value === "destacados" ? undefined : evento.target.value,
                  )
                }
              >
                {ORDENES_CATALOGO.map((ord) => (
                  <option key={ord} value={ord}>
                    {NOMBRE_ORDEN[ord]}
                  </option>
                ))}
              </select>
            </label>

            {usuario && (
              <label className={estilos.casillaCompletados}>
                <input
                  type="checkbox"
                  checked={ocultarCompletados}
                  onChange={(evento) =>
                    actualizarParametro(
                      "ocultarCompletados",
                      evento.target.checked ? "1" : undefined,
                    )
                  }
                />
                <span>Ocultar completados</span>
              </label>
            )}

            {hayFiltros && (
              <Boton variante="fantasma" tamano="chico" icono={X} alPulsar={limpiarFiltros}>
                Limpiar filtros
              </Boton>
            )}
          </div>
        </div>
      )}

      {(!slugOrganizacion || !errorOrg) && fase === "cargando" && <IndicadorCarga />}

      {(!slugOrganizacion || !errorOrg) && fase === "error" && mensajeError && (
        <ErrorCarga mensaje={mensajeError} alReintentar={reintentar} />
      )}

      {(!slugOrganizacion || !errorOrg) && catalogoVacio && (
        <EstadoVacio
          icono={Library}
          titulo={
            slugOrganizacion
              ? "Todavía no hay cursos publicados en este espacio."
              : "Todavía no hay cursos publicados."
          }
          texto={
            slugOrganizacion
              ? "Cuando los docentes publiquen cursos para esta organización, aparecerán aquí."
              : "Cuando la comunidad publique sus primeros cursos, aparecerán aquí."
          }
        />
      )}

      {(!slugOrganizacion || !errorOrg) && sinResultados && (
        <div className={buscando ? estilos.atenuado : ""}>
          <EstadoVacio
            icono={SearchX}
            titulo="No hay cursos con esos filtros."
            texto="Prueba con otra palabra o quita alguno de los filtros activos."
            accion={
              <Boton variante="secundario" alPulsar={limpiarFiltros}>
                Limpiar filtros
              </Boton>
            }
          />
        </div>
      )}

      {(!slugOrganizacion || !errorOrg) && fase === "listo" && cursos.length > 0 && (
        <>
          <ul className={`${estilos.cuadricula} ${buscando ? estilos.atenuado : ""}`}>
            {cursos.map((curso) => (
              <li key={curso.id}>
                <TarjetaCurso curso={curso} />
              </li>
            ))}
          </ul>
          {mensajeErrorMas ? (
            <ErrorCarga mensaje={mensajeErrorMas} alReintentar={reintentar} />
          ) : (
            siguiente && (
              <div className={estilos.verMas}>
                <Boton
                  variante="secundario"
                  iconoFinal={ChevronDown}
                  enviando={cargandoMas}
                  textoEnviando="Cargando..."
                  alPulsar={cargarMas}
                >
                  Ver más
                </Boton>
              </div>
            )
          )}
        </>
      )}
    </section>
  );
}
