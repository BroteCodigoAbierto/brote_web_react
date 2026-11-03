import { Compass } from "lucide-react";
import { Link } from "react-router";
import EstadoVacio from "../../componentes/EstadoVacio/EstadoVacio.tsx";

export default function NoEncontrada() {
  return (
    <section>
      <h1 className="oculto">Página no encontrada</h1>
      <EstadoVacio
        icono={Compass}
        titulo="Página no encontrada"
        texto="Puede que la dirección esté mal escrita o que esta página llegue más adelante."
        accion={<Link to="/">Volver al inicio</Link>}
      />
    </section>
  );
}
