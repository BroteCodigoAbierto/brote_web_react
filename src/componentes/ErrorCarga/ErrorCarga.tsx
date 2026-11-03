import Boton from "../Boton/Boton.tsx";
import estilos from "./ErrorCarga.module.css";

type PropsErrorCarga = {
  mensaje: string;
  alReintentar: () => void;
};

// No se pudieron traer los datos de una página (o de "Ver más").
export default function ErrorCarga({ mensaje, alReintentar }: PropsErrorCarga) {
  return (
    <div className={estilos.error}>
      <p role="alert" className={estilos.mensaje}>
        {mensaje}
      </p>
      <Boton variante="secundario" alPulsar={alReintentar}>
        Reintentar
      </Boton>
    </div>
  );
}
