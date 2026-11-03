import { CloudOff, RotateCw } from "lucide-react";
import Boton from "../Boton/Boton.tsx";
import EstadoVacio from "../EstadoVacio/EstadoVacio.tsx";

type PropsErrorCarga = {
  mensaje: string;
  alReintentar: () => void;
};

// No se pudieron traer los datos de una página (o de "Ver más").
export default function ErrorCarga({ mensaje, alReintentar }: PropsErrorCarga) {
  return (
    <EstadoVacio
      icono={CloudOff}
      tono="error"
      titulo={mensaje}
      anunciar
      accion={
        <Boton variante="secundario" icono={RotateCw} alPulsar={alReintentar}>
          Reintentar
        </Boton>
      }
    />
  );
}
