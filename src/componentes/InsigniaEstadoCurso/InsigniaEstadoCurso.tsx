import { Globe, Hourglass, PencilLine } from "lucide-react";
import type { EstadoCurso } from "../../tipos/contrato.ts";
import Insignia from "../Insignia/Insignia.tsx";

type PropsInsigniaEstadoCurso = {
  estado: EstadoCurso;
};

// docs/diseno.md, sección 5, "Estado de un curso".
export default function InsigniaEstadoCurso({ estado }: PropsInsigniaEstadoCurso) {
  if (estado === "publicado") {
    return (
      <Insignia tono="primario" icono={Globe}>
        Publicado
      </Insignia>
    );
  }
  if (estado === "enRevision") {
    return (
      <Insignia tono="acento" icono={Hourglass}>
        En revisión
      </Insignia>
    );
  }
  return <Insignia icono={PencilLine}>Borrador</Insignia>;
}
