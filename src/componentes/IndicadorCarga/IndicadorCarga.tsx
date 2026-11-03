import estilos from "./IndicadorCarga.module.css";

type PropsIndicadorCarga = {
  // ocupa toda la pantalla (mientras se comprueba la sesión)
  pantallaCompleta?: boolean;
};

// Anillo de carga dentro de una página o a pantalla completa.
export default function IndicadorCarga({ pantallaCompleta = false }: PropsIndicadorCarga) {
  return (
    <div
      className={`${estilos.contenedor} ${pantallaCompleta ? estilos.pantallaCompleta : ""}`}
      role="status"
      aria-busy="true"
    >
      <span className={estilos.anillo} aria-hidden="true" />
      <span className="oculto">Cargando...</span>
    </div>
  );
}
