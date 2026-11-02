import { use } from "react";
import { CatalogoContext, type ValorCatalogo } from "../contextos/CatalogoContext.ts";
import { leerErrorDeCarga } from "../servicios/cursos.ts";

export type ValorUseCatalogo = ValorCatalogo & {
  // lo que se muestra si falló la primera carga o la de "Ver más"
  mensajeError: string | null;
};

export function useCatalogo(): ValorUseCatalogo {
  const valor = use(CatalogoContext);
  if (!valor) throw new Error("useCatalogo debe usarse dentro de <CatalogoProvider>");
  const fallo = valor.error ?? valor.errorMas;
  return { ...valor, mensajeError: fallo ? leerErrorDeCarga(fallo) : null };
}
