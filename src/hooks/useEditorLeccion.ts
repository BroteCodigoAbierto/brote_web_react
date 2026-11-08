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
import { hayImagenes, haySubidas, limpiarSubidas, pesoImagenes } from "../editor/imagenes.ts";
import { ErrorHttp } from "../servicios/api.ts";
import {
  esConflicto,
  esSesionPerdida,
  guardarLeccion,
  leerErrorDeAccion,
} from "../servicios/editor.ts";
import { leerErrorDeSubida, subirImagen } from "../servicios/imagenes.ts";
import {
  LIMITES_IMAGENES,
  MENSAJES_EDITOR,
  MENSAJES_IMAGENES,
  type LeccionEnEditor,
  type RespuestaError,
  type TipoActividad,
} from "../tipos/contrato.ts";
import { guardarCopia, tomarCopia } from "../utilidades/copiaEditor.ts";
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

// F13: "imagenes.<id>" de un 400: las imágenes que el servidor ya no tiene.
function imagenesPerdidas(error: unknown): string[] {
  if (!(error instanceof ErrorHttp) || error.estado !== 400) return [];
  const { campos } = (error.cuerpo ?? {}) as Partial<RespuestaError>;
  return Object.keys(campos ?? {})
    .filter((campo) => campo.startsWith("imagenes."))
    .map((campo) => campo.slice("imagenes.".length));
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

  // F13: empieza a subir una imagen y devuelve el id de la subida, que el campo guarda en su
  // valor; al terminar, el reductor la pone donde esté ese id (research de F13, punto 13).
  function subir(archivo: File): string {
    const idSubida = idLocal();
    void (async () => {
      let preparada: Blob;
      try {
        preparada = await prepararImagen(archivo);
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : MENSAJES_IMAGENES.subidaFallida;
        despachar({ tipo: "imagenNoSubida", idSubida, error: mensaje });
        return;
      }
      try {
        const { imagen } = await subirImagen(idCurso, preparada);
        despachar({ tipo: "imagenSubida", idSubida, imagen });
      } catch (error) {
        if (esSesionPerdida(error)) {
          const { titulo, bloques, version } = ultimo.current;
          const datos = { titulo, bloques: limpiarSubidas(bloques), version };
          guardarCopia({ idUsuario, ruta: pathname, datos });
          return;
        }
        despachar({ tipo: "imagenNoSubida", idSubida, error: leerErrorDeSubida(error) });
      }
    })();
    return idSubida;
  }

  // La misma comprobación para guardar y para probar (spec F05). Con solo el título
  // vacío no hay aviso: el error va en su campo. Desde F13, ni con imágenes subiéndose (los
  // botones ya están deshabilitados) ni con más de 25 MB de imágenes.
  function comprobar(inicioAviso: string): boolean {
    if (haySubidas(estado.bloques)) return false;
    if (pesoImagenes(estado.bloques) > LIMITES_IMAGENES.pesoLeccionMax) {
      setAviso(MENSAJES_IMAGENES.leccionPesada);
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
        const cuerpo = (error.cuerpo ?? {}) as Partial<RespuestaError>;
        // F13: sin campos, es el peso de la lección; con imágenes que ya no están, se marcan
        setAviso(
          cuerpo.campos
            ? MENSAJES_EDITOR.datosInvalidos
            : (cuerpo.error ?? MENSAJES_EDITOR.datosInvalidos),
        );
        const perdidas = imagenesPerdidas(error);
        if (perdidas.length > 0) despachar({ tipo: "marcarImagenesPerdidas", ids: perdidas });
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
    // F13
    subir,
    subiendo: haySubidas(estado.bloques),
    pesoImagenes: pesoImagenes(estado.bloques),
    conImagenes: hayImagenes(estado.bloques),
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
