import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import estilos from "./EstadoVacio.module.css";

type PropsEstadoVacio = {
  icono: LucideIcon;
  titulo: string;
  texto?: string;
  // botón o enlace para salir del estado
  accion?: ReactNode;
  tono?: "neutro" | "error";
  // el título se anuncia en cuanto aparece (errores)
  anunciar?: boolean;
};

// Lo que se ve cuando no hay datos que mostrar: vacío, sin resultados, error
// o página que no existe (docs/diseno.md, sección 5).
export default function EstadoVacio({
  icono: Icono,
  titulo,
  texto,
  accion,
  tono = "neutro",
  anunciar = false,
}: PropsEstadoVacio) {
  return (
    <div className={`${estilos.estado} ${estilos[tono]}`}>
      <span className={estilos.circulo} aria-hidden="true">
        <Icono className={estilos.icono} strokeWidth={1.75} />
      </span>
      <div className={estilos.textos}>
        <p className={estilos.titulo} role={anunciar ? "alert" : undefined}>
          {titulo}
        </p>
        {texto && <p className={estilos.texto}>{texto}</p>}
      </div>
      {accion}
    </div>
  );
}
