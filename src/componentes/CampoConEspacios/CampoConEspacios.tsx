import { Plus } from "lucide-react";
import { useRef } from "react";
import { MARCA_ESPACIO } from "../../tipos/contrato.ts";
import Boton from "../Boton/Boton.tsx";
import CampoArea from "../CampoArea/CampoArea.tsx";
import estilos from "./CampoConEspacios.module.css";

type PropsCampoConEspacios = {
  id: string;
  valor: string;
  alCambiar: (valor: string) => void;
  ayuda: string;
  error?: string;
  maxLongitud: number;
  deshabilitado?: boolean;
};

// El texto con espacios y su botón "Agregar espacio" (docs/diseno.md, sección 4, "Editor (solo
// web)"). Lo usan completar espacios y banco de palabras.
export default function CampoConEspacios({
  id,
  valor,
  alCambiar,
  ayuda,
  error,
  maxLongitud,
  deshabilitado = false,
}: PropsCampoConEspacios) {
  const area = useRef<HTMLTextAreaElement>(null);

  // Escribe la marca donde está el cursor y lo deja justo después.
  function agregarEspacio() {
    const campo = area.current;
    const inicio = campo?.selectionStart ?? valor.length;
    const fin = campo?.selectionEnd ?? valor.length;
    const nuevo = valor.slice(0, inicio) + MARCA_ESPACIO + valor.slice(fin);
    if (Array.from(nuevo).length > maxLongitud) return;
    alCambiar(nuevo);
    const cursor = inicio + MARCA_ESPACIO.length;
    requestAnimationFrame(() => {
      campo?.focus();
      campo?.setSelectionRange(cursor, cursor);
    });
  }

  return (
    <div className={estilos.campo}>
      <CampoArea
        ref={area}
        id={id}
        etiqueta="Texto"
        ayuda={ayuda}
        valor={valor}
        alCambiar={alCambiar}
        error={error}
        maxLongitud={maxLongitud}
        codigo
        deshabilitado={deshabilitado}
      />
      <div>
        <Boton
          variante="secundario"
          tamano="chico"
          icono={Plus}
          deshabilitado={deshabilitado}
          alPulsar={agregarEspacio}
        >
          Agregar espacio
        </Boton>
      </div>
    </div>
  );
}
