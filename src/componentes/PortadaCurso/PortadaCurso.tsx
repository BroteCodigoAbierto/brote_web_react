import { indiceColorPortada, inicialPortada } from "../../utilidades/cursos.ts";
import estilos from "./PortadaCurso.module.css";

type PropsPortadaCurso = {
  id: string;
  titulo: string;
  tamano: "tarjeta" | "detalle";
};

// Los cursos no tienen imagen: la portada es la inicial del título sobre un
// color que sale del id. Es decorativa, el título siempre va al lado.
export default function PortadaCurso({ id, titulo, tamano }: PropsPortadaCurso) {
  const color = estilos[`color${indiceColorPortada(id) + 1}`];

  return (
    <div className={`${estilos.portada} ${estilos[tamano]} ${color}`} aria-hidden="true">
      {inicialPortada(titulo)}
    </div>
  );
}
