import { Check } from "lucide-react";
import BarraRespuesta from "../../componentes/BarraRespuesta/BarraRespuesta.tsx";
import BloqueCodigo from "../../componentes/BloqueCodigo/BloqueCodigo.tsx";
import ImagenAmpliable from "../../componentes/ImagenAmpliable/ImagenAmpliable.tsx";
import Superficie from "../../componentes/Superficie/Superficie.tsx";
import { useEnfocarAlMontar } from "../../hooks/useEnfocarAlMontar.ts";
import { partirTeoria } from "../../utilidades/actividades.ts";
import comun from "../comun.module.css";
import type { PropsActividad } from "../tipos.ts";
import estilos from "./Teoria.module.css";

// Teoría (spec F03): título, párrafos, código y puntos clave, solo los que
// tenga y en ese orden. "Continuar" está disponible desde el principio. Desde F13, cada
// [imagen] del texto es una imagen, entre párrafos.
export default function Teoria({ actividad, alTerminar }: PropsActividad<"teoria">) {
  const { titulo, texto, codigo, puntosClave, imagenes = [] } = actividad;
  const inicio = useEnfocarAlMontar<HTMLHeadingElement>();

  return (
    <div className={comun.actividad}>
      <Superficie como="article" className={comun.panel}>
        {/* sin título, el foco va a un encabezado que solo oye el lector de pantalla */}
        <h2 ref={inicio} tabIndex={-1} className={titulo ? comun.consigna : "oculto"}>
          {titulo ?? "Teoría"}
        </h2>
        {partirTeoria(texto).map((bloque, i) => {
          if ("parrafo" in bloque) {
            return (
              <p key={i} className={comun.parrafo}>
                {bloque.parrafo}
              </p>
            );
          }
          const imagen = imagenes[bloque.imagen];
          return imagen ? <ImagenAmpliable key={i} imagen={imagen} /> : null;
        })}
        {codigo && <BloqueCodigo codigo={codigo} />}
        {puntosClave && (
          <ul className={estilos.puntos}>
            {puntosClave.map((punto, i) => (
              <li key={i} className={estilos.punto}>
                <Check className={estilos.marca} aria-hidden="true" />
                <span>{punto}</span>
              </li>
            ))}
          </ul>
        )}
      </Superficie>
      <BarraRespuesta
        estado="neutro"
        textoBoton="Continuar"
        alPulsar={() => alTerminar("sinCalificar")}
      />
    </div>
  );
}
