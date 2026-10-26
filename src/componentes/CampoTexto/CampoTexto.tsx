import type { ReactNode } from "react";
import estilos from "./CampoTexto.module.css";

type PropsCampoTexto = {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
  tipo?: "text" | "email" | "password";
  autoComplete?: string;
  autoFocus?: boolean;
  // algo que va dentro del recuadro, a la derecha (p. ej. "Mostrar" en la contraseña)
  accesorio?: ReactNode;
};

// Campo con su etiqueta y, debajo, su error. El error se enlaza al campo con
// aria-describedby para que el lector de pantalla lo lea al enfocarlo.
export default function CampoTexto({
  id,
  etiqueta,
  valor,
  alCambiar,
  error,
  tipo = "text",
  autoComplete,
  autoFocus,
  accesorio,
}: PropsCampoTexto) {
  const idError = `${id}-error`;

  return (
    <div className={estilos.campo}>
      <label htmlFor={id} className={estilos.etiqueta}>
        {etiqueta}
      </label>
      <div className={`${estilos.control} ${error ? estilos.conError : ""}`}>
        <input
          id={id}
          className={estilos.entrada}
          type={tipo}
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
        />
        {accesorio}
      </div>
      {error && (
        <p id={idError} className={estilos.error}>
          {error}
        </p>
      )}
    </div>
  );
}
