import { createContext } from "react";
import type { FiltrosCatalogo } from "../servicios/cursos.ts";
import type { ResumenCurso } from "../tipos/contrato.ts";

// Estado global del catálogo (decisiones 0011 y 0020). Vive en ZonaExplorable
// para que filtros, búsqueda y cursos sigan ahí al volver del detalle.
export type EstadoCatalogo = {
  filtros: FiltrosCatalogo | null;
  // texto recortado de la última respuesta, para mostrar mensajes de vacío
  consulta: string | null;
  cursos: ResumenCurso[];
  siguiente: string | null;
  fase: "cargando" | "listo" | "error";
  buscando: boolean;
  cargandoMas: boolean;
  errorMas: unknown;
  error: unknown;
};

export type ValorCatalogo = EstadoCatalogo & {
  buscar: (filtros: FiltrosCatalogo) => void;
  cargarMas: () => void;
  reintentar: () => void;
};

export const CatalogoContext = createContext<ValorCatalogo | null>(null);
