import { Rocket, Send } from "lucide-react";
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
  publicarCursoDirecto,
  traerCursoEnEditor,
} from "../../servicios/editor.ts";
import { MENSAJES_EDITOR, type CursoEnEditor, type LeccionEnMapa } from "../../tipos/contrato.ts";
import { textoLeccionesVacias, type AvisoEstado } from "../../utilidades/editor.ts";
import estilos from "./MapaCurso.module.css";

const NO_SE_PUDO_ENVIAR = "No se pudo enviar el curso a revisión.";
const NO_SE_PUDO_PUBLICAR = "No se pudo publicar el curso.";

type PropsEnviarRevision = {
  idCurso: string;
  puedePublicarDirecto: boolean;
  hayCambios: boolean;
  ocupado: boolean;
  alCambiarOcupado: (ocupado: boolean) => void;
  alCambiarLecciones: (lecciones: LeccionEnMapa[]) => void;
  alMarcarVacias: (ids: string[]) => void;
  alAviso: (texto: string) => void;
  alCambiarCurso: (curso: CursoEnEditor, aviso: AvisoEstado) => void;
  alSesionPerdida: () => void;
};

// "Enviar a revisión" o "Publicar ahora" (F06 + decisión 0020).
export default function EnviarRevision({
  idCurso,
  puedePublicarDirecto,
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
  const accionEnCurso = useRef(false);

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
      else if (esNoDisponible(error)) alAviso(MENSAJES_EDITOR.cursoNoExiste);
      else alAviso(puedePublicarDirecto ? NO_SE_PUDO_PUBLICAR : NO_SE_PUDO_ENVIAR);
    } finally {
      accionEnCurso.current = false;
      setComprobando(false);
      alCambiarOcupado(false);
    }
  }

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
      if (puedePublicarDirecto) {
        const { curso } = await publicarCursoDirecto(idCurso);
        alCambiarCurso(curso, { texto: "¡Curso publicado!", tono: "exito" });
      } else {
        const { curso } = await enviarARevision(idCurso);
        alCambiarCurso(curso, { texto: "Curso enviado a revisión.", tono: "exito" });
      }
    } catch (error) {
      setConfirmando(false);
      if (esSesionPerdida(error)) alSesionPerdida();
      else if (esContenidoIncompleto(error)) await avisarYActualizar(leerErrorDeCarga(error));
      else if (esConflicto(error)) await avisarYActualizar(MENSAJES_EDITOR.estadoCambiado);
      else
        alAviso(
          leerErrorDeAccion(error, puedePublicarDirecto ? NO_SE_PUDO_PUBLICAR : NO_SE_PUDO_ENVIAR),
        );
    } finally {
      accionEnCurso.current = false;
      setEnviando(false);
      alCambiarOcupado(false);
    }
  }

  const etiquetaBoton = puedePublicarDirecto ? "Publicar ahora" : "Enviar a revisión";

  return (
    <div className={estilos.enviar}>
      <Boton
        icono={puedePublicarDirecto ? Rocket : Send}
        enviando={comprobando}
        textoEnviando={etiquetaBoton}
        deshabilitado={hayCambios || ocupado}
        alPulsar={pulsar}
      >
        {etiquetaBoton}
      </Boton>
      {hayCambios && (
        <p className={estilos.nota}>
          {puedePublicarDirecto
            ? "Guarda los cambios para poder publicarlo."
            : "Guarda los cambios para poder enviarlo."}
        </p>
      )}
      <Dialogo
        abierto={confirmando}
        titulo={puedePublicarDirecto ? "¿Publicar este curso ahora?" : "¿Enviar a revisión?"}
        texto={
          puedePublicarDirecto
            ? "El curso quedará publicado de inmediato según su configuración de visibilidad."
            : "Mientras esté en revisión no podrás editarlo. Un moderador lo revisará antes de publicarlo."
        }
        textoConfirmar={puedePublicarDirecto ? "Publicar" : "Enviar"}
        textoCancelar="Cancelar"
        varianteConfirmar="primario"
        enviando={enviando}
        alConfirmar={confirmar}
        alCancelar={() => setConfirmando(false)}
      />
    </div>
  );
}
