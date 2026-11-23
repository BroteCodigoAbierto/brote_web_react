import {
  ArrowDownUp,
  BookOpen,
  Code,
  Columns3,
  GitGraph,
  Layers,
  Link2,
  ListChecks,
  MessageSquareText,
  Mic,
  SquareTerminal,
  TextCursorInput,
  WholeWord,
  type LucideIcon,
} from "lucide-react";
import { registroEditor } from "../actividades/registroEditor.ts";
import type { TipoActividad } from "../tipos/contrato.ts";

type EntradaPaleta = {
  // los que todavía no existen llevan el identificador que tendrán en el contrato
  tipo: string;
  etiqueta: string;
  icono: LucideIcon;
};

type GrupoPaleta = {
  nombre: string;
  entradas: EntradaPaleta[];
};

// Los 13 tipos del catálogo (12 visibles: el grafo de commits está oculto) (specs/00-proyecto.md). Un tipo se activa solo cuando
// entra a registroEditor, sin tocar nada aquí (brote_specs, research de F05, punto 10).
export const GRUPOS_PALETA: GrupoPaleta[] = [
  {
    nombre: "Básicos",
    entradas: [
      { tipo: "teoria", etiqueta: "Teoría", icono: BookOpen },
      { tipo: "tarjeta", etiqueta: "Tarjeta", icono: Layers },
      { tipo: "opcionMultiple", etiqueta: "Opción múltiple", icono: ListChecks },
      { tipo: "completarEspacios", etiqueta: "Completar espacios", icono: TextCursorInput },
      { tipo: "preguntaAbierta", etiqueta: "Pregunta abierta", icono: MessageSquareText },
    ],
  },
  {
    nombre: "Relacionar",
    entradas: [
      { tipo: "emparejar", etiqueta: "Emparejar", icono: Link2 },
      { tipo: "clasificar", etiqueta: "Clasificar", icono: Columns3 },
      { tipo: "ordenar", etiqueta: "Ordenar", icono: ArrowDownUp },
      { tipo: "bancoPalabras", etiqueta: "Banco de palabras", icono: WholeWord },
    ],
  },
  {
    nombre: "Código y terminal",
    entradas: [
      { tipo: "retoCodigo", etiqueta: "Reto de código", icono: Code },
      { tipo: "terminalSimulada", etiqueta: "Terminal simulada", icono: SquareTerminal },
      // Grafo de commits: por ahora un autor no puede incluirlo en su curso. Para
      // activarlo, descomenta esta línea y quita la entrada de ENTRADAS_OCULTAS.
      // { tipo: "grafoCommits", etiqueta: "Grafo de commits", icono: GitGraph },
    ],
  },
  {
    nombre: "Voz",
    entradas: [{ tipo: "escucharRepetir", etiqueta: "Escuchar y repetir", icono: Mic }],
  },
];

// Fuera de la paleta, pero un curso que ya lo tiene se sigue mostrando y editando.
const ENTRADAS_OCULTAS: EntradaPaleta[] = [
  { tipo: "grafoCommits", etiqueta: "Grafo de commits", icono: GitGraph },
];

export function tipoDisponible(tipo: string): tipo is TipoActividad {
  return Object.hasOwn(registroEditor, tipo);
}

export function datosTipo(tipo: TipoActividad): EntradaPaleta {
  const entrada = [...GRUPOS_PALETA.flatMap(({ entradas }) => entradas), ...ENTRADAS_OCULTAS].find(
    (candidata) => candidata.tipo === tipo,
  );
  if (!entrada) throw new Error(`El tipo ${tipo} no está en la paleta`);
  return entrada;
}
