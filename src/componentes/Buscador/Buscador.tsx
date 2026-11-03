import { Search, X } from "lucide-react";
import { useRef } from "react";
import { LIMITES_CATALOGO } from "../../tipos/contrato.ts";
import estilos from "./Buscador.module.css";

type PropsBuscador = {
  valor: string;
  alCambiar: (valor: string) => void;
  // hay una búsqueda en camino: la lista anterior sigue en pantalla
  buscando: boolean;
};

export default function Buscador({ valor, alCambiar, buscando }: PropsBuscador) {
  const entrada = useRef<HTMLInputElement>(null);

  function limpiar() {
    alCambiar("");
    entrada.current?.focus();
  }

  return (
    <div className={estilos.buscador}>
      <Search className={estilos.lupa} aria-hidden="true" />
      <input
        ref={entrada}
        type="search"
        className={estilos.entrada}
        aria-label="Buscar cursos"
        placeholder="Busca por título, tema o autor"
        maxLength={LIMITES_CATALOGO.busquedaMax}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
      />
      {/* la región existe siempre para que el lector de pantalla anuncie el cambio */}
      <span role="status" className={estilos.estado}>
        {buscando && (
          <>
            <span className={estilos.indicador} aria-hidden="true" />
            <span className="oculto">Buscando...</span>
          </>
        )}
      </span>
      {valor !== "" && (
        <button
          type="button"
          className={estilos.limpiar}
          aria-label="Limpiar búsqueda"
          onClick={limpiar}
        >
          <X className={estilos.iconoLimpiar} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
