import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { useSesion } from "../hooks/useSesion.ts";
import { traerCatalogo, type FiltrosCatalogo } from "../servicios/cursos.ts";
import type { RespuestaCatalogo } from "../tipos/contrato.ts";
import { CatalogoContext, type EstadoCatalogo } from "./CatalogoContext.ts";

function claveFiltros(filtros: FiltrosCatalogo | null, idUsuario: string | null): string {
  if (!filtros) return "";
  return JSON.stringify([
    idUsuario ?? "",
    filtros.q,
    filtros.categoria ?? "",
    filtros.nivel ?? "",
    filtros.idioma ?? "",
    filtros.orden ?? "destacados",
    Boolean(filtros.ocultarCompletados),
    filtros.organizacion ?? "",
  ]);
}

type Pendiente =
  | { tipo: "primera"; filtros: FiltrosCatalogo; clave: string }
  | { tipo: "mas"; filtros: FiltrosCatalogo; clave: string; despues: string };

type Estado = EstadoCatalogo & { clave: string; pendiente: Pendiente | null };

type Accion =
  | { tipo: "buscar"; filtros: FiltrosCatalogo; clave: string }
  | { tipo: "cargarMas" }
  | { tipo: "reintentar" }
  | { tipo: "llegaron"; pendiente: Pendiente; respuesta: RespuestaCatalogo }
  | { tipo: "fallo"; pendiente: Pendiente; error: unknown };

const inicial: Estado = {
  filtros: null,
  consulta: null,
  clave: "",
  cursos: [],
  siguiente: null,
  fase: "cargando",
  buscando: false,
  cargandoMas: false,
  errorMas: null,
  error: null,
  pendiente: null,
};

function claveVigente(actual: Estado): string {
  return actual.pendiente?.tipo === "primera" ? actual.pendiente.clave : actual.clave;
}

function pedirPrimera(actual: Estado, filtros: FiltrosCatalogo, clave: string): Estado {
  const conLista = actual.fase === "listo";
  return {
    ...actual,
    fase: conLista ? "listo" : "cargando",
    buscando: conLista,
    cargandoMas: false,
    errorMas: null,
    error: null,
    pendiente: { tipo: "primera", filtros, clave },
  };
}

function pedirMas(
  actual: Estado,
  filtros: FiltrosCatalogo,
  clave: string,
  despues: string,
): Estado {
  return {
    ...actual,
    cargandoMas: true,
    errorMas: null,
    pendiente: { tipo: "mas", filtros, clave, despues },
  };
}

function reducir(actual: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case "buscar":
      if (accion.clave === claveVigente(actual) && actual.fase !== "error") return actual;
      return pedirPrimera(actual, accion.filtros, accion.clave);
    case "cargarMas":
      if (
        actual.filtros === null ||
        !actual.siguiente ||
        actual.cargandoMas ||
        actual.fase !== "listo" ||
        actual.buscando
      ) {
        return actual;
      }
      return pedirMas(actual, actual.filtros, actual.clave, actual.siguiente);
    case "reintentar":
      if (actual.filtros === null) return actual;
      if (actual.fase === "error") return pedirPrimera(actual, actual.filtros, actual.clave);
      if (actual.errorMas && actual.siguiente) {
        return pedirMas(actual, actual.filtros, actual.clave, actual.siguiente);
      }
      return actual;
    case "llegaron":
      if (accion.pendiente !== actual.pendiente) return actual;
      if (accion.pendiente.tipo === "primera") {
        return {
          ...actual,
          filtros: accion.pendiente.filtros,
          consulta: accion.pendiente.filtros.q,
          clave: accion.pendiente.clave,
          cursos: accion.respuesta.cursos,
          siguiente: accion.respuesta.siguiente,
          fase: "listo",
          buscando: false,
          pendiente: null,
        };
      }
      return {
        ...actual,
        cursos: [...actual.cursos, ...accion.respuesta.cursos],
        siguiente: accion.respuesta.siguiente,
        cargandoMas: false,
        pendiente: null,
      };
    case "fallo":
      if (accion.pendiente !== actual.pendiente) return actual;
      if (accion.pendiente.tipo === "primera") {
        return {
          ...actual,
          filtros: accion.pendiente.filtros,
          consulta: accion.pendiente.filtros.q,
          clave: accion.pendiente.clave,
          fase: "error",
          buscando: false,
          error: accion.error,
          pendiente: null,
        };
      }
      return { ...actual, cargandoMas: false, errorMas: accion.error, pendiente: null };
  }
}

type PropsCatalogoProvider = { children: ReactNode };

export default function CatalogoProvider({ children }: PropsCatalogoProvider) {
  const { usuario } = useSesion();
  const idUsuario = usuario?.id ?? null;
  const [estado, despachar] = useReducer(reducir, inicial);
  const { pendiente } = estado;

  useEffect(() => {
    if (!pendiente) return;
    const despues = pendiente.tipo === "mas" ? pendiente.despues : null;
    traerCatalogo({ ...pendiente.filtros, despues })
      .then((respuesta) => despachar({ tipo: "llegaron", pendiente, respuesta }))
      .catch((error: unknown) => despachar({ tipo: "fallo", pendiente, error }));
  }, [pendiente]);

  const buscar = useCallback(
    (filtros: FiltrosCatalogo) => {
      despachar({ tipo: "buscar", filtros, clave: claveFiltros(filtros, idUsuario) });
    },
    [idUsuario],
  );
  const cargarMas = useCallback(() => despachar({ tipo: "cargarMas" }), []);
  const reintentar = useCallback(() => despachar({ tipo: "reintentar" }), []);

  const valor = useMemo(
    () => ({ ...estado, buscar, cargarMas, reintentar }),
    [estado, buscar, cargarMas, reintentar],
  );

  return <CatalogoContext value={valor}>{children}</CatalogoContext>;
}
