import { Eye, EyeOff, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import Dialogo from "../../componentes/Dialogo/Dialogo.tsx";
import InsigniaEstadoCurso from "../../componentes/InsigniaEstadoCurso/InsigniaEstadoCurso.tsx";
import PortadaCurso from "../../componentes/PortadaCurso/PortadaCurso.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useSesion } from "../../hooks/useSesion.ts";
import {
  esConflicto,
  esSesionPerdida,
  leerErrorDeAccion,
  retirarDelCatalogo,
  retirarDeRevision,
  traerCursoEnEditor,
} from "../../servicios/editor.ts";
import {
  MENSAJES_EDITOR,
  NOMBRE_IDIOMA,
  type CursoEnEditor,
  type RespuestaCursoEnEditor,
} from "../../tipos/contrato.ts";
import { tomarCopia } from "../../utilidades/copiaEditor.ts";
import type { AvisoEstado } from "../../utilidades/editor.ts";
import estilos from "./MapaCurso.module.css";

type PropsCursoNoEditable = {
  curso: CursoEnEditor;
  alCambiarCurso: (curso: CursoEnEditor, aviso: AvisoEstado) => void;
  alLimpiarAviso: () => void;
};

// El mapa de un curso en revisión o publicado (spec F06; docs/diseno.md, sección 5,
// "Curso que no se edita"): lo que se puede hacer con él es retirarlo.
export default function CursoNoEditable({
  curso,
  alCambiarCurso,
  alLimpiarAviso,
}: PropsCursoNoEditable) {
  const navegar = useNavigate();
  const { pathname } = useLocation();
  const idUsuario = useSesion().usuario?.id ?? "";
  const [confirmando, setConfirmando] = useState(false);
  const [retirando, setRetirando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  // el estado tarda un render en verse; con la ref un doble clic no pasa
  const accionEnCurso = useRef(false);
  const publicado = curso.estado === "publicado";

  // Una copia de cuando era borrador reaparecería al volver a serlo, ya vieja.
  useEffect(() => {
    tomarCopia(idUsuario, pathname);
  }, [idUsuario, pathname]);

  async function pasarAlEstadoReal() {
    try {
      const { curso: actual } = await traerCursoEnEditor(curso.id);
      alCambiarCurso(actual, { texto: MENSAJES_EDITOR.estadoCambiado, tono: "error" });
    } catch {
      // sin red no hay estado real que mostrar, pero el aviso sí
      setAviso(MENSAJES_EDITOR.estadoCambiado);
    }
  }

  async function retirar(
    accion: (idCurso: string) => Promise<RespuestaCursoEnEditor>,
    exito: string,
    fallo: string,
  ) {
    if (accionEnCurso.current) return;
    accionEnCurso.current = true;
    setRetirando(true);
    setAviso(null);
    alLimpiarAviso();
    try {
      const { curso: retirado } = await accion(curso.id);
      alCambiarCurso(retirado, { texto: exito, tono: "exito" });
    } catch (error) {
      setConfirmando(false);
      // con la sesión perdida, pedir() ya mandó a "Entrar"
      if (esConflicto(error)) await pasarAlEstadoReal();
      else if (!esSesionPerdida(error)) setAviso(leerErrorDeAccion(error, fallo));
    } finally {
      accionEnCurso.current = false;
      setRetirando(false);
    }
  }

  return (
    <Superficie className={estilos.panel}>
      <div className={estilos.encabezado}>
        <PortadaCurso
          id={curso.id}
          titulo={curso.titulo}
          tamano="tarjeta"
          idPortada={curso.portada?.id}
        />
        <div className={estilos.identidad}>
          <h1 className={estilos.tituloCurso}>{curso.titulo}</h1>
          <div>
            <InsigniaEstadoCurso estado={curso.estado} />
          </div>
          {/* F14: como texto, porque no se edita */}
          <p className={estilos.idiomaCurso}>Idioma: {NOMBRE_IDIOMA[curso.idioma]}</p>
          {/* F08: como texto, igual que el idioma */}
          <p className={estilos.idiomaCurso}>
            {curso.daInsignia
              ? "Da una insignia a quien lo complete"
              : "No da insignia a quien lo complete"}
          </p>
        </div>
      </div>
      <div className={estilos.explicacion}>
        <p className={estilos.mensaje}>
          {publicado ? MENSAJES_EDITOR.cursoPublicado : MENSAJES_EDITOR.cursoEnRevision}
        </p>
        <p className={estilos.textoMensaje}>
          {publicado
            ? "Para editarlo, retíralo del catálogo. Cuando termines, tendrás que enviarlo otra vez a revisión."
            : "Un administrador lo revisará antes de publicarlo."}
        </p>
      </div>
      {aviso && <Aviso texto={aviso} />}
      {publicado ? (
        <div className={estilos.botonesCurso}>
          <Boton
            icono={Eye}
            deshabilitado={retirando}
            alPulsar={() => navegar(`/cursos/${curso.id}`)}
          >
            Ver curso
          </Boton>
          <Boton
            variante="secundario"
            icono={EyeOff}
            deshabilitado={retirando}
            alPulsar={() => setConfirmando(true)}
          >
            Retirar del catálogo
          </Boton>
        </div>
      ) : (
        <div className={estilos.botonesCurso}>
          <Boton
            variante="secundario"
            icono={Undo2}
            enviando={retirando}
            textoEnviando="Retirar de revisión"
            alPulsar={() =>
              retirar(
                retirarDeRevision,
                "El curso volvió a borrador.",
                "No se pudo retirar el curso de revisión.",
              )
            }
          >
            Retirar de revisión
          </Boton>
        </div>
      )}
      <Dialogo
        abierto={confirmando}
        titulo="¿Retirar este curso del catálogo?"
        texto="Los alumnos dejarán de verlo y no podrán cursarlo, pero conservarán su progreso. Para publicarlo otra vez tendrás que enviarlo a revisión."
        textoConfirmar="Retirar"
        textoCancelar="Cancelar"
        enviando={retirando}
        alConfirmar={() =>
          retirar(
            retirarDelCatalogo,
            "El curso se retiró del catálogo y volvió a borrador.",
            "No se pudo retirar el curso del catálogo.",
          )
        }
        alCancelar={() => setConfirmando(false)}
      />
    </Superficie>
  );
}
