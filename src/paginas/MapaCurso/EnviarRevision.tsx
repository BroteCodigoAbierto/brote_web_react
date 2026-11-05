import { Send } from "lucide-react";
import { useRef, useState } from "react";
import Boton from "../../componentes/Boton/Boton.tsx";
import Dialogo from "../../componentes/Dialogo/Dialogo.tsx";
import { esNoDisponible, leerErrorDeCarga } from "../../servicios/cursos.ts";
import {
  enviarARevision,
  esConflicto,
  esContenidoIncompleto,
  esSesionPerdida,
  leerErrorDeAccion,
  traerCursoEnEditor,
} from "../../servicios/editor.ts";
import { MENSAJES_EDITOR, type CursoEnEditor, type LeccionEnMapa } from "../../tipos/contrato.ts";
import { textoLeccionesVacias, type AvisoEstado } from "../../utilidades/editor.ts";
import estilos from "./MapaCurso.module.css";

const NO_SE_PUDO_ENVIAR = "No se pudo enviar el curso a revisión.";

type PropsEnviarRevision = {
  idCurso: string;
  hayCambios: boolean;
  ocupado: boolean;
  alCambiarOcupado: (ocupado: boolean) => void;
  alCambiarLecciones: (lecciones: LeccionEnMapa[]) => void;
  alMarcarVacias: (ids: string[]) => void;
  alAviso: (texto: string) => void;
  alCambiarCurso: (curso: CursoEnEditor, aviso: AvisoEstado) => void;
  alSesionPerdida: () => void;
};

// "Enviar a revisión" (spec F06). Antes de preguntar se pide otra vez el curso: la
// lista del mapa solo se carga al abrirlo, y con otra pestaña puede estar vieja
// (brote_specs, research de F06, punto 6).
export default function EnviarRevision({
  idCurso,
  hayCambios,
  ocupado,
  alCambiarOcupado,
  alCambiarLecciones,
  alMarcarVacias,
  alAviso,
  alCambiarCurso,
  alSesionPerdida,
}: PropsEnviarRevision) {
  const [comprobando, setComprobando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // el estado tarda un render en verse; con la ref un doble clic no pasa
  const accionEnCurso = useRef(false);

  // Actualiza el mapa con lo guardado y dice si el curso se puede enviar.
  async function comprobar(): Promise<boolean> {
    const { curso } = await traerCursoEnEditor(idCurso);
    if (curso.estado !== "borrador") {
      alCambiarCurso(curso, { texto: MENSAJES_EDITOR.estadoCambiado, tono: "error" });
      return false;
    }
    alCambiarLecciones(curso.lecciones);
    if (curso.lecciones.length === 0) {
      alAviso(MENSAJES_EDITOR.sinLecciones);
      return false;
    }
    const vacias = curso.lecciones.filter(({ cantidadActividades }) => cantidadActividades === 0);
    if (vacias.length > 0) {
      alMarcarVacias(vacias.map(({ id }) => id));
      alAviso(textoLeccionesVacias(vacias.length));
      return false;
    }
    return true;
  }

  async function pulsar() {
    if (accionEnCurso.current) return;
    accionEnCurso.current = true;
    setComprobando(true);
    alCambiarOcupado(true);
    try {
      if (await comprobar()) setConfirmando(true);
    } catch (error) {
      if (esSesionPerdida(error)) alSesionPerdida();
      // un GET responde con el mensaje de abrir, y aquí el curso se acaba de borrar
      else if (esNoDisponible(error)) alAviso(MENSAJES_EDITOR.cursoNoExiste);
      else alAviso(NO_SE_PUDO_ENVIAR);
    } finally {
      accionEnCurso.current = false;
      setComprobando(false);
      alCambiarOcupado(false);
    }
  }

  // El mensaje se queda aunque no se pueda pedir otra vez el curso.
  async function avisarYActualizar(mensaje: string) {
    alAviso(mensaje);
    await comprobar().catch(() => {});
  }

  async function confirmar() {
    if (accionEnCurso.current) return;
    accionEnCurso.current = true;
    setEnviando(true);
    alCambiarOcupado(true);
    try {
      const { curso } = await enviarARevision(idCurso);
      alCambiarCurso(curso, { texto: "Curso enviado a revisión.", tono: "exito" });
    } catch (error) {
      setConfirmando(false);
      if (esSesionPerdida(error)) alSesionPerdida();
      else if (esContenidoIncompleto(error)) await avisarYActualizar(leerErrorDeCarga(error));
      else if (esConflicto(error)) await avisarYActualizar(MENSAJES_EDITOR.estadoCambiado);
      else alAviso(leerErrorDeAccion(error, NO_SE_PUDO_ENVIAR));
    } finally {
      accionEnCurso.current = false;
      setEnviando(false);
      alCambiarOcupado(false);
    }
  }

  return (
    <div className={estilos.enviar}>
      <Boton
        icono={Send}
        enviando={comprobando}
        textoEnviando="Enviar a revisión"
        deshabilitado={hayCambios || ocupado}
        alPulsar={pulsar}
      >
        Enviar a revisión
      </Boton>
      {hayCambios && <p className={estilos.nota}>Guarda los cambios para poder enviarlo.</p>}
      <Dialogo
        abierto={confirmando}
        titulo="¿Enviar a revisión?"
        texto="Mientras esté en revisión no podrás editarlo. Un administrador lo revisará antes de publicarlo."
        textoConfirmar="Enviar"
        textoCancelar="Cancelar"
        enviando={enviando}
        alConfirmar={confirmar}
        alCancelar={() => setConfirmando(false)}
      />
    </div>
  );
}
