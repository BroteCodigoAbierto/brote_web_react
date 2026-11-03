import { CircleCheck, PartyPopper } from "lucide-react";
import { useEffect, useRef } from "react";
import Aviso from "../Aviso/Aviso.tsx";
import Boton from "../Boton/Boton.tsx";
import Insignia from "../Insignia/Insignia.tsx";
import estilos from "./ResultadoLeccion.module.css";

// Estado del progreso de la lección (spec F04). Los mismos valores que en el
// móvil; la web nunca produce "sinConexion": sin red se ve como "error".
export type EstadoGuardado = "guardando" | "guardado" | "error" | "sinConexion" | "noDisponible";

type PropsResultadoLeccion = {
  titulo: string;
  aciertos: number;
  preguntas: number;
  alVolver: () => void;
  // sin él no se muestra nada del guardado (p. ej. una vista previa)
  guardado?: EstadoGuardado;
  alReintentar?: () => void;
};

const AVISOS_GUARDADO = {
  error: "No se pudo guardar tu progreso.",
  sinConexion: "Sin conexión. Tu progreso no se guardó.",
  noDisponible: "Esta lección ya no está disponible. Tu progreso no se guardó.",
} as const;

// Fin de la lección (docs/diseno.md, sección 6): celebración breve y sin
// sonido, cuántas acertó si la lección tiene preguntas y si se guardó el
// progreso. "Volver al curso" espera a que termine de guardarse.
export default function ResultadoLeccion({
  titulo,
  aciertos,
  preguntas,
  alVolver,
  guardado,
  alReintentar,
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
      {guardado && (
        <div className={estilos.guardado} aria-live="polite">
          <EstadoDelGuardado guardado={guardado} alReintentar={alReintentar} />
        </div>
      )}
      <Boton
        anchoCompleto
        enviando={guardado === "guardando"}
        textoEnviando="Volver al curso"
        alPulsar={alVolver}
      >
        Volver al curso
      </Boton>
    </section>
  );
}

type PropsEstadoDelGuardado = {
  guardado: EstadoGuardado;
  alReintentar?: () => void;
};

function EstadoDelGuardado({ guardado, alReintentar }: PropsEstadoDelGuardado) {
  if (guardado === "guardando") {
    return (
      <p className={estilos.guardando}>
        <span className={estilos.indicador} aria-hidden="true" />
        Guardando tu progreso…
      </p>
    );
  }
  if (guardado === "guardado") {
    return (
      <p className={estilos.listo}>
        <CircleCheck className={estilos.iconoEstado} aria-hidden="true" />
        Progreso guardado
      </p>
    );
  }
  return (
    <div className={estilos.problema}>
      <Aviso tono="error" texto={AVISOS_GUARDADO[guardado]} />
      {guardado !== "noDisponible" && (
        <Boton variante="secundario" tamano="chico" alPulsar={alReintentar}>
          Reintentar
        </Boton>
      )}
    </div>
  );
}
