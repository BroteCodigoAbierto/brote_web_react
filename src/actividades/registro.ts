import type { ComponentType } from "react";
import type { Actividad, TipoActividad } from "../tipos/contrato.ts";
import BancoPalabras from "./BancoPalabras/BancoPalabras.tsx";
import Clasificar from "./Clasificar/Clasificar.tsx";
import CompletarEspacios from "./CompletarEspacios/CompletarEspacios.tsx";
import Emparejar from "./Emparejar/Emparejar.tsx";
import EscucharRepetir from "./EscucharRepetir/EscucharRepetir.tsx";
import GrafoCommits from "./GrafoCommits/GrafoCommits.tsx";
import OpcionMultiple from "./OpcionMultiple/OpcionMultiple.tsx";
import Ordenar from "./Ordenar/Ordenar.tsx";
import PreguntaAbierta from "./PreguntaAbierta/PreguntaAbierta.tsx";
import RetoCodigo from "./RetoCodigo/RetoCodigo.tsx";
import TarjetaMemoria from "./TarjetaMemoria/TarjetaMemoria.tsx";
import TerminalSimulada from "./TerminalSimulada/TerminalSimulada.tsx";
import Teoria from "./Teoria/Teoria.tsx";
import type { PropsActividad } from "./tipos.ts";

// Registro tipo → componente (constitución, principio IV). Agregar un tipo de
// actividad aquí es su componente y una línea en este objeto; el tipo obliga a
// tener una entrada por cada tipo del contrato, así que si falta, no compila.
export const registroActividades: {
  [T in TipoActividad]: ComponentType<PropsActividad<T>>;
} = {
  teoria: Teoria,
  tarjeta: TarjetaMemoria,
  opcionMultiple: OpcionMultiple,
  completarEspacios: CompletarEspacios,
  preguntaAbierta: PreguntaAbierta,
  emparejar: Emparejar,
  clasificar: Clasificar,
  ordenar: Ordenar,
  bancoPalabras: BancoPalabras,
  retoCodigo: RetoCodigo,
  terminalSimulada: TerminalSimulada,
  grafoCommits: GrafoCommits,
  escucharRepetir: EscucharRepetir,
};

// Una versión vieja del cliente puede recibir un tipo que todavía no conoce:
// se salta en vez de romper la lección (research de F03, punto 7).
export function actividadesConocidas(actividades: Actividad[]): Actividad[] {
  return actividades.filter((actividad) => Object.hasOwn(registroActividades, actividad.tipo));
}
