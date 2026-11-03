import estilos from "./BarraProgreso.module.css";

type PropsBarraProgreso = {
  // en la lección, actividades ya pasadas con "Continuar"; en un curso, lecciones completadas
  actual: number;
  total: number;
  // lo que anuncia el lector de pantalla; sin ellas, lo de la lección (F03)
  etiqueta?: string;
  textoValor?: string;
};

// Barra de progreso de la lección y del avance de un curso (docs/diseno.md,
// secciones 4 y 6): vacía al empezar y llena al terminar.
export default function BarraProgreso({
  actual,
  total,
  etiqueta = "Progreso de la lección",
  textoValor,
}: PropsBarraProgreso) {
  const proporcion = total > 0 ? Math.min(actual / total, 1) : 0;
  const texto =
    textoValor ?? (actual >= total ? "Lección completada" : `Actividad ${actual + 1} de ${total}`);

  return (
    <div
      className={estilos.barra}
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={actual}
      aria-valuetext={texto}
    >
      <div className={estilos.relleno} style={{ width: `${proporcion * 100}%` }} />
    </div>
  );
}
