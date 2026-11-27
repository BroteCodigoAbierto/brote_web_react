import { ArrowLeft, BookOpen, Building2, Calendar, CircleSlash, Library } from "lucide-react";
import { useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Boton from "../../componentes/Boton/Boton.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import Insignia from "../../componentes/Insignia/Insignia.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import TarjetaCurso from "../../componentes/TarjetaCurso/TarjetaCurso.tsx";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { traerPerfilAutor } from "../../servicios/autores.ts";
import { esNoDisponible, leerErrorDeCarga } from "../../servicios/cursos.ts";
import { inicialPortada } from "../../utilidades/cursos.ts";
import estilos from "./PerfilAutor.module.css";

function formatearFechaIngreso(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es", { month: "long", year: "numeric" }).format(new Date(iso));
  } catch {
    return "";
  }
}

// Perfil público de un autor (decisión 0020): sus organizaciones visibles y cursos publicados.
export default function PerfilAutor() {
  const { idAutor = "" } = useParams();
  const navegar = useNavigate();

  const { datos, cargando, error, recargar } = usePeticion(
    useCallback(() => traerPerfilAutor(idAutor), [idAutor]),
  );

  if (cargando) return <IndicadorCarga />;

  if (esNoDisponible(error)) {
    return (
      <EstadoVacio
        icono={CircleSlash}
        titulo="Este perfil no existe o ya no está disponible."
        anunciar
        accion={<Link to="/">Explorar cursos</Link>}
      />
    );
  }

  if (error || !datos) {
    return <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />;
  }

  const { autor } = datos;
  const fecha = formatearFechaIngreso(autor.creadoEn);

  return (
    <section className={estilos.pagina}>
      <div className={estilos.volver}>
        <Boton variante="enlace" tamano="chico" icono={ArrowLeft} alPulsar={() => navegar(-1)}>
          Volver
        </Boton>
      </div>

      <Superficie className={estilos.encabezado} elevada>
        <div className={estilos.avatar} aria-hidden="true">
          {inicialPortada(autor.nombre)}
        </div>
        <div className={estilos.datos}>
          <h1 className={estilos.nombre}>{autor.nombre}</h1>
          <div className={estilos.meta}>
            {fecha && <Insignia icono={Calendar}>En Brote desde {fecha}</Insignia>}
            <Insignia tono="primario" icono={BookOpen}>
              {autor.cursos.length === 1
                ? "1 curso publicado"
                : `${autor.cursos.length} cursos publicados`}
            </Insignia>
          </div>
          {autor.organizaciones.length > 0 && (
            <div className={estilos.organizaciones}>
              {autor.organizaciones.map((org) => (
                <Link key={org.id} to={`/o/${org.slug}`} className={estilos.enlaceOrg}>
                  <Building2 className={estilos.iconoOrg} aria-hidden="true" />
                  {org.nombre}
                </Link>
              ))}
            </div>
          )}
        </div>
      </Superficie>

      <div className={estilos.seccion}>
        <h2 className={estilos.tituloSeccion}>Cursos publicados</h2>
        {autor.cursos.length === 0 ? (
          <EstadoVacio
            icono={Library}
            titulo="Todavía no tiene cursos públicos."
            texto="Cuando publique cursos abiertos a la comunidad, aparecerán aquí."
          />
        ) : (
          <ul className={estilos.cuadricula}>
            {autor.cursos.map((curso) => (
              <li key={curso.id}>
                <TarjetaCurso curso={curso} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
