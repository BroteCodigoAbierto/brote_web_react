import { ArrowLeft, CircleSlash, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import Dialogo from "../../componentes/Dialogo/Dialogo.tsx";
import ErrorCarga from "../../componentes/ErrorCarga/ErrorCarga.tsx";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";
import IndicadorCarga from "../../componentes/IndicadorCarga/IndicadorCarga.tsx";
import { usePeticion } from "../../hooks/usePeticion.ts";
import { useSalirSinGuardar } from "../../hooks/useSalirSinGuardar.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import { esNoDisponible, leerErrorDeCarga } from "../../servicios/cursos.ts";
import {
  borrarCurso,
  esCursoNoEditable,
  esSesionPerdida,
  leerErrorDeAccion,
  traerCursoEnEditor,
} from "../../servicios/editor.ts";
import { MENSAJES_EDITOR, type CursoEnEditor } from "../../tipos/contrato.ts";
import { guardarCopia, tomarCopia } from "../../utilidades/copiaEditor.ts";
import DatosCurso from "./DatosCurso.tsx";
import ListaLecciones from "./ListaLecciones.tsx";
import estilos from "./MapaCurso.module.css";

// Mapa del curso (spec F05; docs/diseno.md, sección 5): sus datos y sus lecciones.
export default function MapaCurso() {
  const { idCurso = "" } = useParams();
  const { datos, cargando, error, recargar } = usePeticion(
    useCallback(() => traerCursoEnEditor(idCurso), [idCurso]),
  );

  if (cargando) return <IndicadorCarga />;

  if (esNoDisponible(error)) {
    return (
      <EstadoVacio
        icono={CircleSlash}
        titulo={leerErrorDeCarga(error)}
        anunciar
        accion={<Link to="/panel">Ir a Mi panel</Link>}
      />
    );
  }

  if (esCursoNoEditable(error)) {
    return (
      <EstadoVacio
        icono={CircleSlash}
        titulo={MENSAJES_EDITOR.cursoPublicado}
        anunciar
        accion={<Link to={`/cursos/${idCurso}`}>Ver curso</Link>}
      />
    );
  }

  if (error || !datos) {
    return <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />;
  }

  // con key: otro curso en la dirección empieza de cero
  return <ContenidoMapa key={datos.curso.id} curso={datos.curso} />;
}

// Lo que se recupera si la sesión expira en esta pantalla (research de F05, punto 15).
type CopiaMapa = {
  titulo: string;
  descripcion: string;
  nuevaLeccion: string;
};

type PropsContenidoMapa = {
  curso: CursoEnEditor;
};

// El formulario y la lista comparten pantalla: lo capturado y `ocupado` viven aquí,
// porque un 401 o un guardado en uno afecta al otro.
function ContenidoMapa({ curso }: PropsContenidoMapa) {
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const idUsuario = useSesion().usuario?.id ?? "";
  // una sola vez: tomarCopia la borra
  const [copia] = useState(() => tomarCopia<CopiaMapa>(idUsuario, pathname));
  const capturado = useRef<CopiaMapa>(
    copia ?? { titulo: curso.titulo, descripcion: curso.descripcion, nuevaLeccion: "" },
  );
  const [hayCambios, setHayCambios] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const { propsDialogo, salirSinPreguntar } = useSalirSinGuardar(hayCambios);

  const capturarDatos = useCallback(
    ({ titulo, descripcion }: Pick<CopiaMapa, "titulo" | "descripcion">) => {
      capturado.current = { ...capturado.current, titulo, descripcion };
    },
    [],
  );

  function alSesionPerdida() {
    guardarCopia({ idUsuario, ruta: pathname, datos: capturado.current });
  }

  async function eliminar() {
    setEliminando(true);
    setOcupado(true);
    setAviso(null);
    try {
      await borrarCurso(curso.id);
      salirSinPreguntar();
      navegar("/panel");
    } catch (error) {
      setConfirmando(false);
      if (esSesionPerdida(error)) alSesionPerdida();
      else setAviso(leerErrorDeAccion(error, "No se pudo eliminar el curso."));
    } finally {
      setEliminando(false);
      setOcupado(false);
    }
  }

  return (
    <div className={estilos.mapa}>
      <div className={estilos.volver}>
        <Boton
          variante="enlace"
          tamano="chico"
          icono={ArrowLeft}
          alPulsar={() => navegar("/panel")}
        >
          Mi panel
        </Boton>
      </div>
      <DatosCurso
        curso={curso}
        inicial={copia}
        ocupado={ocupado}
        alCambiarOcupado={setOcupado}
        alCambiarPendientes={setHayCambios}
        alCambiarCapturado={capturarDatos}
        alSesionPerdida={alSesionPerdida}
      />
      <ListaLecciones
        idCurso={curso.id}
        leccionesIniciales={curso.lecciones}
        tituloInicial={copia?.nuevaLeccion ?? ""}
        ocupado={ocupado}
        alCambiarOcupado={setOcupado}
        alCambiarCapturado={(nuevaLeccion) => {
          capturado.current = { ...capturado.current, nuevaLeccion };
        }}
        alSesionPerdida={alSesionPerdida}
      />
      {aviso && <Aviso texto={aviso} />}
      <div>
        <Boton
          variante="peligro"
          icono={Trash2}
          deshabilitado={ocupado}
          alPulsar={() => setConfirmando(true)}
        >
          Eliminar curso
        </Boton>
      </div>
      <Dialogo
        abierto={confirmando}
        titulo="¿Eliminar este curso?"
        texto="Se borrará con todas sus lecciones. No se puede deshacer."
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        enviando={eliminando}
        alConfirmar={eliminar}
        alCancelar={() => setConfirmando(false)}
      />
      <Dialogo {...propsDialogo} />
    </div>
  );
}
