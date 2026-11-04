import { useReducer, useRef, useState } from "react";
import { useLocation } from "react-router";
import {
  aActividad,
  bloquesIncompletos,
  estadoInicial,
  reducirLeccion,
  type AccionLeccion,
  type CopiaLeccion,
} from "../editor/estadoLeccion.ts";
import { ErrorHttp } from "../servicios/api.ts";
import {
  esConflicto,
  esSesionPerdida,
  guardarLeccion,
  leerErrorDeAccion,
} from "../servicios/editor.ts";
import { MENSAJES_EDITOR, type LeccionEnEditor, type RespuestaError } from "../tipos/contrato.ts";
import { guardarCopia, tomarCopia } from "../utilidades/copiaEditor.ts";
import { textoIncompletas } from "../utilidades/editor.ts";
import { useSesion } from "./useSesion.ts";

// "actividades.2" → 2, si el servidor dice cuál rechazó.
function indiceRechazado(error: unknown): number | null {
  if (!(error instanceof ErrorHttp) || error.estado !== 400) return null;
  const { campos } = (error.cuerpo ?? {}) as Partial<RespuestaError>;
  const clave = Object.keys(campos ?? {}).find((campo) => /^actividades\.\d+$/.test(campo));
  return clave ? Number(clave.split(".")[1]) : null;
}

// La lección que se edita y cómo se guarda (spec F05). Vive en la página, y por eso
// "Probar lección" la conserva: no hace falta un contexto.
export function useEditorLeccion(idCurso: string, leccion: LeccionEnEditor) {
  const { pathname } = useLocation();
  const idUsuario = useSesion().usuario?.id ?? "";
  const [estado, despachar] = useReducer(reducirLeccion, null, () =>
    estadoInicial(leccion, tomarCopia<CopiaLeccion>(idUsuario, pathname)),
  );
  const [guardando, setGuardando] = useState(false);
  const [guardada, setGuardada] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [versionMasNueva, setVersionMasNueva] = useState(false);
  // suben para que la página mueva el foco después de dibujar
  const [focoAlError, setFocoAlError] = useState(0);
  const [focoAlFormulario, setFocoAlFormulario] = useState(0);
  // el estado tarda un render en verse; con la ref un doble clic no pasa
  const guardandoAhora = useRef(false);

  function editar(accion: AccionLeccion) {
    setAviso(null);
    despachar(accion);
  }

  function agregar(
    tipoActividad: Extract<AccionLeccion, { tipo: "agregar" }>["tipoActividad"],
    posicion?: number,
  ) {
    editar({ tipo: "agregar", tipoActividad, posicion });
    setFocoAlFormulario((n) => n + 1);
  }

  // La misma comprobación para guardar y para probar (spec F05). Con solo el título
  // vacío no hay aviso: el error va en su campo.
  function comprobar(inicioAviso: string): boolean {
    const incompletos = bloquesIncompletos(estado.bloques);
    const tituloVacio = estado.titulo.trim() === "";
    if (!tituloVacio && incompletos.length === 0) return true;
    despachar({ tipo: "mostrarErrores", idPrimero: incompletos[0]?.id ?? null });
    setAviso(
      incompletos.length > 0 ? `${inicioAviso}: ${textoIncompletas(incompletos.length)}` : null,
    );
    setFocoAlError((n) => n + 1);
    return false;
  }

  async function guardar(reemplazar = false) {
    if (guardandoAhora.current || !comprobar("No se guardó")) return;
    const { titulo, bloques, version } = estado;
    guardandoAhora.current = true;
    setGuardando(true);
    setAviso(null);
    setVersionMasNueva(false);
    try {
      const respuesta = await guardarLeccion(idCurso, leccion.id, {
        titulo,
        actividades: bloques.map(aActividad),
        version,
        ...(reemplazar && { reemplazar: true }),
      });
      despachar({ tipo: "guardada", version: respuesta.leccion.version });
      setGuardada(true);
    } catch (error) {
      if (esSesionPerdida(error)) {
        guardarCopia({ idUsuario, ruta: pathname, datos: { titulo, bloques, version } });
      } else if (esConflicto(error)) {
        setVersionMasNueva(true);
      } else if (error instanceof ErrorHttp && error.estado === 400) {
        setAviso(MENSAJES_EDITOR.datosInvalidos);
        const indice = indiceRechazado(error);
        const bloque = indice === null ? undefined : bloques[indice];
        if (bloque) despachar({ tipo: "seleccionar", id: bloque.id });
      } else {
        setAviso(
          leerErrorDeAccion(error, "No se pudo guardar la lección. Tus cambios siguen aquí."),
        );
      }
    } finally {
      guardandoAhora.current = false;
      setGuardando(false);
    }
  }

  return {
    estado,
    guardando,
    guardada: guardada && !estado.hayCambios,
    aviso,
    versionMasNueva,
    focoAlError,
    focoAlFormulario,
    editar,
    agregar,
    seleccionar: (id: string) => despachar({ tipo: "seleccionar", id }),
    comprobar,
    guardar,
    cancelarReemplazo: () => setVersionMasNueva(false),
  };
}
