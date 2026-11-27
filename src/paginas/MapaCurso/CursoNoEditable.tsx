import { Check, Copy, Download, Eye, EyeOff, Undo2 } from "lucide-react";
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
  exportarCurso,
  leerErrorDeAccion,
  retirarDelCatalogo,
  retirarDeRevision,
  traerCursoEnEditor,
} from "../../servicios/editor.ts";
import {
  MENSAJES_EDITOR,
  NOMBRE_CATEGORIA,
  NOMBRE_IDIOMA,
  NOMBRE_NIVEL,
  NOMBRE_VISIBILIDAD,
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

// El mapa de un curso en revisión o publicado (F06 + F07 + decisión 0020).
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
  const [exportando, setExportando] = useState(false);
  const [enlaceCopiado, setEnlaceCopiado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const accionEnCurso = useRef(false);
  const publicado = curso.estado === "publicado";

  useEffect(() => {
    tomarCopia(idUsuario, pathname);
  }, [idUsuario, pathname]);

  async function pasarAlEstadoReal() {
    try {
      const { curso: actual } = await traerCursoEnEditor(curso.id);
      alCambiarCurso(actual, { texto: MENSAJES_EDITOR.estadoCambiado, tono: "error" });
    } catch {
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
      if (esConflicto(error)) await pasarAlEstadoReal();
      else if (!esSesionPerdida(error)) setAviso(leerErrorDeAccion(error, fallo));
    } finally {
      accionEnCurso.current = false;
      setRetirando(false);
    }
  }

  async function descargarJson() {
    setExportando(true);
    setAviso(null);
    try {
      const datos = await exportarCurso(curso.id);
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `curso-${curso.id}.brote.json`;
      enlace.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setAviso(leerErrorDeAccion(error, "No se pudo exportar el curso."));
    } finally {
      setExportando(false);
    }
  }

  async function copiarEnlacePrivado() {
    if (!curso.claveEnlace) return;
    const url = `${window.location.origin}/cursos/enlace/${curso.claveEnlace}`;
    try {
      await navigator.clipboard.writeText(url);
      setEnlaceCopiado(true);
      setTimeout(() => setEnlaceCopiado(false), 2500);
    } catch {
      // sin permiso de portapapeles
    }
  }

  const rutaVer =
    curso.visibilidad === "enlacePrivado" && curso.claveEnlace
      ? `/cursos/enlace/${curso.claveEnlace}`
      : `/cursos/${curso.id}`;

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
          <p className={estilos.idiomaCurso}>
            {NOMBRE_CATEGORIA[curso.categoria]} · {NOMBRE_NIVEL[curso.nivel]} ·{" "}
            {NOMBRE_IDIOMA[curso.idioma]}
          </p>
          <p className={estilos.idiomaCurso}>
            Visibilidad: {NOMBRE_VISIBILIDAD[curso.visibilidad]}
            {curso.organizacion ? ` (${curso.organizacion.nombre})` : ""}
          </p>
          <p className={estilos.idiomaCurso}>
            {curso.daInsignia
              ? "Da una insignia a quien lo complete"
              : "No da insignia a quien lo complete"}
          </p>
        </div>
      </div>

      {publicado && curso.visibilidad === "enlacePrivado" && curso.claveEnlace && (
        <Aviso
          tono="info"
          titulo="Enlace privado activo"
          texto={`${window.location.origin}/cursos/enlace/${curso.claveEnlace}`}
        />
      )}

      <div className={estilos.explicacion}>
        <p className={estilos.mensaje}>
          {publicado ? MENSAJES_EDITOR.cursoPublicado : MENSAJES_EDITOR.cursoEnRevision}
        </p>
        <p className={estilos.textoMensaje}>
          {publicado
            ? "Para editarlo, retíralo primero para volver a borrador."
            : "Un moderador lo revisará antes de publicarlo."}
        </p>
      </div>
      {aviso && <Aviso texto={aviso} />}
      {publicado ? (
        <div className={estilos.botonesCurso}>
          <Boton icono={Eye} deshabilitado={retirando} alPulsar={() => navegar(rutaVer)}>
            Ver curso
          </Boton>
          {curso.visibilidad === "enlacePrivado" && curso.claveEnlace && (
            <Boton
              variante="secundario"
              icono={enlaceCopiado ? Check : Copy}
              deshabilitado={retirando}
              alPulsar={copiarEnlacePrivado}
            >
              {enlaceCopiado ? "Enlace copiado" : "Copiar enlace privado"}
            </Boton>
          )}
          <Boton
            variante="secundario"
            icono={Download}
            enviando={exportando}
            textoEnviando="Exportando..."
            deshabilitado={retirando}
            alPulsar={descargarJson}
          >
            Exportar JSON
          </Boton>
          <Boton
            variante="secundario"
            icono={EyeOff}
            deshabilitado={retirando}
            alPulsar={() => setConfirmando(true)}
          >
            Retirar a borrador
          </Boton>
        </div>
      ) : (
        <div className={estilos.botonesCurso}>
          <Boton
            variante="secundario"
            icono={Download}
            enviando={exportando}
            textoEnviando="Exportando..."
            deshabilitado={retirando}
            alPulsar={descargarJson}
          >
            Exportar JSON
          </Boton>
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
        titulo="¿Retirar este curso a borrador?"
        texto="Los alumnos dejarán de verlo temporalmente, pero conservarán su progreso."
        textoConfirmar="Retirar"
        textoCancelar="Cancelar"
        enviando={retirando}
        alConfirmar={() =>
          retirar(
            retirarDelCatalogo,
            "El curso se retiró y volvió a borrador.",
            "No se pudo retirar el curso.",
          )
        }
        alCancelar={() => setConfirmando(false)}
      />
    </Superficie>
  );
}
