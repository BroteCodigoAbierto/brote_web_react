import { CircleCheck, PartyPopper } from "lucide-react";
import { useEffect, useRef } from "react";
import Boton from "../Boton/Boton.tsx";
import Insignia from "../Insignia/Insignia.tsx";
import estilos from "./ResultadoLeccion.module.css";

type PropsResultadoLeccion = {
  titulo: string;
  aciertos: number;
  preguntas: number;
  alVolver: () => void;
};

// Fin de la lección (docs/diseno.md, sección 6): celebración breve y sin
// sonido, y cuántas acertó si la lección tiene preguntas.
export default function ResultadoLeccion({
  titulo,
  aciertos,
  preguntas,
  alVolver,
}: PropsResultadoLeccion) {
  const encabezado = useRef<HTMLHeadingElement>(null);

  // el lector de pantalla empieza por aquí
  useEffect(() => {
    encabezado.current?.focus();
  }, []);

  return (
    <section className={estilos.resultado}>
      <span className={estilos.circulo} aria-hidden="true">
        <PartyPopper className={estilos.icono} strokeWidth={1.75} />
      </span>
      <div className={estilos.textos}>
        <h1 ref={encabezado} tabIndex={-1} className={estilos.titulo}>
          ¡Lección completada!
        </h1>
        <p className={estilos.leccion}>{titulo}</p>
      </div>
      {preguntas > 0 && (
        <div className={estilos.aciertos}>
          <Insignia tono="brote" icono={CircleCheck}>
            Acertaste {aciertos} de {preguntas}
          </Insignia>
        </div>
      )}
      <Boton anchoCompleto alPulsar={alVolver}>
        Volver al curso
      </Boton>
    </section>
  );
}
