import { CircleAlert } from "lucide-react";
import base from "../CampoTexto/CampoTexto.module.css";
import estilos from "./CampoSelector.module.css";

type OpcionSelector = {
  valor: string;
  texto: string;
};

type PropsCampoSelector = {
  id: string;
  etiqueta: string;
  valor: string | null;
  opciones: OpcionSelector[];
  // la primera opción, sin valor
  textoVacio: string;
  alCambiar: (valor: string | null) => void;
  error?: string;
  // F12: como en CampoTexto
  ayuda?: string;
  // inválido sin mensaje propio: el error se muestra en otro lado
  invalido?: boolean;
  deshabilitado?: boolean;
};

// Selector nativo con el aspecto de CampoTexto (docs/diseno.md, sección 4, "Editor (solo web)").
export default function CampoSelector({
  id,
  etiqueta,
  valor,
  opciones,
  textoVacio,
  alCambiar,
  error,
  ayuda,
  invalido = false,
  deshabilitado = false,
}: PropsCampoSelector) {
  const idDescripcion = `${id}-descripcion`;
  const descripcion = error ?? ayuda;

  return (
    <div className={base.campo}>
      <label htmlFor={id} className={base.etiqueta}>
        {etiqueta}
      </label>
      <div className={`${base.control} ${error ? base.conError : ""}`}>
        <select
          id={id}
          className={estilos.selector}
          value={valor ?? ""}
          onChange={(evento) => alCambiar(evento.target.value || null)}
          disabled={deshabilitado}
          aria-invalid={error || invalido ? true : undefined}
          aria-describedby={descripcion ? idDescripcion : undefined}
        >
          <option value="">{textoVacio}</option>
          {opciones.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
        </select>
      </div>
      {descripcion && (
        <p id={idDescripcion} className={error ? base.error : base.ayuda}>
          {error && <CircleAlert className={base.iconoError} aria-hidden="true" />}
          {descripcion}
        </p>
      )}
    </div>
  );
}
