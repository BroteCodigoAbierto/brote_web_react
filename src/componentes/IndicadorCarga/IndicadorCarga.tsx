import estilos from "./IndicadorCarga.module.css";

// El indicador de PantallaCarga, pero dentro de una página: el encabezado
// sigue a la vista mientras se traen los datos.
export default function IndicadorCarga() {
  return (
    <div className={estilos.contenedor} role="status" aria-busy="true">
      <span className={estilos.indicador} aria-hidden="true" />
      <span className={estilos.oculto}>Cargando...</span>
    </div>
  );
}
