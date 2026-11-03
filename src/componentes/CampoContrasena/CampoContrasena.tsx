import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import CampoTexto from "../CampoTexto/CampoTexto.tsx";
import estilos from "./CampoContrasena.module.css";

type PropsCampoContrasena = {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
  autoComplete: "current-password" | "new-password";
};

// Contraseña con el botón "Mostrar" / "Ocultar". No se pide escribirla dos
// veces (spec F01), así que hay que poder verla.
export default function CampoContrasena({ autoComplete, ...props }: PropsCampoContrasena) {
  const [visible, setVisible] = useState(false);
  const Icono = visible ? EyeOff : Eye;

  return (
    <CampoTexto
      {...props}
      icono={LockKeyhole}
      tipo={visible ? "text" : "password"}
      autoComplete={autoComplete}
      accesorio={
        <button
          type="button"
          className={estilos.alternar}
          aria-pressed={visible}
          aria-controls={props.id}
          onClick={() => setVisible((v) => !v)}
        >
          <Icono className={estilos.icono} aria-hidden="true" />
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      }
    />
  );
}
