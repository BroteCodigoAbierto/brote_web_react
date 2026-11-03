import { tipoLineaCodigo } from "../../utilidades/actividades.ts";
import estilos from "./BloqueCodigo.module.css";

type PropsBloqueCodigo = {
  codigo: string;
};

// Código de una actividad (docs/diseno.md, sección 4): panel oscuro, una fila
// por línea y las líneas de diff resaltadas. Cada línea va como texto, nunca
// como HTML, y el bloque se desplaza hacia los lados en vez de cortarlas.
export default function BloqueCodigo({ codigo }: PropsBloqueCodigo) {
  return (
    // tabIndex: con el teclado también se puede desplazar
    <pre className={estilos.bloque} tabIndex={0}>
      <code>
        {codigo.split("\n").map((linea, i) => (
          <span key={i} className={`${estilos.linea} ${estilos[tipoLineaCodigo(linea)]}`}>
            {/* una línea vacía conserva su alto */}
            {linea === "" ? " " : linea}
          </span>
        ))}
      </code>
    </pre>
  );
}
