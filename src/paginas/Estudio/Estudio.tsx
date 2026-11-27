import {
  ArrowUpRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  Flag,
  GraduationCap,
  Plus,
  SquarePen,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoArea from "../../componentes/CampoArea/CampoArea.tsx";
import CampoCasilla from "../../componentes/CampoCasilla/CampoCasilla.tsx";
import CampoSelector from "../../componentes/CampoSelector/CampoSelector.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import Insignia from "../../componentes/Insignia/Insignia.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import TarjetaCursoAutor from "../../componentes/TarjetaCursoAutor/TarjetaCursoAutor.tsx";
import TarjetaCursoRevision from "../../componentes/TarjetaCursoRevision/TarjetaCursoRevision.tsx";
import { useEspacio } from "../../hooks/useEspacio.ts";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { leerErrorDeCarga } from "../../servicios/cursos.ts";
import {
  cambiarEstadoReporte,
  importarCurso,
  traerCursosDelAutor,
  traerReportesDelAutor,
} from "../../servicios/editor.ts";
import { crearGrupo, traerAvanceGrupo, traerMisGrupos } from "../../servicios/grupos.ts";
import { traerCursosEnRevision } from "../../servicios/moderacion.ts";
import { crearOrganizacion, unirseAOrganizacion } from "../../servicios/organizaciones.ts";
import {
  LIMITES_GRUPO,
  LIMITES_ORGANIZACION,
  type AvanceAlumnoGrupo,
  type CursoExportado,
  type GrupoResumen,
  type ModoAccesoOrganizacion,
  type ReporteActividad,
} from "../../tipos/contrato.ts";
import { leerAvisoModeracion } from "../../utilidades/moderacion.ts";
import estilos from "./Estudio.module.css";

type Pestana = "cursos" | "aulas" | "reportes" | "organizaciones" | "revision";

const NOMBRE_ROL: Record<string, string> = {
  dueno: "Dueño",
  admin: "Admin",
  docente: "Docente",
  alumno: "Alumno",
};

const NOMBRE_MODO_ACCESO: Record<ModoAccesoOrganizacion, string> = {
  codigo: "Por código de acceso",
  abierto: "Abierto a cualquiera",
  dominio: "Por dominio de correo",
};

function generarSlug(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, LIMITES_ORGANIZACION.slugMax);
}

