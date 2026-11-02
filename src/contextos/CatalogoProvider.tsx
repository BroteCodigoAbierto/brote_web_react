import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { traerCatalogo } from "../servicios/cursos.ts";
import type { RespuestaCatalogo } from "../tipos/contrato.ts";
import { CatalogoContext, type EstadoCatalogo } from "./CatalogoContext.ts";

// El pedido que falta hacer o que está en camino. Cada respuesta trae el
// pedido que la originó (con su consulta) y solo cuenta si sigue siendo el
// vigente: así lo que se ve corresponde siempre al último texto escrito.
type Pendiente =
  { tipo: "primera"; consulta: string } | { tipo: "mas"; consulta: string; despues: string };

type Estado = EstadoCatalogo & { pendiente: Pendiente | null };

type Accion =
  | { tipo: "buscar"; consulta: string }
  | { tipo: "cargarMas" }
  | { tipo: "reintentar" }
  | { tipo: "llegaron"; pendiente: Pendiente; respuesta: RespuestaCatalogo }
  | { tipo: "fallo"; pendiente: Pendiente; error: unknown };

const inicial: Estado = {
  consulta: null,
  cursos: [],
  siguiente: null,
  fase: "cargando",
  buscando: false,
  cargandoMas: false,
  errorMas: null,
  error: null,
  pendiente: null,
};

// Pide desde el primer curso. Si hay una lista en pantalla se queda, atenuada,
// hasta que llegan los resultados (spec F02, "Buscando").
function pedirPrimera(actual: Estado, consulta: string): Estado {
  const conLista = actual.fase === "listo";
  return {
    ...actual,
    consulta,
    fase: conLista ? "listo" : "cargando",
    buscando: conLista,
    cargandoMas: false,
    errorMas: null,
    error: null,
    pendiente: { tipo: "primera", consulta },
  };
}

function pedirMas(actual: Estado, consulta: string, despues: string): Estado {
  return {
    ...actual,
    cargandoMas: true,
    errorMas: null,
    pendiente: { tipo: "mas", consulta, despues },
  };
}

function reducir(actual: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case "buscar":
      // al volver del detalle la consulta es la misma: no se pide otra vez
      if (accion.consulta === actual.consulta && actual.fase !== "error") return actual;
      return pedirPrimera(actual, accion.consulta);
    case "cargarMas":
      // una sola carga a la vez, y nunca con cursos de una búsqueda anterior
      if (
        actual.consulta === null ||
        !actual.siguiente ||
        actual.cargandoMas ||
        actual.fase !== "listo" ||
        actual.buscando
      ) {
        return actual;
      }
      return pedirMas(actual, actual.consulta, actual.siguiente);
    case "reintentar":
      if (actual.consulta === null) return actual;
      if (actual.fase === "error") return pedirPrimera(actual, actual.consulta);
      if (actual.errorMas && actual.siguiente) {
        return pedirMas(actual, actual.consulta, actual.siguiente);
      }
      return actual;
    case "llegaron":
      if (accion.pendiente !== actual.pendiente) return actual;
      if (accion.pendiente.tipo === "primera") {
        return {
          ...actual,
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
        return { ...actual, fase: "error", buscando: false, error: accion.error, pendiente: null };
      }
      // los cursos ya cargados siguen en pantalla
      return { ...actual, cargandoMas: false, errorMas: accion.error, pendiente: null };
  }
}

type PropsCatalogoProvider = { children: ReactNode };

export default function CatalogoProvider({ children }: PropsCatalogoProvider) {
  const [estado, despachar] = useReducer(reducir, inicial);
  const { pendiente } = estado;

  useEffect(() => {
    if (!pendiente) return;
    const despues = pendiente.tipo === "mas" ? pendiente.despues : null;
    traerCatalogo({ q: pendiente.consulta, despues })
      .then((respuesta) => despachar({ tipo: "llegaron", pendiente, respuesta }))
      .catch((error: unknown) => despachar({ tipo: "fallo", pendiente, error }));
  }, [pendiente]);

  const buscar = useCallback((consulta: string) => despachar({ tipo: "buscar", consulta }), []);
  const cargarMas = useCallback(() => despachar({ tipo: "cargarMas" }), []);
  const reintentar = useCallback(() => despachar({ tipo: "reintentar" }), []);

  // `pendiente` viaja en el valor, pero ValorCatalogo no lo expone
  const valor = useMemo(
    () => ({ ...estado, buscar, cargarMas, reintentar }),
    [estado, buscar, cargarMas, reintentar],
  );

  return <CatalogoContext value={valor}>{children}</CatalogoContext>;
}
