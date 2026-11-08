import { registroEditor } from "../actividades/registroEditor.ts";
import type { EditorActividad } from "../actividades/tipos.ts";
import type {
  Actividad,
  Audio,
  Imagen,
  LeccionEnEditor,
  TipoActividad,
} from "../tipos/contrato.ts";
import { idLocal } from "../utilidades/editor.ts";
import { idDeArchivo, limpiarSubidas, reemplazarArchivos } from "./archivos.ts";

// La lección mientras se edita (spec F05). Sin red: el guardado está en
// useEditorLeccion. Cada actividad es un bloque con su borrador, porque una
// actividad a medias no cabe en el contrato (brote_specs, research de F05, punto 8).

export type Bloque = {
  id: string;
  tipo: TipoActividad;
  borrador: unknown;
};

// Lo que se arrastra en el lienzo: un tipo de la paleta o un bloque de la secuencia.
export type ItemArrastre =
  { origen: "paleta"; tipo: TipoActividad } | { origen: "secuencia"; id: string };

export type EstadoLeccion = {
  titulo: string;
  bloques: Bloque[];
  idSeleccionado: string | null;
  // la que se abrió, o la última que se guardó aquí
  version: number;
  hayCambios: boolean;
  // los errores de los campos aparecen al intentar guardar o probar
  mostrarErrores: boolean;
};

// Lo que se recupera si la sesión expira al guardar (research de F05, punto 15).
export type CopiaLeccion = Pick<EstadoLeccion, "titulo" | "bloques" | "version">;

export type AccionLeccion =
  | { tipo: "cambiarTitulo"; titulo: string }
  | { tipo: "agregar"; tipoActividad: TipoActividad; posicion?: number }
  | { tipo: "cambiarBorrador"; id: string; borrador: unknown }
  | { tipo: "mover"; desde: number; hasta: number }
  | { tipo: "quitar"; id: string }
  | { tipo: "seleccionar"; id: string | null }
  | { tipo: "mostrarErrores"; idPrimero: string | null }
  | { tipo: "guardada"; version: number }
  // F13 y F14: terminó una subida, con su imagen o su audio, o con su error
  | { tipo: "archivoSubido"; idSubida: string; archivo: { imagen: Imagen } | { audio: Audio } }
  | { tipo: "archivoNoSubido"; idSubida: string; error: string }
  // F13 y F14: el servidor dijo que estas imágenes o estos audios ya no están
  | { tipo: "marcarArchivosPerdidos"; ids: string[] };

function editorDe(tipo: TipoActividad) {
  // TypeScript no relaciona el tipo del bloque con el de su editor
  return registroEditor[tipo] as EditorActividad<TipoActividad, unknown>;
}

function aBloque(actividad: Actividad): Bloque {
  return {
    id: idLocal(),
    tipo: actividad.tipo,
    borrador: editorDe(actividad.tipo).aBorrador(actividad as never),
  };
}

export function erroresDe({ tipo, borrador }: Bloque) {
  return editorDe(tipo).validar(borrador);
}

export function bloquesIncompletos(bloques: Bloque[]): Bloque[] {
  return bloques.filter((bloque) => Object.keys(erroresDe(bloque)).length > 0);
}

export function resumenDe({ tipo, borrador }: Bloque): string {
  return editorDe(tipo).resumen(borrador);
}

// Solo con un bloque sin errores.
export function aActividad({ tipo, borrador }: Bloque): Actividad {
  return editorDe(tipo).aActividad(borrador);
}

export function estadoInicial(leccion: LeccionEnEditor, copia: CopiaLeccion | null): EstadoLeccion {
  return {
    titulo: copia?.titulo ?? leccion.titulo,
    // F13 y F14: lo que se estaba subiendo cuando expiró la sesión no llegó
    bloques: copia ? limpiarSubidas(copia.bloques) : leccion.actividades.map(aBloque),
    idSeleccionado: null,
    version: copia?.version ?? leccion.version,
    hayCambios: copia !== null,
    mostrarErrores: false,
  };
}

// Después de la seleccionada; sin selección, al final.
function posicionNueva({ bloques, idSeleccionado }: EstadoLeccion): number {
  const seleccionado = bloques.findIndex(({ id }) => id === idSeleccionado);
  return seleccionado === -1 ? bloques.length : seleccionado + 1;
}

export function reducirLeccion(estado: EstadoLeccion, accion: AccionLeccion): EstadoLeccion {
  switch (accion.tipo) {
    case "cambiarTitulo":
      return { ...estado, titulo: accion.titulo, hayCambios: true };
    case "agregar": {
      const bloque: Bloque = {
        id: idLocal(),
        tipo: accion.tipoActividad,
        borrador: editorDe(accion.tipoActividad).crearBorrador(),
      };
      const bloques = [...estado.bloques];
      bloques.splice(accion.posicion ?? posicionNueva(estado), 0, bloque);
      return { ...estado, bloques, idSeleccionado: bloque.id, hayCambios: true };
    }
    case "cambiarBorrador":
      return {
        ...estado,
        bloques: estado.bloques.map((bloque) =>
          bloque.id === accion.id ? { ...bloque, borrador: accion.borrador } : bloque,
        ),
        hayCambios: true,
      };
    case "mover": {
      const bloques = [...estado.bloques];
      const [movido] = bloques.splice(accion.desde, 1);
      if (!movido) return estado;
      bloques.splice(accion.hasta, 0, movido);
      return { ...estado, bloques, hayCambios: true };
    }
    case "quitar":
      return {
        ...estado,
        bloques: estado.bloques.filter(({ id }) => id !== accion.id),
        idSeleccionado: estado.idSeleccionado === accion.id ? null : estado.idSeleccionado,
        hayCambios: true,
      };
    case "seleccionar":
      return { ...estado, idSeleccionado: accion.id };
    case "mostrarErrores":
      return {
        ...estado,
        mostrarErrores: true,
        idSeleccionado: accion.idPrimero ?? estado.idSeleccionado,
      };
    case "guardada":
      return { ...estado, version: accion.version, hayCambios: false, mostrarErrores: false };
    case "archivoSubido": {
      const { archivo } = accion;
      // cada archivo va al valor de su clase: una imagen en un campo de imagen
      return {
        ...estado,
        bloques: reemplazarArchivos(estado.bloques, (valor) => {
          if (valor.subida !== accion.idSubida) return valor;
          const limpio = { subida: null, error: null, perdida: false };
          if (valor.clase === "imagen" && "imagen" in archivo) {
            return { ...valor, ...limpio, imagen: archivo.imagen };
          }
          if (valor.clase === "audio" && "audio" in archivo) {
            return { ...valor, ...limpio, audio: archivo.audio };
          }
          return valor;
        }),
      };
    }
    case "archivoNoSubido":
      return {
        ...estado,
        bloques: reemplazarArchivos(estado.bloques, (valor) =>
          valor.subida === accion.idSubida
            ? { ...valor, subida: null, error: accion.error }
            : valor,
        ),
      };
    case "marcarArchivosPerdidos":
      return {
        ...estado,
        bloques: reemplazarArchivos(estado.bloques, (valor) => {
          const id = idDeArchivo(valor);
          return id && accion.ids.includes(id) ? { ...valor, perdida: true } : valor;
        }),
      };
  }
}
