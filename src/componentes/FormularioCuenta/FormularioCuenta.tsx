import type { FormEvent, ReactNode } from "react";
import Marca from "../Marca/Marca.tsx";
import Superficie from "../Superficie/Superficie.tsx";
import estilos from "./FormularioCuenta.module.css";

type PropsFormularioCuenta = {
  titulo: string;
  subtitulo: string;
  // aviso o error general, arriba de los campos
  mensaje?: ReactNode;
  alEnviar: (evento: FormEvent<HTMLFormElement>) => void;
  // campos y botón
  children: ReactNode;
  // enlace a la otra pantalla ("Crear cuenta" / "Entrar")
  pie: ReactNode;
};

// Marco común de "Entrar" y "Crear cuenta" (docs/diseno.md, sección 5). Se
// muestran sin el Layout porque sin sesión no hay nada más a dónde ir.
export default function FormularioCuenta({
  titulo,
  subtitulo,
  mensaje,
  alEnviar,
  children,
  pie,
}: PropsFormularioCuenta) {
  return (
    <main className={estilos.pagina}>
      <Marca tamano="grande" />
      <Superficie className={estilos.tarjeta} elevada>
        <div className={estilos.encabezado}>
          <h1 className={estilos.titulo}>{titulo}</h1>
          <p className={estilos.subtitulo}>{subtitulo}</p>
        </div>
        {mensaje}
        {/* noValidate: los mensajes son los de la spec, no los del navegador */}
        <form className={estilos.formulario} noValidate onSubmit={alEnviar}>
          {children}
        </form>
      </Superficie>
      <p className={estilos.pie}>{pie}</p>
    </main>
  );
}
