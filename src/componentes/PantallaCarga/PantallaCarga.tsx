import IndicadorCarga from "../IndicadorCarga/IndicadorCarga.tsx";

// Mientras se comprueba si hay sesión: así "Entrar" no aparece ni un instante.
export default function PantallaCarga() {
  return <IndicadorCarga pantallaCompleta />;
}
