import { ArrowLeft, CircleSlash } from "lucide-react";
import { useCallback, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Boton from "../../componentes/Boton/Boton.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { esNoDisponible, leerErrorDeCarga } from "../../servicios/cursos.ts";
import { esCursoNoEditable, traerLeccionEnEditor } from "../../servicios/editor.ts";
import EditorLeccion from "./EditorLeccion.tsx";
import estilos from "./LienzoLeccion.module.css";

// Lienzo de la lección (spec F05; docs/diseno.md, sección 5), a pantalla completa y
// fuera del marco común, como el reproductor. Aquí solo se carga: lo demás necesita
// la lección y va en EditorLeccion.
export default function LienzoLeccion() {
  const { idCurso = "", idLeccion = "" } = useParams();
  const navegar = useNavigate();
  const { datos, cargando, error, recargar } = usePeticion(
    useCallback(() => traerLeccionEnEditor(idCurso, idLeccion), [idCurso, idLeccion]),
  );

  function conVolver(contenido: ReactNode) {
    return (
      <div className={estilos.pantalla}>
        <div className={estilos.volver}>
          <Boton
            variante="enlace"
            tamano="chico"
            icono={ArrowLeft}
            alPulsar={() => navegar(`/editor/${idCurso}`)}
          >
            Volver al curso
          </Boton>
        </div>
        <div className={estilos.estado}>{contenido}</div>
      </div>
    );
  }

  if (cargando) return conVolver(<IndicadorCarga />);

  if (esNoDisponible(error)) {
    return (
      <div className={estilos.pantalla}>
        <div className={estilos.estado}>
          <EstadoVacio
            icono={CircleSlash}
            titulo={leerErrorDeCarga(error)}
            anunciar
            accion={<Link to="/panel">Ir a Mi panel</Link>}
          />
        </div>
      </div>
    );
  }

  if (esCursoNoEditable(error)) {
    return (
      <div className={estilos.pantalla}>
        <div className={estilos.estado}>
          <EstadoVacio
            icono={CircleSlash}
            titulo={leerErrorDeCarga(error)}
            anunciar
            accion={<Link to={`/editor/${idCurso}`}>Volver al curso</Link>}
          />
        </div>
      </div>
    );
  }

  if (error || !datos) {
    return conVolver(<ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />);
  }

  // con key: otra lección en la dirección empieza de cero
  return <EditorLeccion key={datos.leccion.id} idCurso={idCurso} leccion={datos.leccion} />;
}
