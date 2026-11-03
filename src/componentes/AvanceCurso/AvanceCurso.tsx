import { CircleCheck } from "lucide-react";
import { textoAvance, textoAvanceAccesible } from "../../utilidades/progreso.ts";
import BarraProgreso from "../BarraProgreso/BarraProgreso.tsx";
import Insignia from "../Insignia/Insignia.tsx";
import estilos from "./AvanceCurso.module.css";

type PropsAvanceCurso = {
  completadas: number;
  total: number;
};

// Avance de un curso (docs/diseno.md, sección 4): "2 de 6 lecciones" con su
// barra y, con todas completadas, "Curso terminado".
export default function AvanceCurso({ completadas, total }: PropsAvanceCurso) {
  const terminado = total > 0 && completadas >= total;

  return (
    <div className={estilos.avance}>
      <div className={estilos.encabezado}>
        <p className={estilos.texto}>{textoAvance(completadas, total)}</p>
        {terminado && (
          <Insignia tono="brote" icono={CircleCheck}>
            Curso terminado
          </Insignia>
        )}
      </div>
      <BarraProgreso
        actual={completadas}
        total={total}
        etiqueta="Avance del curso"
        textoValor={textoAvanceAccesible(completadas, total)}
      />
    </div>
  );
}
