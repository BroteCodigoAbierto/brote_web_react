import estilos from "./MensajeFormulario.module.css";

type PropsMensajeFormulario = {
  texto: string;
  variante?: "error" | "aviso";
};

// Mensaje general arriba de un formulario: un error que no es de un campo
// ("Correo o contraseña incorrectos.") o un aviso ("Tu sesión terminó...").
export default function MensajeFormulario({ texto, variante = "error" }: PropsMensajeFormulario) {
  return (
    <p
      className={`${estilos.mensaje} ${estilos[variante]}`}
      role={variante === "error" ? "alert" : "status"}
    >
      {texto}
    </p>
  );
}
