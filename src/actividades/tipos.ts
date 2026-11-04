import type { ComponentType } from "react";
import type { Actividad, TipoActividad } from "../tipos/contrato.ts";

// Lo que comparten todos los componentes de actividad (brote_specs, research de
// F03, punto 7). El reproductor no sabe nada de ningún tipo: le pasa la
// actividad a su componente y recibe el resultado.

// "sinCalificar": teoría y tarjetas, que no cuentan como preguntas.
export type ResultadoActividad = "acierto" | "fallo" | "sinCalificar";

export type PropsActividad<T extends TipoActividad> = {
  actividad: Extract<Actividad, { tipo: T }>;
  // la primera vez que elige, escribe o voltea algo (para confirmar al salir)
  alInteractuar: () => void;
  // al pulsar "Continuar"
  alTerminar: (resultado: ResultadoActividad) => void;
};

// Lo que sabe de cualquier actividad quien la muestra. TypeScript no relaciona el
// tipo de la actividad con el de su componente.
export type ComponenteActividad = ComponentType<{
  actividad: Actividad;
  alInteractuar: () => void;
  alTerminar: (resultado: ResultadoActividad) => void;
}>;

// El editor (brote_specs, research de F05, punto 8). Mientras se edita, cada
// actividad es un borrador: una actividad a medias no cabe en el contrato.

// Mensaje por campo; sin errores, la actividad está completa.
export type ErroresBorrador = Record<string, string>;

// Una fila de un borrador. El id solo distingue filas entre sí: no viaja.
export type FilaTexto = {
  id: string;
  texto: string;
};

export type PropsFormularioActividad<B> = {
  borrador: B;
  alCambiar: (borrador: B) => void;
  // vacío hasta el primer intento de guardar
  errores: ErroresBorrador;
  // para los id de los campos
  idBase: string;
  deshabilitado: boolean;
};

export type EditorActividad<T extends TipoActividad, B> = {
  crearBorrador: () => B;
  aBorrador: (actividad: Extract<Actividad, { tipo: T }>) => B;
  // solo con un borrador sin errores; quita lo opcional que quedó vacío
  aActividad: (borrador: B) => Extract<Actividad, { tipo: T }>;
  validar: (borrador: B) => ErroresBorrador;
  // el inicio del texto, para el bloque de la secuencia
  resumen: (borrador: B) => string;
  Formulario: ComponentType<PropsFormularioActividad<B>>;
};
