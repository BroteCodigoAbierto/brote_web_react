import { Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import Boton from "../Boton/Boton.tsx";
import estilos from "./ListaEditable.module.css";

type PropsListaEditable<T extends { id: string }> = {
  filas: T[];
  dibujarFila: (fila: T, indice: number) => ReactNode;
  alAgregar: () => void;
  alQuitar: (id: string) => void;
  textoAgregar: string;
  // con estas filas se deshabilitan "Quitar" y el botón de agregar
  minimo: number;
  maximo: number;
  deshabilitada?: boolean;
};

// Filas que el autor agrega y quita: puntos clave, opciones y respuestas aceptadas
// (docs/diseno.md, sección 4, "Editor (solo web)").
export default function ListaEditable<T extends { id: string }>({
  filas,
  dibujarFila,
  alAgregar,
  alQuitar,
  textoAgregar,
  minimo,
  maximo,
  deshabilitada = false,
}: PropsListaEditable<T>) {
  return (
    <div className={estilos.lista}>
      {filas.map((fila, indice) => (
        <div key={fila.id} className={estilos.fila}>
          <div className={estilos.contenido}>{dibujarFila(fila, indice)}</div>
          <button
            type="button"
            className={estilos.quitar}
            aria-label={`Quitar ${indice + 1}`}
            title="Quitar"
            disabled={deshabilitada || filas.length <= minimo}
            onClick={() => alQuitar(fila.id)}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      ))}
      <div>
        <Boton
          variante="secundario"
          tamano="chico"
          icono={Plus}
          deshabilitado={deshabilitada || filas.length >= maximo}
          alPulsar={alAgregar}
        >
          {textoAgregar}
        </Boton>
      </div>
    </div>
  );
}
