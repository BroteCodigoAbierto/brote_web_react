import { ArrowLeft, CircleSlash, MessageSquareWarning, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
  esSesionPerdida,
  leerErrorDeAccion,
  traerCursoEnEditor,
} from "../../servicios/editor.ts";
import type { CursoEnEditor, IdiomaCurso } from "../../tipos/contrato.ts";
import { guardarCopia, tomarCopia } from "../../utilidades/copiaEditor.ts";
import type { AvisoEstado } from "../../utilidades/editor.ts";
import CursoNoEditable from "./CursoNoEditable.tsx";
import DatosCurso from "./DatosCurso.tsx";
import EnviarRevision from "./EnviarRevision.tsx";
import ListaLecciones from "./ListaLecciones.tsx";
import estilos from "./MapaCurso.module.css";

// Mapa del curso (specs F05 y F06; docs/diseno.md, sección 5): en borrador, sus datos
// y sus lecciones; en revisión o publicado, lo que se puede hacer con él.
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

  if (error || !datos) {
    return <ErrorCarga mensaje={leerErrorDeCarga(error)} alReintentar={recargar} />;
  }

  // con key: otro curso en la dirección empieza de cero
  return <PantallaCurso key={datos.curso.id} cursoInicial={datos.curso} />;
}

type PropsPantallaCurso = {
  cursoInicial: CursoEnEditor;
};

// Guarda el curso para cambiar de estado sin recargar: el indicador de usePeticion se
// comería el aviso (brote_specs, research de F06, punto 8).
function PantallaCurso({ cursoInicial }: PropsPantallaCurso) {
  const navegar = useNavigate();
  const [curso, setCurso] = useState(cursoInicial);
  const [avisoEstado, setAvisoEstado] = useState<AvisoEstado | null>(null);
  const contenedor = useRef<HTMLDivElement>(null);
  const estadoMostrado = useRef(curso.estado);

  // el botón pulsado desaparece con el estado: el foco no debe quedarse sin lugar
  useEffect(() => {
    if (estadoMostrado.current === curso.estado) return;
    estadoMostrado.current = curso.estado;
    contenedor.current?.focus();
  }, [curso.estado]);

  function cambiarCurso(nuevo: CursoEnEditor, aviso: AvisoEstado) {
    setCurso(nuevo);
    setAvisoEstado(aviso);
  }

  return (
    <div ref={contenedor} tabIndex={-1} className={estilos.mapa}>
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
      {avisoEstado && <Aviso texto={avisoEstado.texto} tono={avisoEstado.tono} />}
      {curso.estado === "borrador" ? (
        <ContenidoMapa
          key={curso.estado}
          curso={curso}
          alCambiarCurso={cambiarCurso}
          alLimpiarAviso={() => setAvisoEstado(null)}
        />
      ) : (
        <CursoNoEditable
          curso={curso}
          alCambiarCurso={cambiarCurso}
          alLimpiarAviso={() => setAvisoEstado(null)}
        />
      )}
    </div>
  );
}

// Lo que se recupera si la sesión expira en esta pantalla (research de F05, punto 15).
type CopiaMapa = {
  titulo: string;
  descripcion: string;
  idioma?: IdiomaCurso; // F14; una copia de antes no lo trae
  nuevaLeccion: string;
};

type PropsContenidoMapa = {
  curso: CursoEnEditor;
  alCambiarCurso: (curso: CursoEnEditor, aviso: AvisoEstado) => void;
  alLimpiarAviso: () => void;
};

const SIN_MARCADAS: ReadonlySet<string> = new Set();

// El formulario y la lista comparten pantalla: lo capturado y `ocupado` viven aquí,
// porque un 401 o un guardado en uno afecta al otro.
function ContenidoMapa({ curso, alCambiarCurso, alLimpiarAviso }: PropsContenidoMapa) {
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const idUsuario = useSesion().usuario?.id ?? "";
  // una sola vez: tomarCopia la borra
  const [copia] = useState(() => tomarCopia<CopiaMapa>(idUsuario, pathname));
  const capturado = useRef<CopiaMapa>(
    copia ?? {
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      idioma: curso.idioma,
      nuevaLeccion: "",
    },
  );
  const [lecciones, setLecciones] = useState(curso.lecciones);
  const [marcadas, setMarcadas] = useState(SIN_MARCADAS);
  const [hayCambios, setHayCambios] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const { propsDialogo, salirSinPreguntar } = useSalirSinGuardar(hayCambios);

  const capturarDatos = useCallback(
    ({ titulo, descripcion, idioma }: Pick<CopiaMapa, "titulo" | "descripcion" | "idioma">) => {
      capturado.current = { ...capturado.current, titulo, descripcion, idioma };
    },
    [],
  );

  // Las marcas y los avisos duran hasta la siguiente acción.
  function cambiarOcupado(valor: boolean) {
    setOcupado(valor);
    if (!valor) return;
    setMarcadas(SIN_MARCADAS);
    setAviso(null);
    alLimpiarAviso();
  }

  function alSesionPerdida() {
    guardarCopia({ idUsuario, ruta: pathname, datos: capturado.current });
  }

  async function eliminar() {
    setEliminando(true);
    cambiarOcupado(true);
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
      cambiarOcupado(false);
    }
  }

  return (
    <>
      {curso.revisionRechazada && (
        <Aviso
          tono="calido"
          icono={MessageSquareWarning}
          titulo="La revisión no se aprobó."
          texto={[curso.motivoRechazo, "Corrígelo y envíalo otra vez."]
            .filter(Boolean)
            .join("\n\n")}
        />
      )}
      <DatosCurso
        curso={curso}
        inicial={copia}
        ocupado={ocupado}
        alCambiarOcupado={cambiarOcupado}
        alCambiarPendientes={setHayCambios}
        alCambiarCapturado={capturarDatos}
        alSesionPerdida={alSesionPerdida}
      />
      <ListaLecciones
        idCurso={curso.id}
        lecciones={lecciones}
        alCambiarLecciones={setLecciones}
        marcadas={marcadas}
        tituloInicial={copia?.nuevaLeccion ?? ""}
        ocupado={ocupado}
        alCambiarOcupado={cambiarOcupado}
        alCambiarCapturado={(nuevaLeccion) => {
          capturado.current = { ...capturado.current, nuevaLeccion };
        }}
        alSesionPerdida={alSesionPerdida}
      />
      {aviso && <Aviso texto={aviso} />}
      <div className={estilos.botonesCurso}>
        <EnviarRevision
          idCurso={curso.id}
          hayCambios={hayCambios}
          ocupado={ocupado}
          alCambiarOcupado={cambiarOcupado}
          alCambiarLecciones={setLecciones}
          alMarcarVacias={(ids) => setMarcadas(new Set(ids))}
          alAviso={setAviso}
          alCambiarCurso={alCambiarCurso}
          alSesionPerdida={alSesionPerdida}
        />
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
    </>
  );
}
