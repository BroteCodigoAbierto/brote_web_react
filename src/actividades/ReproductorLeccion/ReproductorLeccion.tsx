import { useState, type ReactNode } from "react";
import { ContextoImagenes } from "../../contextos/ContextoImagenes.ts";
import { usePrecargarImagenes } from "../../hooks/usePrecargarImagenes.ts";
import type { Reproductor } from "../../hooks/useReproductor.ts";
import type { Actividad } from "../../tipos/contrato.ts";
import { registroActividades } from "../registro.ts";
import type { ComponenteActividad } from "../tipos.ts";
import EncabezadoLeccion from "./EncabezadoLeccion.tsx";
import estilos from "./ReproductorLeccion.module.css";

type PropsReproductorLeccion = {
  // ya sin los tipos que este cliente no conoce
  actividades: Actividad[];
  reproductor: Reproductor;
  alSalir: () => void;
  // debajo del encabezado, en el modo de prueba del editor (F05)
  aviso?: ReactNode;
};

// Reproductor de lecciones (spec F03; docs/diseno.md, sección 6). No sabe nada
// de ningún tipo: busca el componente de la actividad actual en el registro. Desde F13,
// trae todas las imágenes al abrir la lección y, al pasar de actividad, vuelve a pedir las
// que no cargaron (brote_specs, research de F13, punto 11).
export default function ReproductorLeccion({
  actividades,
  reproductor,
  alSalir,
  aviso,
}: PropsReproductorLeccion) {
  const { indice, total, interactuar, terminarActividad } = reproductor;
  usePrecargarImagenes(actividades);
  // sube al cambiar de actividad (el estado del render anterior, sin efecto)
  const [intento, setIntento] = useState({ indice, valor: 0 });
  if (intento.indice !== indice) setIntento({ indice, valor: intento.valor + 1 });
  const actividad = actividades[indice];
  if (!actividad) return null;
  // TypeScript no relaciona el tipo de la actividad con el de su componente
  const Componente = registroActividades[actividad.tipo] as ComponenteActividad;

  return (
    <div className={estilos.reproductor}>
      <EncabezadoLeccion alSalir={alSalir} progreso={{ actual: indice, total }} />
      {aviso && <div className={estilos.aviso}>{aviso}</div>}
      <main className={estilos.contenido}>
        <ContextoImagenes value={{ intento: intento.valor }}>
          {/* key: cada actividad empieza sin el estado de la anterior */}
          <Componente
            key={indice}
            actividad={actividad}
            alInteractuar={interactuar}
            alTerminar={terminarActividad}
          />
        </ContextoImagenes>
      </main>
    </div>
  );
}
