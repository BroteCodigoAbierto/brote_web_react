import { useId, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { LIMITES_ACTIVIDADES, NOMBRE_LENGUAJE, type LenguajeCodigo } from "../../tipos/contrato.ts";
import {
  limpiarEscrito,
  quitarSangria,
  sangrarLineas,
  type CambioSangria,
} from "../../utilidades/codigo.ts";
import bloque from "../BloqueCodigo/BloqueCodigo.module.css";
import estilos from "./CampoCodigo.module.css";

type PropsCampoCodigo = {
  valor: string;
  alCambiar: (valor: string) => void;
  lenguaje: LenguajeCodigo;
  soloLectura?: boolean;
  // el nombre accesible del campo; el lenguaje se le agrega
  etiqueta: string;
};

const FILAS_MIN = 6;
// Mayús+Tab empieza con un keydown de Shift: estas teclas no quitan la marca de Esc
const MODIFICADORAS = ["Shift", "Control", "Alt", "Meta"];

// Las líneas completas de la selección se reemplazan como un solo cambio. execCommand es la
// única forma de escribir en un textarea que entra al historial de deshacer en Chrome y en
// Firefox; si un día deja de existir, setRangeText escribe igual, sin deshacer (research de
// F12, punto 4).
function escribirSangria(area: HTMLTextAreaElement, cambio: CambioSangria): boolean {
  area.setSelectionRange(cambio.inicio, cambio.fin);
  const escrito =
    cambio.texto === ""
      ? document.execCommand("delete")
      : document.execCommand("insertText", false, cambio.texto);
  if (!escrito) area.setRangeText(cambio.texto, cambio.inicio, cambio.fin);
  area.setSelectionRange(cambio.seleccionInicio, cambio.seleccionFin);
  return escrito;
}

// El campo de código del reto (docs/diseno.md, sección 4): el panel oscuro, sin ajuste de
// línea, que crece con el código. Tab mete dos espacios y Mayús+Tab los quita; después de
// Esc, Tab sale del campo (sección 6, "Teclado").
export default function CampoCodigo({
  valor,
  alCambiar,
  lenguaje,
  soloLectura = false,
  etiqueta,
}: PropsCampoCodigo) {
  const idAyuda = useId();
  // con Esc, el siguiente Tab sale del campo
  const saliendo = useRef(false);
  const nombre = lenguaje === "otro" ? "" : NOMBRE_LENGUAJE[lenguaje];

  function manejarCambio(evento: ChangeEvent<HTMLTextAreaElement>) {
    const area = evento.currentTarget;
    const { texto, cursor } = limpiarEscrito(
      area.value,
      area.selectionStart,
      LIMITES_ACTIVIDADES.respuestaCodigoMax,
    );
    // si el texto cambió, React lo reemplaza y el cursor salta al final: se devuelve a su lugar
    if (texto !== area.value) requestAnimationFrame(() => area.setSelectionRange(cursor, cursor));
    alCambiar(texto);
  }

  function manejarTecla(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === "Escape") {
      saliendo.current = true;
      return;
    }
    if (evento.key === "Tab" && !saliendo.current && !evento.nativeEvent.isComposing) {
      evento.preventDefault();
      const area = evento.currentTarget;
      const { value, selectionStart, selectionEnd } = area;
      const cambio = evento.shiftKey
        ? quitarSangria(value, selectionStart, selectionEnd)
        : sangrarLineas(value, selectionStart, selectionEnd);
      // execCommand avisa del cambio como si se hubiera tecleado; setRangeText, no
      if (cambio && !escribirSangria(area, cambio)) alCambiar(area.value);
      return;
    }
    if (!MODIFICADORAS.includes(evento.key)) saliendo.current = false;
  }

  return (
    <div className={estilos.campo}>
      <div className={estilos.panel}>
        {/* el lenguaje ya va en el nombre del campo */}
        {nombre && (
          <span className={bloque.etiquetaLenguaje} aria-hidden="true">
            {nombre}
          </span>
        )}
        <textarea
          className={`${estilos.entrada} ${soloLectura ? estilos.soloLectura : ""}`}
          value={valor}
          onChange={manejarCambio}
          onKeyDown={soloLectura ? undefined : manejarTecla}
          onBlur={() => {
            saliendo.current = false;
          }}
          readOnly={soloLectura}
          wrap="off"
          rows={Math.max(FILAS_MIN, valor.split("\n").length)}
          maxLength={LIMITES_ACTIVIDADES.respuestaCodigoMax}
          aria-label={nombre ? `${etiqueta}, ${nombre}` : etiqueta}
          aria-describedby={soloLectura ? undefined : idAyuda}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
        />
      </div>
      {/* de solo lectura, Tab ya sale del campo como en cualquier otro */}
      {!soloLectura && (
        <p id={idAyuda} className={estilos.ayuda}>
          Tab agrega dos espacios. Para salir del campo, pulsa Esc y luego Tab.
        </p>
      )}
    </div>
  );
}
