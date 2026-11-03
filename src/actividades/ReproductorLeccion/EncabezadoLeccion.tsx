import { X } from "lucide-react";
import BarraProgreso from "../../componentes/BarraProgreso/BarraProgreso.tsx";
import estilos from "./ReproductorLeccion.module.css";

type PropsEncabezadoLeccion = {
  alSalir: () => void;
  // sin progreso mientras carga la lección
  progreso?: { actual: number; total: number };
};

// Barra superior de la lección (docs/diseno.md, sección 6): la X y la barra de
// progreso. También se ve mientras carga y en los estados de error.
export default function EncabezadoLeccion({ alSalir, progreso }: PropsEncabezadoLeccion) {
  return (
    <header className={estilos.encabezado}>
      <button
        type="button"
        className={estilos.salir}
        aria-label="Salir de la lección"
        onClick={alSalir}
      >
        <X aria-hidden="true" />
      </button>
      {progreso && <BarraProgreso actual={progreso.actual} total={progreso.total} />}
    </header>
  );
}
