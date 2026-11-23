import { Mail, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router";
import Aviso from "../../componentes/Aviso/Aviso.tsx";
import Boton from "../../componentes/Boton/Boton.tsx";
import CampoContrasena from "../../componentes/CampoContrasena/CampoContrasena.tsx";
import CampoTexto from "../../componentes/CampoTexto/CampoTexto.tsx";
import FormularioCuenta from "../../componentes/FormularioCuenta/FormularioCuenta.tsx";
import { useFormulario } from "../../hooks/useFormulario.ts";
import { useSesion } from "../../hooks/useSesion.ts";
import { validarCrearCuenta } from "../../validacion/cuenta.ts";

// Al crear la cuenta la sesión queda iniciada y SoloSinSesion lleva al inicio
// (a esta página se llega sin la página pedida en el state).
export default function Registro() {
  const { crearCuenta } = useSesion();
  const { valores, errores, general, enviando, cambiar, manejarEnvio } = useFormulario({
    inicial: { nombre: "", correo: "", contrasena: "", confirmacion: "" },
    validar: validarCrearCuenta,
    enviar: ({ nombre, correo, contrasena }) => crearCuenta({ nombre, correo, contrasena }),
  });

  return (
    <FormularioCuenta
      titulo="Crear cuenta"
      subtitulo="Una sola cuenta para aprender y para crear tus propios cursos."
      mensaje={general && <Aviso texto={general} />}
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
        icono={UserRound}
        ayuda="Así te verán como autor de tus cursos."
        autoComplete="name"
        valor={valores.nombre}
        alCambiar={(valor) => cambiar("nombre", valor)}
        error={errores.nombre}
      />
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
        autoComplete="new-password"
        valor={valores.contrasena}
        alCambiar={(valor) => cambiar("contrasena", valor)}
        error={errores.contrasena}
      />
      <CampoContrasena
        id="confirmacion"
        etiqueta="Repite la contraseña"
        autoComplete="new-password"
        valor={valores.confirmacion}
        alCambiar={(valor) => cambiar("confirmacion", valor)}
        error={errores.confirmacion}
      />
      <Boton tipo="submit" icono={Sparkles} enviando={enviando} textoEnviando="Creando cuenta...">
        Crear cuenta
      </Boton>
    </FormularioCuenta>
  );
}
