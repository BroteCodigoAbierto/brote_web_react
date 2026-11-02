import { createContext } from "react";
import type { ResumenCurso } from "../tipos/contrato.ts";

// Estado global del catálogo (decisión 0011). Lo llena CatalogoProvider, que
// vive en el Layout, y se lee con useCatalogo(). Así la búsqueda y los cursos
// cargados siguen ahí al volver del detalle (research de F02, punto 8).

export type EstadoCatalogo = {
  // la búsqueda vigente, ya recortada; null antes de la primera
  consulta: string | null;
  cursos: ResumenCurso[];
  // cursor para pedir los 10 siguientes; null si no hay más
  siguiente: string | null;
  // la primera carga de la consulta: sin lista mientras carga o si falló
  fase: "cargando" | "listo" | "error";
  // hay una búsqueda nueva en camino y la lista anterior sigue en pantalla
  buscando: boolean;
  cargandoMas: boolean;
  errorMas: unknown;
  error: unknown;
};

export type ValorCatalogo = EstadoCatalogo & {
  buscar: (consulta: string) => void;
  cargarMas: () => void;
  reintentar: () => void;
};

export const CatalogoContext = createContext<ValorCatalogo | null>(null);
