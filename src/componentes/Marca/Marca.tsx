import { Sprout } from "lucide-react";
import estilos from "./Marca.module.css";

type PropsMarca = {
  tamano?: "normal" | "grande";
  nombre?: string;
};

// Logotipo de Brote: el brote en un círculo con degradado y el nombre
// (docs/diseno.md, sección 4).
export default function Marca({ tamano = "normal", nombre = "Brote" }: PropsMarca) {
  return (
    <span className={`${estilos.marca} ${estilos[tamano]}`}>
      <span className={estilos.simbolo} aria-hidden="true">
        <Sprout className={estilos.icono} strokeWidth={2.25} />
      </span>
      <span className={estilos.nombre}>{nombre}</span>
    </span>
  );
}