function escaparCsv(valor: string | number): string {
  const texto = String(valor);
  if (/[",\n]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

function descargarCsvAvance(grupo: GrupoResumen, alumnos: AvanceAlumnoGrupo[]) {
  const encabezados = [
    "Nombre",
    "Correo",
    "Lecciones completadas",
    "Total lecciones",
    "Avance (%)",
    "Aciertos",
    "Preguntas",
    "Último avance",
  ];
  const filas = alumnos.map((a) => {
    const porcentaje =
      a.totalLecciones > 0 ? Math.round((a.leccionesCompletadas / a.totalLecciones) * 100) : 0;
    return [
      escaparCsv(a.nombre),
      escaparCsv(a.correo),
      a.leccionesCompletadas,
      a.totalLecciones,
      porcentaje,
      a.aciertosTotales,
      a.preguntasTotales,
      escaparCsv(a.ultimoAvanceEn ?? ""),
    ].join(",");
  });
  const contenido = `\uFEFF${[encabezados.join(","), ...filas].join("\n")}`;
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `avance-${generarSlug(grupo.nombre) || grupo.codigo}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}

// Estudio del creador, docente y moderador (decisión 0020).
export default function Estudio() {
  const [parametros, setParametros] = useSearchParams();
  const { puedeModerar } = useEspacio();

  const cruda = parametros.get("pestana");
  const pestana: Pestana =
    cruda === "aulas" ||
    cruda === "reportes" ||
    cruda === "organizaciones" ||
    (cruda === "revision" && puedeModerar)
      ? cruda
      : "cursos";

  function irAPestana(nueva: Pestana) {
    setParametros(nueva === "cursos" ? {} : { pestana: nueva }, { replace: true });
  }

  return (
    <section className={estilos.estudio}>
      <header className={estilos.encabezado}>
        <h1 className={estilos.titulo}>Estudio</h1>
        <p className={estilos.subtitulo}>
          Crea cursos interactivos, organiza aulas con seguimiento y administra tus espacios
          educativos.
        </p>
      </header>

      <nav className={estilos.pestanas} aria-label="Secciones del Estudio">
        <button
          type="button"
          className={`${estilos.pestana} ${pestana === "cursos" ? estilos.pestanaActiva : ""}`}
          aria-current={pestana === "cursos" ? "page" : undefined}
          onClick={() => irAPestana("cursos")}
        >
          <BookOpen className={estilos.iconoPestana} aria-hidden="true" />
          Mis cursos
        </button>
        <button
          type="button"
          className={`${estilos.pestana} ${pestana === "aulas" ? estilos.pestanaActiva : ""}`}
          aria-current={pestana === "aulas" ? "page" : undefined}
          onClick={() => irAPestana("aulas")}
        >
          <GraduationCap className={estilos.iconoPestana} aria-hidden="true" />
          Aulas
        </button>
        <button
          type="button"
          className={`${estilos.pestana} ${pestana === "reportes" ? estilos.pestanaActiva : ""}`}
          aria-current={pestana === "reportes" ? "page" : undefined}
          onClick={() => irAPestana("reportes")}
        >
          <Flag className={estilos.iconoPestana} aria-hidden="true" />
          Reportes
        </button>
        <button
          type="button"
          className={`${estilos.pestana} ${pestana === "organizaciones" ? estilos.pestanaActiva : ""}`}
          aria-current={pestana === "organizaciones" ? "page" : undefined}
          onClick={() => irAPestana("organizaciones")}
        >
          <Building2 className={estilos.iconoPestana} aria-hidden="true" />
          Espacios y escuelas
        </button>
        {puedeModerar && (
          <button
            type="button"
            className={`${estilos.pestana} ${pestana === "revision" ? estilos.pestanaActiva : ""}`}
            aria-current={pestana === "revision" ? "page" : undefined}
            onClick={() => irAPestana("revision")}
          >
            <ClipboardCheck className={estilos.iconoPestana} aria-hidden="true" />
            Revisión
          </button>
        )}
      </nav>

      {pestana === "cursos" && <SeccionCursos />}
      {pestana === "aulas" && <SeccionAulas />}
      {pestana === "reportes" && <SeccionReportes />}
      {pestana === "organizaciones" && <SeccionOrganizaciones />}
      {pestana === "revision" && puedeModerar && <SeccionRevision />}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Pestaña 1: Mis cursos (+ Importar JSON)
// ---------------------------------------------------------------------------

function SeccionCursos() {
  const navegar = useNavigate();
  const { datos, cargando, error, recargar } = usePeticion(traerCursosDelAutor);
  const entradaArchivo = useRef<HTMLInputElement>(null);
  const [importando, setImportando] = useState(false);
  const [errorImportar, setErrorImportar] = useState<string | null>(null);

  async function alElegirArchivo(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;

    setImportando(true);
    setErrorImportar(null);
    try {
      const texto = await archivo.text();
      const json = JSON.parse(texto) as CursoExportado;
      const { curso } = await importarCurso(json);
      void navegar(`/editor/${curso.id}`);
    } catch (err) {
      setErrorImportar(
        err instanceof SyntaxError ? "El archivo no es un JSON válido." : leerErrorDeCarga(err),
      );
    } finally {
      setImportando(false);
    }
  }

  return (
    <div className={estilos.bloque}>
      <div className={estilos.cabeceraBloque}>
        <h2 className={estilos.tituloSeccion}>Cursos que creé</h2>
        <div className={estilos.accionesBloque}>
          <input
            ref={entradaArchivo}
            type="file"
            accept=".json,application/json"
            className="oculto"
            onChange={alElegirArchivo}
          />
          <Boton
            variante="secundario"
            tamano="chico"
            icono={Upload}
            enviando={importando}
            textoEnviando="Importando..."
            alPulsar={() => entradaArchivo.current?.click()}
          >
            Importar JSON
          </Boton>
          <Boton tamano="chico" icono={Plus} alPulsar={() => navegar("/editor/nuevo")}>
            Nuevo curso
          </Boton>
        </div>
      </div>

      {errorImportar && <Aviso tono="error" texto={errorImportar} />}

      {cargando ? (
        <IndicadorCarga />
      ) : error || !datos ? (
        <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />
      ) : datos.cursos.length === 0 ? (
        <EstadoVacio
          icono={SquarePen}
          titulo="Todavía no creas ningún curso."
          texto="Empieza uno desde cero, importa un archivo JSON o adapta cualquier curso abierto del catálogo."
          accion={
            <Boton icono={Plus} alPulsar={() => navegar("/editor/nuevo")}>
              Crear mi primer curso
            </Boton>
          }
        />
      ) : (
        <ul className={estilos.cuadricula}>
          {datos.cursos.map((curso) => (
            <li key={curso.id}>
              <TarjetaCursoAutor curso={curso} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pestaña 2: Aulas docentes + Avance + Exportar CSV
// ---------------------------------------------------------------------------

function SeccionAulas() {
  const { organizacionesDocente } = useEspacio();
  const { datos: datosGrupos, cargando, error, recargar } = usePeticion(traerMisGrupos);
  const { datos: datosCursos } = usePeticion(traerCursosDelAutor);

  const [nombre, setNombre] = useState("");
  const [idCurso, setIdCurso] = useState<string | null>(null);
  const [idCursoManual, setIdCursoManual] = useState("");
  const [idOrganizacion, setIdOrganizacion] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState<string | null>(null);
  const [okCrear, setOkCrear] = useState<string | null>(null);

  const [grupoAbierto, setGrupoAbierto] = useState<string | null>(null);
  const [avance, setAvance] = useState<AvanceAlumnoGrupo[] | null>(null);
  const [cargandoAvance, setCargandoAvance] = useState(false);
  const [errorAvance, setErrorAvance] = useState<string | null>(null);
  const [codigoCopiado, setCodigoCopiado] = useState<string | null>(null);

  const aulasDocente = (datosGrupos?.grupos ?? []).filter((g) => g.esDocente);
  const cursosPublicados = (datosCursos?.cursos ?? []).filter((c) => c.estado === "publicado");

  async function alCrearAula(evento: FormEvent) {
    evento.preventDefault();
    const nombreLimpio = nombre.trim();
    const cursoElegido = (idCurso ?? idCursoManual.trim()) || "";
    if (!nombreLimpio) {
      setErrorCrear("Escribe el nombre del aula o grupo.");
      return;
    }
    if (!cursoElegido) {
      setErrorCrear("Elige un curso publicado o pega su identificador.");
      return;
    }
    setCreando(true);
    setErrorCrear(null);
    setOkCrear(null);
    try {
      const { grupo } = await crearGrupo({
        nombre: nombreLimpio,
        idCurso: cursoElegido,
        idOrganizacion,
      });
      setNombre("");
      setIdCurso(null);
      setIdCursoManual("");
      setOkCrear(`Aula «${grupo.nombre}» creada. Código para tus alumnos: ${grupo.codigo}`);
      recargar();
    } catch (err) {
      setErrorCrear(leerErrorDeCarga(err));
    } finally {
      setCreando(false);
    }
  }

  async function verAvance(grupo: GrupoResumen) {
    if (grupoAbierto === grupo.id) {
      setGrupoAbierto(null);
      setAvance(null);
      return;
    }
    setGrupoAbierto(grupo.id);
    setAvance(null);
    setErrorAvance(null);
    setCargandoAvance(true);
    try {
      const res = await traerAvanceGrupo(grupo.id);
      setAvance(res.alumnos);
    } catch (err) {
      setErrorAvance(leerErrorDeCarga(err));
    } finally {
      setCargandoAvance(false);
    }
  }

  async function copiarCodigo(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      setCodigoCopiado(codigo);
      setTimeout(() => setCodigoCopiado((c) => (c === codigo ? null : c)), 2500);
    } catch {
      // sin permiso de portapapeles
    }
  }

  return (
    <div className={estilos.bloque}>
      <Superficie className={estilos.panelFormulario}>
        <h2 className={estilos.tituloTarjeta}>Crear un aula o grupo</h2>
        <p className={estilos.descripcionTarjeta}>
          Genera un código de clase para cualquier curso publicado y sigue el progreso de tus
          alumnos en tiempo real.
        </p>
        <form className={estilos.formulario} onSubmit={alCrearAula} noValidate>
          <div className={estilos.gridDos}>
            <CampoTexto
              id="nombre-aula"
              etiqueta="Nombre del aula"
              valor={nombre}
              alCambiar={setNombre}
              maxLongitud={LIMITES_GRUPO.nombreMax}
              ayuda="Por ejemplo: Grupo 3B – Programación"
              deshabilitado={creando}
            />
            {cursosPublicados.length > 0 ? (
              <CampoSelector
                id="curso-aula"
                etiqueta="Curso asignado"
                valor={idCurso}
                textoVacio="Selecciona un curso publicado"
                opciones={cursosPublicados.map((c) => ({ valor: c.id, texto: c.titulo }))}
                alCambiar={setIdCurso}
                deshabilitado={creando}
              />
            ) : (
              <CampoTexto
                id="id-curso-aula"
                etiqueta="ID de un curso publicado"
                valor={idCursoManual}
                alCambiar={setIdCursoManual}
                ayuda="Puedes usar cualquier curso publicado (también del catálogo comunitario)."
                deshabilitado={creando}
              />
            )}
          </div>
          {cursosPublicados.length > 0 && !idCurso && (
            <CampoTexto
              id="id-curso-aula-otro"
              etiqueta="O pega el ID de otro curso publicado (opcional)"
              valor={idCursoManual}
              alCambiar={setIdCursoManual}
              deshabilitado={creando}
            />
          )}
          {organizacionesDocente.length > 0 && (
            <CampoSelector
              id="org-aula"
              etiqueta="Organización (opcional)"
              valor={idOrganizacion}
              textoVacio="Sin organización (aula independiente)"
              opciones={organizacionesDocente.map((o) => ({ valor: o.id, texto: o.nombre }))}
              alCambiar={setIdOrganizacion}
              deshabilitado={creando}
            />
          )}
          {errorCrear && <Aviso tono="error" texto={errorCrear} />}
          {okCrear && <Aviso tono="exito" texto={okCrear} />}
          <div>
            <Boton tipo="submit" icono={Plus} enviando={creando} textoEnviando="Creando aula...">
              Crear aula
            </Boton>
          </div>
        </form>
      </Superficie>

      <h2 className={estilos.tituloSeccion}>Mis aulas como docente</h2>
      {cargando ? (
        <IndicadorCarga />
      ) : error ? (
        <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />
      ) : aulasDocente.length === 0 ? (
        <EstadoVacio
          icono={GraduationCap}
          titulo="Todavía no creas ningún aula."
          texto="Crea un aula arriba para obtener un código de acceso y ver el avance de tu grupo."
        />
      ) : (
        <div className={estilos.listaFilas}>
          {aulasDocente.map((grupo) => {
            const abierto = grupoAbierto === grupo.id;
            return (
              <Superficie key={grupo.id} className={estilos.tarjetaAncha}>
                <div className={estilos.filaEncabezado}>
                  <div>
                    <h3 className={estilos.tituloTarjeta}>{grupo.nombre}</h3>
                    <p className={estilos.metaSecundaria}>
                      Curso: <Link to={`/cursos/${grupo.idCurso}`}>{grupo.tituloCurso}</Link>
                      {grupo.organizacion ? ` · ${grupo.organizacion.nombre}` : ""}
                    </p>
                  </div>
                  <div className={estilos.accionesFila}>
                    <Insignia icono={Users}>{grupo.cantidadAlumnos} alumnos</Insignia>
                    <Boton
                      variante="secundario"
                      tamano="chico"
                      icono={codigoCopiado === grupo.codigo ? Check : Copy}
                      alPulsar={() => copiarCodigo(grupo.codigo)}
                    >
                      {codigoCopiado === grupo.codigo
                        ? "Código copiado"
                        : `Código: ${grupo.codigo}`}
                    </Boton>
                    <Boton
                      variante={abierto ? "primario" : "secundario"}
                      tamano="chico"
                      alPulsar={() => verAvance(grupo)}
                    >
                      {abierto ? "Ocultar avance" : "Ver avance"}
                    </Boton>
                  </div>
                </div>

                {abierto && (
                  <div className={estilos.panelAvance}>
                    {cargandoAvance ? (
                      <IndicadorCarga />
                    ) : errorAvance ? (
                      <Aviso tono="error" texto={errorAvance} />
                    ) : !avance || avance.length === 0 ? (
                      <p className={estilos.metaSecundaria}>
                        Todavía no se ha unido ningún alumno a esta aula. Comparte el código{" "}
                        <strong>{grupo.codigo}</strong>.
                      </p>
                    ) : (
                      <>
                        <div className={estilos.barraTabla}>
                          <span className={estilos.metaSecundaria}>
                            {avance.length}{" "}
                            {avance.length === 1 ? "alumno inscrito" : "alumnos inscritos"}
                          </span>
                          <Boton
                            variante="secundario"
                            tamano="chico"
                            icono={Download}
                            alPulsar={() => descargarCsvAvance(grupo, avance)}
                          >
                            Exportar CSV
                          </Boton>
                        </div>
                        <div className={estilos.tablaContenedor}>
                          <table className={estilos.tabla}>
                            <thead>
                              <tr>
                                <th>Alumno</th>
                                <th>Correo</th>
                                <th>Lecciones</th>
                                <th>Aciertos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {avance.map((alumno) => {
                                const pct =
                                  alumno.totalLecciones > 0
                                    ? Math.round(
                                        (alumno.leccionesCompletadas / alumno.totalLecciones) * 100,
                                      )
                                    : 0;
                                return (
                                  <tr key={alumno.idUsuario}>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.correo}</td>
                                    <td>
                                      {alumno.leccionesCompletadas}/{alumno.totalLecciones} ({pct}%)
                                    </td>
                                    <td>
                                      {alumno.preguntasTotales > 0
                                        ? `${alumno.aciertosTotales}/${alumno.preguntasTotales}`
                                        : "—"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Superficie>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pestaña 3: Reportes de errores enviados por alumnos
// ---------------------------------------------------------------------------

function SeccionReportes() {
  const { datos, cargando, error, recargar } = usePeticion(traerReportesDelAutor);
  const [actualizando, setActualizando] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  async function alternarEstado(reporte: ReporteActividad) {
    setActualizando(reporte.id);
    setErrorAccion(null);
    try {
      await cambiarEstadoReporte(reporte.id, !reporte.resuelto);
      recargar();
    } catch (err) {
      setErrorAccion(leerErrorDeCarga(err));
    } finally {
      setActualizando(null);
    }
  }

  return (
    <div className={estilos.bloque}>
      <h2 className={estilos.tituloSeccion}>Reportes de alumnos</h2>
      {errorAccion && <Aviso tono="error" texto={errorAccion} />}
      {cargando ? (
        <IndicadorCarga />
      ) : error || !datos ? (
        <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />
      ) : datos.reportes.length === 0 ? (
        <EstadoVacio
          icono={Flag}
          titulo="No tienes reportes pendientes."
          texto="Cuando un alumno reporte un error en una actividad de tus cursos, aparecerá aquí."
        />
      ) : (
        <div className={estilos.listaFilas}>
          {datos.reportes.map((reporte) => (
            <Superficie key={reporte.id} className={estilos.tarjetaAncha}>
              <div className={estilos.filaEncabezado}>
                <div>
                  <div className={estilos.insigniasInline}>
                    <Insignia tono={reporte.resuelto ? "brote" : "acento"}>
                      {reporte.resuelto ? "Resuelto" : "Pendiente"}
                    </Insignia>
                    <Insignia>Actividad #{reporte.indiceActividad + 1}</Insignia>
                  </div>
                  <h3 className={estilos.tituloTarjeta}>
                    {reporte.tituloCurso} — {reporte.tituloLeccion}
                  </h3>
                  <p className={estilos.metaSecundaria}>
                    Reportado por {reporte.nombreAutorReporte}
                  </p>
                </div>
                <div className={estilos.accionesFila}>
                  <Link
                    to={`/editor/${reporte.idCurso}/lecciones/${reporte.idLeccion}`}
                    className={estilos.enlaceAccion}
                  >
                    Abrir lección
                    <ArrowUpRight className={estilos.iconoInline} aria-hidden="true" />
                  </Link>
                  <Boton
                    variante="secundario"
                    tamano="chico"
                    icono={CheckCircle2}
                    enviando={actualizando === reporte.id}
                    alPulsar={() => alternarEstado(reporte)}
                  >
                    {reporte.resuelto ? "Reabrir" : "Marcar resuelto"}
                  </Boton>
                </div>
              </div>
              <p className={estilos.mensajeReporte}>{reporte.mensaje}</p>
            </Superficie>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pestaña 4: Organizaciones / Espacios educativos (silo opcional)
// ---------------------------------------------------------------------------

function SeccionOrganizaciones() {
  const { organizaciones, cargandoOrganizaciones, recargarOrganizaciones } = useEspacio();

  const [codigoUnion, setCodigoUnion] = useState("");
  const [uniendose, setUniendose] = useState(false);
  const [errorUnion, setErrorUnion] = useState<string | null>(null);
  const [okUnion, setOkUnion] = useState<string | null>(null);

  const [nombreOrg, setNombreOrg] = useState("");
  const [slugOrg, setSlugOrg] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [descripcionOrg, setDescripcionOrg] = useState("");
  const [modoAcceso, setModoAcceso] = useState<ModoAccesoOrganizacion>("codigo");
  const [dominiosTexto, setDominiosTexto] = useState("");
  const [requiereRevision, setRequiereRevision] = useState(false);
  const [creandoOrg, setCreandoOrg] = useState(false);
  const [errorCrearOrg, setErrorCrearOrg] = useState<string | null>(null);
  const [okCrearOrg, setOkCrearOrg] = useState<string | null>(null);
  const [codigoCopiado, setCodigoCopiado] = useState<string | null>(null);

  function alCambiarNombreOrg(valor: string) {
    setNombreOrg(valor);
    if (!slugManual) setSlugOrg(generarSlug(valor));
  }

  async function alUnirseOrg(evento: FormEvent) {
    evento.preventDefault();
    const limpio = codigoUnion.trim().toUpperCase();
    if (!limpio) {
      setErrorUnion("Escribe el código de invitación de la organización.");
      return;
    }
    setUniendose(true);
    setErrorUnion(null);
    setOkUnion(null);
    try {
      const { organizacion } = await unirseAOrganizacion({ codigo: limpio });
      setCodigoUnion("");
      setOkUnion(`Te uniste a «${organizacion.nombre}».`);
      await recargarOrganizaciones();
    } catch (err) {
      setErrorUnion(leerErrorDeCarga(err));
    } finally {
      setUniendose(false);
    }
  }

  async function alCrearOrg(evento: FormEvent) {
    evento.preventDefault();
    if (!nombreOrg.trim() || !slugOrg.trim()) {
      setErrorCrearOrg("Escribe el nombre y el identificador (slug) del espacio.");
      return;
    }
    setCreandoOrg(true);
    setErrorCrearOrg(null);
    setOkCrearOrg(null);
    try {
      const dominios = dominiosTexto
        .split(",")
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);
      const { organizacion } = await crearOrganizacion({
        nombre: nombreOrg.trim(),
        slug: slugOrg.trim().toLowerCase(),
        descripcion: descripcionOrg.trim(),
        modoAcceso,
        dominiosPermitidos: dominios,
        requiereRevision,
      });
      setNombreOrg("");
      setSlugOrg("");
      setSlugManual(false);
      setDescripcionOrg("");
      setDominiosTexto("");
      setOkCrearOrg(`Espacio «${organizacion.nombre}» creado. URL: /o/${organizacion.slug}`);
      await recargarOrganizaciones();
    } catch (err) {
      setErrorCrearOrg(leerErrorDeCarga(err));
    } finally {
      setCreandoOrg(false);
    }
  }

  async function copiarCodigo(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo);
      setCodigoCopiado(codigo);
      setTimeout(() => setCodigoCopiado((c) => (c === codigo ? null : c)), 2500);
    } catch {
      // sin permiso de portapapeles
    }
  }

  return (
    <div className={estilos.bloque}>
      <div className={estilos.gridDos}>
        <Superficie className={estilos.panelFormulario}>
          <h2 className={estilos.tituloTarjeta}>Unirme a un espacio</h2>
          <p className={estilos.descripcionTarjeta}>
            Si tu universidad, escuela o equipo usa Brote, ingresa el código de acceso para ver su
            catálogo propio.
          </p>
          <form className={estilos.formulario} onSubmit={alUnirseOrg} noValidate>
            <CampoTexto
              id="codigo-org"
              etiqueta="Código de organización"
              valor={codigoUnion}
              alCambiar={setCodigoUnion}
              maxLongitud={LIMITES_ORGANIZACION.codigoMax}
              deshabilitado={uniendose}
            />
            {errorUnion && <Aviso tono="error" texto={errorUnion} />}
            {okUnion && <Aviso tono="exito" texto={okUnion} />}
            <div>
              <Boton tipo="submit" enviando={uniendose} textoEnviando="Uniéndome...">
                Unirme al espacio
              </Boton>
            </div>
          </form>
        </Superficie>

        <Superficie className={estilos.panelFormulario}>
          <h2 className={estilos.tituloTarjeta}>Crear un espacio educativo</h2>
          <p className={estilos.descripcionTarjeta}>
            Crea un espacio opcional para tu escuela, facultad o equipo, con catálogo privado o
            compartido con la comunidad.
          </p>
          <form className={estilos.formulario} onSubmit={alCrearOrg} noValidate>
            <CampoTexto
              id="nombre-org"
              etiqueta="Nombre de la escuela u organización"
              valor={nombreOrg}
              alCambiar={alCambiarNombreOrg}
              maxLongitud={LIMITES_ORGANIZACION.nombreMax}
              deshabilitado={creandoOrg}
            />
            <CampoTexto
              id="slug-org"
              etiqueta="Identificador en la URL (/o/...)"
              valor={slugOrg}
              alCambiar={(v) => {
                setSlugManual(true);
                setSlugOrg(v);
              }}
              maxLongitud={LIMITES_ORGANIZACION.slugMax}
              ayuda="Solo minúsculas, números y guiones. Ej: facultad-ingenieria"
              deshabilitado={creandoOrg}
            />
            <CampoArea
              id="desc-org"
              etiqueta="Descripción (opcional)"
              valor={descripcionOrg}
              alCambiar={setDescripcionOrg}
              maxLongitud={LIMITES_ORGANIZACION.descripcionMax}
              filas={2}
              deshabilitado={creandoOrg}
            />
            <CampoSelector
              id="modo-acceso-org"
              etiqueta="Cómo se unen los miembros"
              valor={modoAcceso}
              opciones={(["codigo", "abierto", "dominio"] as ModoAccesoOrganizacion[]).map((m) => ({
                valor: m,
                texto: NOMBRE_MODO_ACCESO[m],
              }))}
              alCambiar={(v) => setModoAcceso((v as ModoAccesoOrganizacion) || "codigo")}
              deshabilitado={creandoOrg}
            />
            {modoAcceso === "dominio" && (
              <CampoTexto
                id="dominios-org"
                etiqueta="Dominios de correo permitidos"
                valor={dominiosTexto}
                alCambiar={setDominiosTexto}
                ayuda="Separados por coma. Ej: universidad.edu, alumnos.universidad.edu"
                deshabilitado={creandoOrg}
              />
            )}
            <CampoCasilla
              id="revision-org"
              etiqueta="Revisar cursos antes de publicarlos en este espacio"
              ayuda="Si lo dejas desactivado, tus docentes podrán publicar directamente en el espacio."
              valor={requiereRevision}
              alCambiar={setRequiereRevision}
              deshabilitado={creandoOrg}
            />
            {errorCrearOrg && <Aviso tono="error" texto={errorCrearOrg} />}
            {okCrearOrg && <Aviso tono="exito" texto={okCrearOrg} />}
            <div>
              <Boton
                tipo="submit"
                icono={Building2}
                enviando={creandoOrg}
                textoEnviando="Creando..."
              >
                Crear espacio
              </Boton>
            </div>
          </form>
        </Superficie>
      </div>

      <h2 className={estilos.tituloSeccion}>Mis espacios</h2>
      {cargandoOrganizaciones ? (
        <IndicadorCarga />
      ) : organizaciones.length === 0 ? (
        <EstadoVacio
          icono={Building2}
          titulo="Todavía no perteneces a ningún espacio."
          texto="Los espacios son totalmente opcionales. Puedes usar Brote en la comunidad abierta o crear/unirte a uno arriba."
        />
      ) : (
        <div className={estilos.listaFilas}>
          {organizaciones.map((org) => (
            <Superficie key={org.id} className={estilos.tarjetaAncha}>
              <div className={estilos.filaEncabezado}>
                <div>
                  <div className={estilos.insigniasInline}>
                    <Insignia tono="primario">{NOMBRE_ROL[org.rol] ?? org.rol}</Insignia>
                    <Insignia icono={Users}>{org.cantidadMiembros} miembros</Insignia>
                    <Insignia icono={BookOpen}>{org.cantidadCursos} cursos</Insignia>
                  </div>
                  <h3 className={estilos.tituloTarjeta}>{org.nombre}</h3>
                  {org.descripcion && <p className={estilos.metaSecundaria}>{org.descripcion}</p>}
                </div>
                <div className={estilos.accionesFila}>
                  {org.codigoAcceso && (
                    <Boton
                      variante="secundario"
                      tamano="chico"
                      icono={codigoCopiado === org.codigoAcceso ? Check : Copy}
                      alPulsar={() => copiarCodigo(org.codigoAcceso ?? "")}
                    >
                      {codigoCopiado === org.codigoAcceso
                        ? "Código copiado"
                        : `Código: ${org.codigoAcceso}`}
                    </Boton>
                  )}
                  <Link to={`/o/${org.slug}`} className={estilos.enlaceAccion}>
                    Abrir catálogo
                    <ArrowUpRight className={estilos.iconoInline} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Superficie>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pestaña 5: Cola de revisión (global o delegada por organización)
// ---------------------------------------------------------------------------

function SeccionRevision() {
  const { datos, cargando, error, recargar } = usePeticion(traerCursosEnRevision);
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const [aviso] = useState(() => leerAvisoModeracion(ubicacion.state));

  useEffect(() => {
    if (leerAvisoModeracion(ubicacion.state)) {
      navegar(`${ubicacion.pathname}${ubicacion.search}`, { replace: true, state: null });
    }
  }, [ubicacion, navegar]);

  return (
    <div className={estilos.bloque}>
      <h2 className={estilos.tituloSeccion}>Cursos esperando revisión</h2>
      {aviso && <Aviso texto={aviso.texto} tono={aviso.tono} />}
      {cargando ? (
        <IndicadorCarga />
      ) : error || !datos ? (
        <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />
      ) : datos.cursos.length === 0 ? (
        <EstadoVacio
          icono={ClipboardCheck}
          titulo="No hay cursos en revisión."
          texto="Cuando un autor envíe un curso que requiera revisión, aparecerá aquí."
        />
      ) : (
        <ul className={estilos.cuadricula}>
          {datos.cursos.map((curso) => (
            <li key={curso.id}>
              <TarjetaCursoRevision curso={curso} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
