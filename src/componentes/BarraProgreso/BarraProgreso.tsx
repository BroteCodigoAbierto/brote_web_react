import estilos from "./BarraProgreso.module.css";

type PropsBarraProgreso = {
  // actividades ya pasadas con "Continuar"
  actual: number;
  total: number;
};

// Barra de progreso de la lección (docs/diseno.md, secciones 4 y 6): vacía en
// la primera actividad y llena en la pantalla final.
export default function BarraProgreso({ actual, total }: PropsBarraProgreso) {
  const proporcion = total > 0 ? Math.min(actual / total, 1) : 0;
  const texto = actual >= total ? "Lección completada" : `Actividad ${actual + 1} de ${total}`;

  return (
    <div
      className={estilos.barra}
      role="progressbar"
      aria-label="Progreso de la lección"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={actual}
      aria-valuetext={texto}
    >
      <div className={estilos.relleno} style={{ width: `${proporcion * 100}%` }} />
    </div>
  );
}
