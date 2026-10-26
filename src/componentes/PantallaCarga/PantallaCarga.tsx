import estilos from "./PantallaCarga.module.css";

// Mientras se comprueba si hay sesión: así "Entrar" no aparece ni un instante.
export default function PantallaCarga() {
  return (
    <div className={estilos.pantalla} role="status" aria-busy="true">
      <span className={estilos.indicador} aria-hidden="true" />
      <span className={estilos.oculto}>Cargando...</span>
    </div>
  );
}
