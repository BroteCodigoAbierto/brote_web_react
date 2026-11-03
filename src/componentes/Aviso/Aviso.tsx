import { CircleAlert, CircleCheck, Info, Sparkles, type LucideIcon } from "lucide-react";
import estilos from "./Aviso.module.css";

type Tono = "info" | "exito" | "error" | "calido";

type PropsAviso = {
  texto: string;
  tono?: Tono;
};

const ICONOS: Record<Tono, LucideIcon> = {
  info: Info,
  exito: CircleCheck,
  error: CircleAlert,
  calido: Sparkles,
};

// Mensaje general de un formulario o de una pantalla: un error que no es de
// un campo ("Correo o contraseña incorrectos.") o un aviso ("Tu sesión
// terminó..."). Los errores se anuncian de inmediato.
export default function Aviso({ texto, tono = "error" }: PropsAviso) {
  const Icono = ICONOS[tono];
  return (
    <p className={`${estilos.aviso} ${estilos[tono]}`} role={tono === "error" ? "alert" : "status"}>
      <Icono className={estilos.icono} aria-hidden="true" />
      <span>{texto}</span>
    </p>
  );
}
