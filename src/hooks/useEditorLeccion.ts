import { useEffect, useReducer, useRef, useState } from "react";
import { useLocation } from "react-router";
import {
  aActividad,
  bloquesIncompletos,
  estadoInicial,
  reducirLeccion,
  type AccionLeccion,
  type CopiaLeccion,
} from "../editor/estadoLeccion.ts";
import { hayArchivos, haySubidas, limpiarSubidas, pesoArchivos } from "../editor/archivos.ts";
import { ErrorHttp } from "../servicios/api.ts";
import { leerErrorDeSubidaAudio, subirAudio as subirAudioAlCurso } from "../servicios/audios.ts";
import {
  esConflicto,
  esSesionPerdida,
  guardarLeccion,
  leerErrorDeAccion,
} from "../servicios/editor.ts";
import { leerErrorDeSubida, subirImagen } from "../servicios/imagenes.ts";
import {
  LIMITES_ARCHIVOS,
  MENSAJES_ARCHIVOS,
  MENSAJES_AUDIOS,
  MENSAJES_EDITOR,
  MENSAJES_IMAGENES,
  type LeccionEnEditor,
  type RespuestaError,
  type TipoActividad,
} from "../tipos/contrato.ts";
import { guardarCopia, tomarCopia } from "../utilidades/copiaEditor.ts";
import { prepararAudio } from "../utilidades/audios.ts";
import { idLocal, textoIncompletas } from "../utilidades/editor.ts";
import { prepararImagen } from "../utilidades/imagenes.ts";
import { useSesion } from "./useSesion.ts";

// "actividades.2" → 2, si el servidor dice cuál rechazó.
function indiceRechazado(error: unknown): number | null {
  if (!(error instanceof ErrorHttp) || error.estado !== 400) return null;
  const { campos } = (error.cuerpo ?? {}) as Partial<RespuestaError>;
  const clave = Object.keys(campos ?? {}).find((campo) => /^actividades\.\d+$/.test(campo));
  return clave ? Number(clave.split(".")[1]) : null;
}

// F13 y F14: "imagenes.<id>" y "audios.<id>" de un 400: los archivos que el servidor ya no
// tiene.
function archivosPerdidos(error: unknown): string[] {
  if (!(error instanceof ErrorHttp) || error.estado !== 400) return [];
  const { campos } = (error.cuerpo ?? {}) as Partial<RespuestaError>;
  return Object.keys(campos ?? {}).flatMap((campo) => {
    const [clase, ...id] = campo.split(".");
    return clase === "imagenes" || clase === "audios" ? [id.join(".")] : [];
  });
}

// Cómo se prepara y se sube cada clase de archivo, y qué dice si falla.
type Subidor = {
  preparar: (archivo: File) => Promise<Blob>;
  subir: (
    idCurso: string,
    preparado: Blob,
  ) => Promise<Extract<AccionLeccion, { tipo: "archivoSubido" }>["archivo"]>;
  fallida: string;
  leerError: (error: unknown) => string;
};

const SUBIDOR_IMAGEN: Subidor = {
  preparar: prepararImagen,
  subir: async (idCurso, preparado) => ({ imagen: (await subirImagen(idCurso, preparado)).imagen }),
  fallida: MENSAJES_IMAGENES.subidaFallida,
  leerError: leerErrorDeSubida,
};

const SUBIDOR_AUDIO: Subidor = {
  preparar: prepararAudio,
  subir: async (idCurso, preparado) => ({
    audio: (await subirAudioAlCurso(idCurso, preparado)).audio,
  }),
  fallida: MENSAJES_AUDIOS.subidaFallida,
  leerError: leerErrorDeSubidaAudio,
};

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
  // F13: lo último en pantalla, para la copia si la sesión expira a media subida
  const ultimo = useRef(estado);
  useEffect(() => {
    ultimo.current = estado;
  });

  function editar(accion: AccionLeccion) {
    setAviso(null);
    despachar(accion);
  }

  function agregar(tipoActividad: TipoActividad, posicion?: number) {
    editar({ tipo: "agregar", tipoActividad, posicion });
    setFocoAlFormulario((n) => n + 1);
  }

  // F13 y F14: empieza a subir una imagen o un audio y devuelve el id de la subida, que el
  // campo guarda en su valor; al terminar, el reductor lo pone donde esté ese id (research de
  // F13, punto 13). Si la sesión expiró, guarda la copia sin lo que se estaba subiendo.
  function subirArchivo(archivo: File, { preparar, subir, fallida, leerError }: Subidor): string {
    const idSubida = idLocal();
    void (async () => {
      let preparado: Blob;
      try {
        preparado = await preparar(archivo);
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : fallida;
        despachar({ tipo: "archivoNoSubido", idSubida, error: mensaje });
        return;
      }
      try {
        despachar({ tipo: "archivoSubido", idSubida, archivo: await subir(idCurso, preparado) });
      } catch (error) {
        if (esSesionPerdida(error)) {
          const { titulo, modulo, bloques, version } = ultimo.current;
          const datos = { titulo, modulo, bloques: limpiarSubidas(bloques), version };
          guardarCopia({ idUsuario, ruta: pathname, datos });
          return;
        }
        despachar({ tipo: "archivoNoSubido", idSubida, error: leerError(error) });
      }
    })();
    return idSubida;
  }

  // La misma comprobación para guardar y para probar (spec F05). Con solo el título
  // vacío no hay aviso: el error va en su campo. Desde F13, ni con archivos subiéndose (los
  // botones ya están deshabilitados) ni con más de 25 MB de imágenes y audios (F14).
  function comprobar(inicioAviso: string): boolean {
    if (haySubidas(estado.bloques)) return false;
    if (pesoArchivos(estado.bloques) > LIMITES_ARCHIVOS.pesoLeccionMax) {
      setAviso(MENSAJES_ARCHIVOS.leccionPesada);
      return false;
    }
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
    const { titulo, modulo, bloques, version } = estado;
    guardandoAhora.current = true;
    setGuardando(true);
    setAviso(null);
    setVersionMasNueva(false);
    try {
      const respuesta = await guardarLeccion(idCurso, leccion.id, {
        titulo,
        modulo: modulo.trim() || null,
        actividades: bloques.map(aActividad),
        version,
        ...(reemplazar && { reemplazar: true }),
      });
      despachar({ tipo: "guardada", version: respuesta.leccion.version });
      setGuardada(true);
    } catch (error) {
      if (esSesionPerdida(error)) {
        guardarCopia({ idUsuario, ruta: pathname, datos: { titulo, modulo, bloques, version } });
      } else if (esConflicto(error)) {
        setVersionMasNueva(true);
      } else if (error instanceof ErrorHttp && error.estado === 400) {
        const cuerpo = (error.cuerpo ?? {}) as Partial<RespuestaError>;
        // F13: sin campos, es el peso de la lección; con archivos que ya no están, se marcan
        setAviso(
          cuerpo.campos
            ? MENSAJES_EDITOR.datosInvalidos
            : (cuerpo.error ?? MENSAJES_EDITOR.datosInvalidos),
        );
        const perdidos = archivosPerdidos(error);
        if (perdidos.length > 0) despachar({ tipo: "marcarArchivosPerdidos", ids: perdidos });
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
    // F13 y F14
    subir: (archivo: File) => subirArchivo(archivo, SUBIDOR_IMAGEN),
    subirAudio: (archivo: File) => subirArchivo(archivo, SUBIDOR_AUDIO),
    subiendo: haySubidas(estado.bloques),
    pesoArchivos: pesoArchivos(estado.bloques),
    conArchivos: hayArchivos(estado.bloques),
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
