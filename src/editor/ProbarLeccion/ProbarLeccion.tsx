import EncabezadoLeccion from "../../actividades/ReproductorLeccion/EncabezadoLeccion.tsx";
import ReproductorLeccion from "../../actividades/ReproductorLeccion/ReproductorLeccion.tsx";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import ResultadoLeccion from "../../componentes/ResultadoLeccion/ResultadoLeccion.tsx";
import { useReproductor } from "../../hooks/useReproductor.ts";
import estilos from "../../paginas/Leccion/Leccion.module.css";
import type { Actividad, IdiomaCurso } from "../../tipos/contrato.ts";

type PropsProbarLeccion = {
  titulo: string;
  // F14: el del curso, para la voz de escuchar y repetir
  idioma: IdiomaCurso;
  actividades: Actividad[];
  alSalir: () => void;
};

// Recorrer la lección como un alumno, con lo que hay en el lienzo (spec F05). Corre
// en memoria: no pide nada al servidor ni registra progreso, y por eso F03 sigue sin
// abrir lecciones sin publicar (brote_specs, research de F05, punto 12).
export default function ProbarLeccion({
  titulo,
  idioma,
  actividades,
  alSalir,
}: PropsProbarLeccion) {
  const reproductor = useReproductor(actividades);
  const { terminada, aciertos, preguntas, total } = reproductor;

  if (terminada) {
    return (
      <div className={estilos.pantalla}>
        <EncabezadoLeccion alSalir={alSalir} progreso={{ actual: total, total }} />
        <main className={estilos.estado}>
          <ResultadoLeccion
            titulo={titulo}
            aciertos={aciertos}
            preguntas={preguntas}
            alVolver={alSalir}
            textoVolver="Volver al editor"
          />
        </main>
      </div>
    );
  }

  return (
    <ReproductorLeccion
      actividades={actividades}
      idioma={idioma}
      reproductor={reproductor}
      alSalir={alSalir}
      aviso={<Aviso tono="info" texto="Modo de prueba: esto no cuenta como progreso." />}
    />
  );
}
