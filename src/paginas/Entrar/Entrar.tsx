import { ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoContrasena from "../../componentes/CampoContrasena/CampoContrasena.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import FormularioCuenta from "../../componentes/FormularioCuenta/FormularioCuenta.tsx";
import { useFormulario } from "../../hooks/useFormulario.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import { MENSAJES_CUENTA } from "../../tipos/contrato.ts";
import { validarEntrar } from "../../validacion/cuenta.ts";

// Al entrar no se navega desde aquí: SoloSinSesion lleva a la página que se
// quería abrir en cuanto la sesión cambia.
export default function Entrar() {
  const { entrar, aviso } = useSesion();
  const { valores, errores, general, enviando, cambiar, manejarEnvio } = useFormulario({
    inicial: { correo: "", contrasena: "" },
    validar: validarEntrar,
    enviar: entrar,
  });

  let mensaje = null;
  if (general) mensaje = <Aviso texto={general} />;
  else if (aviso === "sesionTerminada") {
    mensaje = <Aviso tono="info" texto={MENSAJES_CUENTA.sesionTerminada} />;
  }

  return (
    <FormularioCuenta
      titulo="Entrar"
      subtitulo="Qué bueno verte de nuevo. Sigue donde te quedaste."
      mensaje={mensaje}
      alEnviar={manejarEnvio}
      pie={
        <>
          ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
        </>
      }
    >
      <CampoTexto
        id="correo"
        etiqueta="Correo"
        icono={Mail}
        tipo="email"
        autoComplete="email"
        valor={valores.correo}
        alCambiar={(valor) => cambiar("correo", valor)}
        error={errores.correo}
      />
      <CampoContrasena
        id="contrasena"
        etiqueta="Contraseña"
        autoComplete="current-password"
        valor={valores.contrasena}
        alCambiar={(valor) => cambiar("contrasena", valor)}
        error={errores.contrasena}
      />
      <Boton tipo="submit" iconoFinal={ArrowRight} enviando={enviando} textoEnviando="Entrando...">
        Entrar
      </Boton>
    </FormularioCuenta>
  );
}
