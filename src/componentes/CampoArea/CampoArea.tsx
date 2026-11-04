import { CircleAlert } from "lucide-react";
import type { Ref } from "react";
import estilos from "./CampoArea.module.css";

type PropsCampoArea = {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
  ayuda?: string;
  maxLongitud?: number;
  filas?: number;
  // letra monoespaciada, para código
  codigo?: boolean;
  deshabilitado?: boolean;
  // para leer el cursor (completar espacios)
  ref?: Ref<HTMLTextAreaElement>;
};

// CampoTexto de varias líneas, con el mismo aspecto (docs/diseno.md, sección 4,
// "Editor (solo web)"). El texto de abajo se enlaza al campo con aria-describedby.
export default function CampoArea({
  id,
  etiqueta,
  valor,
  alCambiar,
  error,
  ayuda,
  maxLongitud,
  filas = 4,
  codigo = false,
  deshabilitado = false,
  ref,
}: PropsCampoArea) {
  const idDescripcion = `${id}-descripcion`;
  const descripcion = error ?? ayuda;
  const clases = [estilos.area, codigo ? estilos.codigo : "", error ? estilos.conError : ""];

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>
        {etiqueta}
      </label>
      <textarea
        ref={ref}
        id={id}
        className={clases.join(" ")}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
        rows={filas}
        maxLength={maxLongitud}
        disabled={deshabilitado}
        spellCheck={!codigo}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripcion ? idDescripcion : undefined}
      />
      {descripcion && (
        <p id={idDescripcion} className={error ? estilos.error : estilos.ayuda}>
          {error && <CircleAlert className={estilos.iconoError} aria-hidden="true" />}
          {descripcion}
        </p>
      )}
    </div>
  );
}
