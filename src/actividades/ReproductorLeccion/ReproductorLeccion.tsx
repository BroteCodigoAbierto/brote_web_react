import type { ComponentType } from "react";
import type { Reproductor } from "../../hooks/useReproductor.ts";
import type { Actividad } from "../../tipos/contrato.ts";
import { registroActividades } from "../registro.ts";
import type { ResultadoActividad } from "../tipos.ts";
import EncabezadoLeccion from "./EncabezadoLeccion.tsx";
import estilos from "./ReproductorLeccion.module.css";

type PropsReproductorLeccion = {
  // ya sin los tipos que este cliente no conoce
  actividades: Actividad[];
  reproductor: Reproductor;
  alSalir: () => void;
};

// Lo que el reproductor sabe de cualquier actividad: su componente recibe la
// actividad y avisa al terminar.
type ComponenteActividad = ComponentType<{
  actividad: Actividad;
  alInteractuar: () => void;
  alTerminar: (resultado: ResultadoActividad) => void;
}>;

// Reproductor de lecciones (spec F03; docs/diseno.md, sección 6). No sabe nada
// de ningún tipo: busca el componente de la actividad actual en el registro.
export default function ReproductorLeccion({
  actividades,
  reproductor,
  alSalir,
}: PropsReproductorLeccion) {
  const { indice, total, interactuar, terminarActividad } = reproductor;
  const actividad = actividades[indice];
  if (!actividad) return null;
  // TypeScript no relaciona el tipo de la actividad con el de su componente
  const Componente = registroActividades[actividad.tipo] as ComponenteActividad;

  return (
    <div className={estilos.reproductor}>
      <EncabezadoLeccion alSalir={alSalir} progreso={{ actual: indice, total }} />
      <main className={estilos.contenido}>
        {/* key: cada actividad empieza sin el estado de la anterior */}
        <Componente
          key={indice}
          actividad={actividad}
          alInteractuar={interactuar}
          alTerminar={terminarActividad}
        />
      </main>
    </div>
  );
}
