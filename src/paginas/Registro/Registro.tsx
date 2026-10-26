import { Link } from "react-router";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoContrasena from "../../componentes/CampoContrasena/CampoContrasena.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import FormularioCuenta from "../../componentes/FormularioCuenta/FormularioCuenta.tsx";
import MensajeFormulario from "../../componentes/MensajeFormulario/MensajeFormulario.tsx";
import { useFormulario } from "../../hooks/useFormulario.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import { validarCrearCuenta } from "../../validacion/cuenta.ts";

// Al crear la cuenta la sesión queda iniciada y SoloSinSesion lleva al inicio
// (a esta página se llega sin la página pedida en el state).
export default function Registro() {
  const { crearCuenta } = useSesion();
  const { valores, errores, general, enviando, cambiar, manejarEnvio } = useFormulario({
    inicial: { nombre: "", correo: "", contrasena: "" },
    validar: validarCrearCuenta,
    enviar: crearCuenta,
  });

  return (
    <FormularioCuenta
      titulo="Crear cuenta"
      mensaje={general && <MensajeFormulario texto={general} />}
      alEnviar={manejarEnvio}
      pie={
        <>
          ¿Ya tienes cuenta? <Link to="/entrar">Entrar</Link>
        </>
      }
    >
      <CampoTexto
        id="nombre"
        etiqueta="Nombre para mostrar"
        autoComplete="name"
        valor={valores.nombre}
        alCambiar={(valor) => cambiar("nombre", valor)}
        error={errores.nombre}
      />
      <CampoTexto
        id="correo"
        etiqueta="Correo"
        tipo="email"
        autoComplete="email"
        valor={valores.correo}
        alCambiar={(valor) => cambiar("correo", valor)}
        error={errores.correo}
      />
      <CampoContrasena
        id="contrasena"
        etiqueta="Contraseña"
        autoComplete="new-password"
        valor={valores.contrasena}
        alCambiar={(valor) => cambiar("contrasena", valor)}
        error={errores.contrasena}
      />
      <Boton tipo="submit" enviando={enviando} textoEnviando="Creando cuenta...">
        Crear cuenta
      </Boton>
    </FormularioCuenta>
  );
}
