import { CircleAlert, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import estilos from "./CampoTexto.module.css";

type PropsCampoTexto = {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
  ayuda?: string;
  icono?: LucideIcon;
  tipo?: "text" | "email" | "password";
  autoComplete?: string;
  autoFocus?: boolean;
  maxLongitud?: number;
  deshabilitado?: boolean;
  // algo que va dentro del recuadro, a la derecha (p. ej. "Mostrar" en la contraseña)
  accesorio?: ReactNode;
};

// Campo con su etiqueta y, debajo, su error o ayuda. El texto de abajo se
// enlaza al campo con aria-describedby para que el lector de pantalla lo lea
// al enfocarlo (docs/diseno.md, sección 4).
export default function CampoTexto({
  id,
  etiqueta,
  valor,
  alCambiar,
  error,
  ayuda,
  icono: Icono,
  tipo = "text",
  autoComplete,
  autoFocus,
  maxLongitud,
  deshabilitado = false,
  accesorio,
}: PropsCampoTexto) {
  const idDescripcion = `${id}-descripcion`;
  const descripcion = error ?? ayuda;

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>
        {etiqueta}
      </label>
      <div className={`${estilos.control} ${error ? estilos.conError : ""}`}>
        {Icono && <Icono className={estilos.icono} aria-hidden="true" />}
        <input
          id={id}
          className={estilos.entrada}
          type={tipo}
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLongitud}
          disabled={deshabilitado}
          aria-invalid={error ? true : undefined}
          aria-describedby={descripcion ? idDescripcion : undefined}
        />
        {accesorio}
      </div>
      {descripcion && (
        <p id={idDescripcion} className={error ? estilos.error : estilos.ayuda}>
          {error && <CircleAlert className={estilos.iconoError} aria-hidden="true" />}
          {descripcion}
        </p>
      )}
    </div>
  );
}
