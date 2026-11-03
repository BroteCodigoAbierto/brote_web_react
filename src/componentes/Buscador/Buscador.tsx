import { LIMITES_CATALOGO } from "../../tipos/contrato.ts";
import estilos from "./Buscador.module.css";

type PropsBuscador = {
  valor: string;
  alCambiar: (valor: string) => void;
  // hay una búsqueda en camino: la lista anterior sigue en pantalla
  buscando: boolean;
};

export default function Buscador({ valor, alCambiar, buscando }: PropsBuscador) {
  return (
    <div className={estilos.buscador}>
      <input
        type="search"
        className={estilos.entrada}
        aria-label="Buscar cursos"
        placeholder="Buscar cursos"
        maxLength={LIMITES_CATALOGO.busquedaMax}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
      />
      {/* la región existe siempre para que el lector de pantalla anuncie el cambio */}
      <span role="status" className={estilos.estado}>
        {buscando && (
          <>
            <span className={estilos.indicador} aria-hidden="true" />
            <span className={estilos.oculto}>Buscando...</span>
          </>
        )}
      </span>
    </div>
  );
}
