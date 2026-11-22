import { CircleSlash, NotebookPen } from "lucide-react";
import { useCallback, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import EncabezadoLeccion from "../../actividades/ReproductorLeccion/EncabezadoLeccion.tsx";
import { actividadesConocidas } from "../../actividades/registro.ts";
import Boton from "../../componentes/Boton/Boton.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import ProbarLeccion from "../../editor/ProbarLeccion/ProbarLeccion.tsx";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { leerErrorDeCarga } from "../../servicios/cursos.ts";
import {
  leerErrorDeModeracion,
  traerCursoEnModeracion,
  yaNoEnRevision,
} from "../../servicios/moderacion.ts";
import { MENSAJES_LECCION } from "../../tipos/contrato.ts";
import { vieneDelCurso } from "../../utilidades/navegacion.ts";
import estilos from "../Leccion/Leccion.module.css";

// Probar una lección de un curso en revisión (decisión 0018), a pantalla completa como
// cursarla, pero con ProbarLeccion del editor: corre en memoria y no registra progreso.
export default function ProbarLeccionRevision() {
  const { idCurso = "", idLeccion = "" } = useParams();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const { datos, cargando, error, recargar } = usePeticion(
    useCallback(() => traerCursoEnModeracion(idCurso), [idCurso]),
  );

  // como en Leccion: vuelve atrás si viene de la revisión; si no, la reemplaza
  function salir() {
    if (vieneDelCurso(ubicacion.state)) navegar(-1);
    else navegar(`/moderacion/${idCurso}`, { replace: true });
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

  const leccion = datos?.curso.lecciones.find(({ id }) => id === idLeccion);

  if (yaNoEnRevision(error) || (datos && !leccion)) {
    const titulo = error
      ? leerErrorDeModeracion(error, MENSAJES_LECCION.leccionNoDisponible)
      : MENSAJES_LECCION.leccionNoDisponible;
    return conEncabezado(
      <EstadoVacio
        icono={CircleSlash}
        titulo={titulo}
        anunciar
        accion={<Link to="/panel">Volver a Mi panel</Link>}
      />,
    );
  }

  if (error || !datos || !leccion) {
    return conEncabezado(<ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />);
  }

  const actividades = actividadesConocidas(leccion.actividades);
  if (actividades.length === 0) {
    return conEncabezado(
      <EstadoVacio
        icono={NotebookPen}
        titulo="Esta lección no tiene actividades."
        accion={
          <Boton variante="secundario" alPulsar={salir}>
            Volver a la revisión
          </Boton>
        }
      />,
    );
  }

  // con key: si cambia la lección en la dirección, empieza de cero
  return (
    <ProbarLeccion
      key={leccion.id}
      titulo={leccion.titulo}
      idioma={leccion.idioma}
      actividades={actividades}
      alSalir={salir}
      textoVolver="Volver a la revisión"
    />
  );
}
