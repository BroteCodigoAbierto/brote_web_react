import { LogOut } from "lucide-react";
import Boton from "../../componentes/Boton/Boton.tsx";
import SelectorTema from "../../componentes/SelectorTema/SelectorTema.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useSesion } from "../../hooks/useSesion.ts";
import estilos from "./Cuenta.module.css";

export default function Cuenta() {
  const { usuario, cerrarSesion } = useSesion();
  return (
    <div className={estilos.cuenta}>
      <h1 className={estilos.titulo}>Cuenta</h1>
      <Superficie className={estilos.datos}>
        <h2 className={estilos.nombre}>{usuario?.nombre}</h2>
        <p>{usuario?.correo}</p>
      </Superficie>
      <SelectorTema />
      <div>
        <Boton variante="peligro" icono={LogOut} alPulsar={cerrarSesion}>
          Cerrar sesión
        </Boton>
      </div>
    </div>
  );
}
