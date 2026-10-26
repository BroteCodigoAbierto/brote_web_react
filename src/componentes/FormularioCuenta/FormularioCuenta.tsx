import type { FormEvent, ReactNode } from "react";
import estilos from "./FormularioCuenta.module.css";

type PropsFormularioCuenta = {
  titulo: string;
  // aviso o error general, arriba de los campos
  mensaje?: ReactNode;
  alEnviar: (evento: FormEvent<HTMLFormElement>) => void;
  // campos y botón
  children: ReactNode;
  // enlace a la otra pantalla ("Crear cuenta" / "Entrar")
  pie: ReactNode;
};

// Marco común de "Entrar" y "Crear cuenta". Se muestran sin el Layout porque
// sin sesión no hay nada más a dónde ir.
export default function FormularioCuenta({
  titulo,
  mensaje,
  alEnviar,
  children,
  pie,
}: PropsFormularioCuenta) {
  return (
    <main className={estilos.pagina}>
      <div className={estilos.tarjeta}>
        <p className={estilos.marca}>Brote</p>
        <h1 className={estilos.titulo}>{titulo}</h1>
        {mensaje}
        {/* noValidate: los mensajes son los de la spec, no los del navegador */}
        <form className={estilos.formulario} noValidate onSubmit={alEnviar}>
          {children}
        </form>
        <p className={estilos.pie}>{pie}</p>
      </div>
    </main>
  );
}
