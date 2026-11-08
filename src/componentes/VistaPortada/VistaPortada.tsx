import PortadaCurso from "../PortadaCurso/PortadaCurso.tsx";
import estilos from "./VistaPortada.module.css";

type PropsVistaPortada = {
  idCurso: string;
  titulo: string;
  idPortada: string | null;
};

// La portada en el mapa (docs/diseno.md, "Editor (solo web)"; spec F13, "Portada del
// curso"): cómo se verá en una tarjeta de la web (16:9) y en el detalle (cuadrada).
export default function VistaPortada({ idCurso, titulo, idPortada }: PropsVistaPortada) {
  return (
    <div className={estilos.vistas}>
      <div className={estilos.tarjeta}>
        <PortadaCurso id={idCurso} titulo={titulo} tamano="tarjeta" idPortada={idPortada} />
      </div>
      <PortadaCurso id={idCurso} titulo={titulo} tamano="detalle" idPortada={idPortada} />
    </div>
  );
}
